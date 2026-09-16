import assert from "node:assert/strict";
import test from "node:test";

import { createMapCache } from "../worker/map/cache.js";
import {
  affectedPairs,
  calculateRoute,
  recalculateRoute,
} from "../worker/route/calculate.js";

class MemoryCache {
  #responses = new Map();

  async match(request) {
    return this.#responses.get(request.url)?.clone();
  }

  async put(request, response) {
    this.#responses.set(request.url, response.clone());
  }
}

function place(id) {
  return {
    id,
    providerPoiId: `amap-${id}`,
    city: "测试城市",
    coordinateSystem: "gcj02",
    longitude: 118.79,
    latitude: 32.02,
  };
}

function freshLeg({ from, to, mode, distanceMeters, durationSeconds, computedAt = "2026-09-16T08:00:00.000Z" }) {
  return {
    id: `${from.id}:${to.id}:${mode}`,
    fromPlaceId: from.id,
    toPlaceId: to.id,
    mode,
    distanceMeters,
    durationSeconds,
    provider: "amap",
    computedAt,
    dataStatus: "fresh",
  };
}

function plannerByPair(results, calls) {
  return async ({ from, to, mode }) => {
    calls.push(`${from.id}:${to.id}:${mode}`);
    const result = results[`${from.id}:${to.id}:${mode}`];
    if (result instanceof Error) throw result;
    return freshLeg({ from, to, mode, ...result });
  };
}

test("calculates walking first and only selects transit above a strict threshold", async () => {
  const calls = [];
  const places = [place("A"), place("B"), place("C")];
  const result = await calculateRoute(
    { places, preferredModes: ["transit"] },
    {
      planLeg: plannerByPair(
        {
          "A:B:walk": { distanceMeters: 2000, durationSeconds: 1800 },
          "B:C:walk": { distanceMeters: 2200, durationSeconds: 1200 },
          "B:C:transit": { distanceMeters: 2600, durationSeconds: 600 },
        },
        calls,
      ),
      cache: createMapCache(new MemoryCache(), "https://worker.test"),
    },
  );

  assert.deepEqual(calls, ["A:B:walk", "B:C:walk", "B:C:transit"]);
  assert.deepEqual(result.legs.map((leg) => leg.mode), ["walk", "transit"]);
  assert.equal(result.transportDistanceMeters, 4600);
  assert.equal(result.transportDurationSeconds, 2400);
});

test("reports changed adjacent pairs in their new route order", () => {
  assert.deepEqual(
    affectedPairs(["A", "B", "C", "D"], ["A", "C", "D"]),
    ["A:C"],
  );
  assert.deepEqual(
    affectedPairs(["A", "B", "C"], ["A", "D", "B", "C"]),
    ["A:D", "D:B"],
  );
});

test("recalculates only changed legs, preserves unchanged computedAt, and is idempotent", async () => {
  const calls = [];
  const places = [place("A"), place("C"), place("D")];
  const previous = {
    id: "route-1",
    version: 4,
    legs: [
      freshLeg({ from: place("A"), to: place("B"), mode: "walk", distanceMeters: 300, durationSeconds: 240 }),
      freshLeg({ from: place("B"), to: place("C"), mode: "walk", distanceMeters: 400, durationSeconds: 300 }),
      freshLeg({ from: place("C"), to: place("D"), mode: "walk", distanceMeters: 500, durationSeconds: 360, computedAt: "2026-09-01T00:00:00.000Z" }),
    ],
    orderedPlaceIds: ["A", "B", "C", "D"],
  };
  const dependencies = {
    planLeg: plannerByPair(
      {
        "A:C:walk": { distanceMeters: 900, durationSeconds: 700 },
      },
      calls,
    ),
    cache: createMapCache(new MemoryCache(), "https://worker.test"),
    idempotencyStore: new Map(),
  };

  const input = { previous, places, idempotencyKey: "save-001" };
  const first = await recalculateRoute(input, dependencies);
  const second = await recalculateRoute(input, dependencies);

  assert.deepEqual(calls, ["A:C:walk"]);
  assert.equal(first.version, 5);
  assert.strictEqual(second, first);
  assert.equal(first.legs[1].computedAt, "2026-09-01T00:00:00.000Z");
});

test("coalesces concurrent recalculations with the same idempotency key", async () => {
  const from = place("A");
  const to = place("B");
  let calls = 0;
  let releasePlanning;
  const planningGate = new Promise((resolve) => {
    releasePlanning = resolve;
  });
  const previous = {
    id: "route-concurrent",
    version: 9,
    orderedPlaceIds: ["A", "C", "B"],
    legs: [
      freshLeg({ from, to: place("C"), mode: "walk", distanceMeters: 150, durationSeconds: 120 }),
      freshLeg({ from: place("C"), to, mode: "walk", distanceMeters: 250, durationSeconds: 180 }),
    ],
  };
  const dependencies = {
    cache: createMapCache(new MemoryCache(), "https://worker.test"),
    idempotencyStore: new Map(),
    planLeg: async (input) => {
      calls += 1;
      await planningGate;
      return freshLeg({ ...input, distanceMeters: 300, durationSeconds: 240 });
    },
  };
  const input = {
    previous,
    places: [from, to],
    idempotencyKey: "save-concurrent",
  };

  const pending = Promise.all([
    recalculateRoute(input, dependencies),
    recalculateRoute(input, dependencies),
  ]);
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(calls, 1);
  releasePlanning();
  const [first, second] = await pending;
  assert.equal(first.version, 10);
  assert.strictEqual(second, first);
});

test("uses a cache key scoped to route type, POI ids, and mode", async () => {
  const cache = createMapCache(new MemoryCache(), "https://worker.test/cache");
  const key = cache.key({
    interfaceType: "route",
    fromPoiId: "B001",
    toPoiId: "B002",
    mode: "walk",
  });

  assert.equal(
    key,
    "https://worker.test/cache/map/route/B001/B002/walk",
  );
});

test("returns cached measurements after a provider failure and unavailable null metrics without a cache", async () => {
  const cachedFrom = place("A");
  const cachedTo = place("B");
  const cachedLeg = freshLeg({ from: cachedFrom, to: cachedTo, mode: "walk", distanceMeters: 320, durationSeconds: 260 });
  let fallbackReadCount = 0;
  let plannerCalls = 0;
  const fallbackCache = {
    async read() {
      fallbackReadCount += 1;
      return fallbackReadCount === 2 ? { ...cachedLeg, dataStatus: "cached" } : null;
    },
    async write() {},
  };

  const cached = await calculateRoute(
    { places: [cachedFrom, cachedTo], preferredModes: [] },
    {
      cache: fallbackCache,
      planLeg: async () => {
        plannerCalls += 1;
        throw new Error("provider unavailable");
      },
    },
  );
  const unavailable = await calculateRoute(
    { places: [place("C"), place("D")], preferredModes: [] },
    {
      cache: { async read() { return null; }, async write() {} },
      planLeg: async () => {
        throw new Error("provider unavailable");
      },
    },
  );

  assert.equal(fallbackReadCount, 2);
  assert.equal(plannerCalls, 1);
  assert.equal(cached.legs[0].dataStatus, "cached");
  assert.equal(cached.legs[0].distanceMeters, 320);
  assert.equal(unavailable.legs[0].dataStatus, "unavailable");
  assert.equal(unavailable.legs[0].distanceMeters, null);
  assert.equal(unavailable.legs[0].durationSeconds, null);
});
