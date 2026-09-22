import assert from "node:assert/strict";
import { execFile as execFileCallback } from "node:child_process";
import test from "node:test";
import { promisify } from "node:util";

import {
  assertCandidateDocument,
  calculateConfirmedSeed,
  confirmSeedCandidates,
  fetchWithSignal,
  searchSeedCandidates,
  withProviderDeadline,
  withRetryableProviderRetry,
} from "../scripts/confirm-seed-places.mjs";
import { planAmapLeg, searchAmapPlaces } from "../worker/map/amap.js";
import { calculateRoute as calculateTask4Route } from "../worker/route/calculate.js";

const execFile = promisify(execFileCallback);

const TEST_SOURCE = {
  id: "test-route-five-confirmations",
  title: "测试路线",
  city: "测试城市",
  artist: "测试艺人",
  theme: "测试主题",
  sourceNote: "TEST FIXTURE ONLY: never use as a published route seed.",
  places: Array.from({ length: 5 }, (_, index) => ({
    id: `test-source-${index + 1}`,
    order: index + 1,
    keyword: `测试关键词 ${index + 1}`,
    story: `测试故事 ${index + 1}`,
    checkInTips: [`测试提示 ${index + 1}`],
    imageUrls: [],
  })),
};

function testCandidate(sourcePlace, suffix) {
  return {
    provider: "amap",
    providerPoiId: `test-poi-${sourcePlace.order}-${suffix}`,
    city: TEST_SOURCE.city,
    name: `TEST FIXTURE ONLY 候选 ${sourcePlace.order}-${suffix}`,
    address: `测试地址 ${sourcePlace.order}-${suffix}`,
    district: "测试区",
    category: "测试类别",
    coordinateSystem: "gcj02",
    longitude: 120 + sourcePlace.order / 100,
    latitude: 30 + suffix / 100,
  };
}

async function testCandidateSets() {
  return searchSeedCandidates(TEST_SOURCE, {
    async searchPlaces({ keyword, city }) {
      const sourcePlace = TEST_SOURCE.places.find((place) => place.keyword === keyword);
      assert.equal(city, TEST_SOURCE.city);
      return [testCandidate(sourcePlace, 1), testCandidate(sourcePlace, 2)];
    },
  });
}

async function confirmedTestBundle(candidateSets) {
  const resolvedCandidateSets = candidateSets ?? await testCandidateSets();
  return confirmSeedCandidates(
    TEST_SOURCE,
    resolvedCandidateSets,
    resolvedCandidateSets.map((set) => set.candidates[0].providerPoiId),
  );
}

function validLegs(places) {
  return places.slice(1).map((to, index) => ({
    id: `${places[index].id}:${to.id}:walk`,
    fromPlaceId: places[index].id,
    toPlaceId: to.id,
    mode: "walk",
    distanceMeters: 100 + index,
    durationSeconds: 60 + index,
    provider: "amap",
    computedAt: "2026-09-17T00:00:00.000Z",
    dataStatus: "fresh",
  }));
}

test("searchSeedCandidates keeps five source keywords and provider candidate order", async () => {
  const candidateSets = await testCandidateSets();

  assert.deepEqual(candidateSets.map((set) => set.sourcePlaceId), [
    "test-source-1",
    "test-source-2",
    "test-source-3",
    "test-source-4",
    "test-source-5",
  ]);
  assert.deepEqual(candidateSets[0].candidates.map((candidate) => candidate.providerPoiId), [
    "test-poi-1-1",
    "test-poi-1-2",
  ]);
});

test("searchSeedCandidates rejects a provider response outside the one-to-ten candidate limit", async () => {
  await assert.rejects(
    searchSeedCandidates(TEST_SOURCE, {
      async searchPlaces({ keyword }) {
        const sourcePlace = TEST_SOURCE.places.find((place) => place.keyword === keyword);
        return Array.from({ length: 11 }, (_, index) => testCandidate(sourcePlace, index + 1));
      },
    }),
    /1 to 10/i,
  );
});

test("confirmSeedCandidates requires five unique selections from their matching candidate sets", async () => {
  const candidateSets = await testCandidateSets();
  const selectedPoiIds = candidateSets.map((set) => set.candidates[0].providerPoiId);
  const bundle = confirmSeedCandidates(TEST_SOURCE, candidateSets, selectedPoiIds);

  assert.deepEqual(bundle.route.stops.map((stop) => stop.placeId), selectedPoiIds.map((id) => `amap-${encodeURIComponent(id)}`));
  assert.deepEqual(Object.values(bundle.places).map((place) => place.verificationStatus), [
    "confirmed",
    "confirmed",
    "confirmed",
    "confirmed",
    "confirmed",
  ]);
  assert.equal(bundle.route.legs.length, 0);
  assert.equal(bundle.route.stops[0].story, TEST_SOURCE.places[0].story);
  assert.deepEqual(bundle.places[`amap-${encodeURIComponent(selectedPoiIds[0])}`], {
    ...testCandidate(TEST_SOURCE.places[0], 1),
    id: `amap-${encodeURIComponent(selectedPoiIds[0])}`,
    verificationStatus: "confirmed",
  });
});

test("confirmSeedCandidates rejects missing, duplicate, cross-group, and extra selections", async () => {
  const candidateSets = await testCandidateSets();
  const selectedPoiIds = candidateSets.map((set) => set.candidates[0].providerPoiId);

  assert.throws(
    () => confirmSeedCandidates(TEST_SOURCE, candidateSets, selectedPoiIds.slice(0, 4)),
    /five/i,
  );
  assert.throws(
    () => confirmSeedCandidates(TEST_SOURCE, candidateSets, [selectedPoiIds[0], ...selectedPoiIds.slice(0, 4)]),
    /unique/i,
  );
  assert.throws(
    () => confirmSeedCandidates(TEST_SOURCE, candidateSets, [selectedPoiIds[1], selectedPoiIds[0], ...selectedPoiIds.slice(2)]),
    /matching candidate set/i,
  );
  assert.throws(
    () => confirmSeedCandidates(TEST_SOURCE, candidateSets, [...selectedPoiIds, "test-extra-poi"]),
    /five/i,
  );
});

test("confirmSeedCandidates rejects stale candidate keywords, another city, and out-of-range coordinates", async () => {
  const candidateSets = await testCandidateSets();
  const selectedPoiIds = candidateSets.map((set) => set.candidates[0].providerPoiId);
  const staleKeywordSets = candidateSets.map((set, index) => index === 0 ? { ...set, keyword: "过期测试关键词" } : set);
  const wrongCitySets = candidateSets.map((set, index) => index === 0
    ? { ...set, candidates: [{ ...set.candidates[0], city: "另一个测试城市" }, ...set.candidates.slice(1)] }
    : set);
  const outOfRangeSets = candidateSets.map((set, index) => index === 0
    ? { ...set, candidates: [{ ...set.candidates[0], longitude: 181 }, ...set.candidates.slice(1)] }
    : set);

  assert.throws(() => confirmSeedCandidates(TEST_SOURCE, staleKeywordSets, selectedPoiIds), /keyword/i);
  assert.throws(() => confirmSeedCandidates(TEST_SOURCE, wrongCitySets, selectedPoiIds), /city/i);
  assert.throws(() => confirmSeedCandidates(TEST_SOURCE, outOfRangeSets, selectedPoiIds), /coordinates/i);
});

test("assertCandidateDocument rejects a candidate document for a different source route", async () => {
  const candidateSets = await testCandidateSets();

  assert.throws(
    () => assertCandidateDocument(TEST_SOURCE, { routeId: "test-stale-route", candidateSets }),
    /routeId/i,
  );
});

test("calculateConfirmedSeed builds four deterministic legs and route totals from the injected planner", async () => {
  const candidateSets = await testCandidateSets();
  const selectedPoiIds = candidateSets.map((set) => set.candidates[0].providerPoiId);
  const uncalculatedBundle = confirmSeedCandidates(TEST_SOURCE, candidateSets, selectedPoiIds);
  const bundle = await calculateConfirmedSeed(uncalculatedBundle, {
    async calculateRoute({ places }) {
      return {
        legs: places.slice(1).map((to, index) => ({
          id: `${places[index].id}:${to.id}:walk`,
          fromPlaceId: places[index].id,
          toPlaceId: to.id,
          mode: "walk",
          distanceMeters: 100 + index,
          durationSeconds: 60 + index,
          provider: "amap",
          computedAt: "2026-09-17T00:00:00.000Z",
          dataStatus: "fresh",
        })),
        transportDistanceMeters: 406,
        transportDurationSeconds: 246,
      };
    },
  });

  assert.equal(bundle.route.legs.length, 4);
  assert.equal(bundle.route.transportDistanceMeters, 406);
  assert.equal(bundle.route.transportDurationSeconds, 246);
  assert.deepEqual(bundle, await calculateConfirmedSeed(uncalculatedBundle, {
    async calculateRoute({ places }) {
      return {
        legs: places.slice(1).map((to, index) => ({
          id: `${places[index].id}:${to.id}:walk`,
          fromPlaceId: places[index].id,
          toPlaceId: to.id,
          mode: "walk",
          distanceMeters: 100 + index,
          durationSeconds: 60 + index,
          provider: "amap",
          computedAt: "2026-09-17T00:00:00.000Z",
          dataStatus: "fresh",
        })),
        transportDistanceMeters: 406,
        transportDurationSeconds: 246,
      };
    },
  }));
});

test("calculateConfirmedSeed preserves unavailable null metrics instead of estimates", async () => {
  const candidateSets = await testCandidateSets();
  const selectedPoiIds = candidateSets.map((set) => set.candidates[0].providerPoiId);
  const uncalculatedBundle = confirmSeedCandidates(TEST_SOURCE, candidateSets, selectedPoiIds);
  const bundle = await calculateConfirmedSeed(uncalculatedBundle, {
    async calculateRoute({ places }) {
      return {
        legs: places.slice(1).map((to, index) => ({
          id: `${places[index].id}:${to.id}:walk`,
          fromPlaceId: places[index].id,
          toPlaceId: to.id,
          mode: "walk",
          distanceMeters: null,
          durationSeconds: null,
          provider: "amap",
          computedAt: null,
          dataStatus: "unavailable",
        })),
        transportDistanceMeters: null,
        transportDurationSeconds: null,
      };
    },
  });

  assert.equal(bundle.route.transportDistanceMeters, null);
  assert.equal(bundle.route.transportDurationSeconds, null);
  assert.ok(bundle.route.legs.every((leg) => leg.dataStatus === "unavailable"));
  assert.ok(bundle.route.legs.every((leg) => leg.distanceMeters === null && leg.durationSeconds === null));
});

test("calculateConfirmedSeed keeps an affected unavailable leg while making the route summary null", async () => {
  const uncalculatedBundle = await confirmedTestBundle();
  const bundle = await calculateConfirmedSeed(uncalculatedBundle, {
    async calculateRoute({ places }) {
      const legs = validLegs(places);
      legs[2] = {
        ...legs[2],
        distanceMeters: null,
        durationSeconds: null,
        computedAt: null,
        dataStatus: "unavailable",
      };
      return { legs, transportDistanceMeters: 999999, transportDurationSeconds: 999999 };
    },
  });

  assert.deepEqual(bundle.route.legs.map((leg) => leg.dataStatus), ["fresh", "fresh", "unavailable", "fresh"]);
  assert.equal(bundle.route.legs[1].distanceMeters, 101);
  assert.equal(bundle.route.legs[2].distanceMeters, null);
  assert.equal(bundle.route.transportDistanceMeters, null);
  assert.equal(bundle.route.transportDurationSeconds, null);
  assert.equal(bundle.route.suggestedTotalMinutes, null);
});

test("calculateConfirmedSeed rejects malformed route legs instead of silently marking them unavailable", async () => {
  const uncalculatedBundle = await confirmedTestBundle();
  const invalidLegs = [
    ["mode", (legs) => { legs[0].mode = "walking"; }, /mode/i],
    ["provider", (legs) => { legs[0].provider = "other"; }, /provider/i],
    ["status", (legs) => { legs[0].dataStatus = "stale"; }, /dataStatus/i],
    ["id", (legs) => { legs[0].id = "wrong-leg-id"; }, /id/i],
    ["adjacency", (legs) => { legs[0].toPlaceId = legs[1].toPlaceId; }, /adjacent/i],
    ["negative metrics", (legs) => { legs[0].distanceMeters = -1; }, /metrics/i],
    ["non-finite metrics", (legs) => { legs[0].durationSeconds = Number.POSITIVE_INFINITY; }, /metrics/i],
    ["computedAt", (legs) => { legs[0].computedAt = "not-a-timestamp"; }, /computedAt/i],
  ];

  for (const [, mutate, expected] of invalidLegs) {
    await assert.rejects(
      calculateConfirmedSeed(uncalculatedBundle, {
        async calculateRoute({ places }) {
          const legs = validLegs(places);
          mutate(legs);
          return { legs };
        },
      }),
      expected,
    );
  }
});

test("confirmed encoded Place IDs keep provider IDs intact and work with the Task 4 calculator", async () => {
  const candidateSets = await testCandidateSets();
  const colonCandidateSets = candidateSets.map((set, index) => ({
    ...set,
    candidates: set.candidates.map((candidate, candidateIndex) => ({
      ...candidate,
      providerPoiId: `test:poi:${index + 1}:${candidateIndex + 1}`,
    })),
  }));
  const selectedPoiIds = colonCandidateSets.map((set) => set.candidates[0].providerPoiId);
  const uncalculatedBundle = confirmSeedCandidates(TEST_SOURCE, colonCandidateSets, selectedPoiIds);
  const bundle = await calculateConfirmedSeed(uncalculatedBundle, {
    calculateRoute: ({ places, preferredModes }) => calculateTask4Route({ places, preferredModes }, {
      async planLeg({ from, to, mode }) {
        return {
          id: `${from.id}:${to.id}:${mode}`,
          fromPlaceId: from.id,
          toPlaceId: to.id,
          mode,
          distanceMeters: 100,
          durationSeconds: 60,
          provider: "amap",
          computedAt: "2026-09-17T00:00:00.000Z",
          dataStatus: "fresh",
        };
      },
    }),
  });

  assert.equal(bundle.places[`amap-${encodeURIComponent(selectedPoiIds[0])}`].providerPoiId, selectedPoiIds[0]);
  assert.ok(bundle.route.legs.every((leg) => leg.dataStatus === "fresh"));
  assert.equal(bundle.route.legs.length, 4);
});

test("withProviderDeadline covers a provider response body that never resolves", async () => {
  let fireDeadline;
  let cleared = false;
  let responseJsonStarted;
  const responseBodyStarted = new Promise((resolve) => { responseJsonStarted = resolve; });
  const pending = withProviderDeadline(
    () => searchAmapPlaces({ keyword: "测试关键词", city: TEST_SOURCE.city }, {
      key: "test-key",
      async fetchImpl() {
        return {
          ok: true,
          status: 200,
          async json() {
            responseJsonStarted();
            return new Promise(() => {});
          },
        };
      },
    }),
    {
      timeoutMs: 10,
      setTimeoutImpl(callback) {
        fireDeadline = callback;
        return "test-deadline";
      },
      clearTimeoutImpl() {
        cleared = true;
      },
    },
  );

  await responseBodyStarted;
  fireDeadline();
  await assert.rejects(pending, /timed out/i);
  assert.equal(cleared, true);
});

test("provider deadline aborts the candidate fetch signal while its response body is pending", async () => {
  let fireDeadline;
  let operationSignal;
  let requestSignal;
  let responseJsonStarted;
  const responseBodyStarted = new Promise((resolve) => { responseJsonStarted = resolve; });
  const pending = withProviderDeadline(
    (signal) => {
      operationSignal = signal;
      return searchAmapPlaces({ keyword: "测试关键词", city: TEST_SOURCE.city }, {
        key: "test-key",
        fetchImpl: fetchWithSignal(signal, async (request) => {
          requestSignal = request.signal;
          return {
            ok: true,
            status: 200,
            async json() {
              responseJsonStarted();
              return new Promise(() => {});
            },
          };
        }),
      });
    },
    {
      timeoutMs: 10,
      setTimeoutImpl(callback) {
        fireDeadline = callback;
        return "candidate-abort-deadline";
      },
      clearTimeoutImpl() {},
    },
  );

  await responseBodyStarted;
  assert.equal(operationSignal.aborted, false);
  assert.equal(requestSignal.aborted, false);
  fireDeadline();
  await assert.rejects(pending, /timed out/i);
  assert.equal(operationSignal.aborted, true);
  assert.equal(requestSignal.aborted, true);
});

test("provider deadline aborts the route-planning fetch signal while its response body is pending", async () => {
  let fireDeadline;
  let operationSignal;
  let requestSignal;
  let responseJsonStarted;
  const responseBodyStarted = new Promise((resolve) => { responseJsonStarted = resolve; });
  const pending = withProviderDeadline(
    (signal) => {
      operationSignal = signal;
      return planAmapLeg({
        city: TEST_SOURCE.city,
        mode: "walking",
        from: { id: "test-from", longitude: 120.1, latitude: 30.1 },
        to: { id: "test-to", longitude: 120.2, latitude: 30.2 },
      }, {
        key: "test-key",
        now: () => new Date("2026-09-17T00:00:00.000Z"),
        fetchImpl: fetchWithSignal(signal, async (request) => {
          requestSignal = request.signal;
          return {
            ok: true,
            status: 200,
            async json() {
              responseJsonStarted();
              return new Promise(() => {});
            },
          };
        }),
      });
    },
    {
      timeoutMs: 10,
      setTimeoutImpl(callback) {
        fireDeadline = callback;
        return "route-abort-deadline";
      },
      clearTimeoutImpl() {},
    },
  );

  await responseBodyStarted;
  assert.equal(operationSignal.aborted, false);
  assert.equal(requestSignal.aborted, false);
  fireDeadline();
  await assert.rejects(pending, /timed out/i);
  assert.equal(operationSignal.aborted, true);
  assert.equal(requestSignal.aborted, true);
});

test("searchSeedCandidates propagates its injected provider deadline without producing a candidate result", async () => {
  let fireDeadline;
  const pending = searchSeedCandidates(TEST_SOURCE, {
    searchPlaces() {
      return new Promise(() => {});
    },
    withDeadline(operation) {
      return withProviderDeadline(operation, {
        timeoutMs: 10,
        setTimeoutImpl(callback) {
          fireDeadline = callback;
          return "candidate-deadline";
        },
        clearTimeoutImpl() {},
      });
    },
  });

  await Promise.resolve();
  fireDeadline();
  await assert.rejects(pending, /timed out/i);
});

test("candidate generation never reaches its write step after a provider deadline", async () => {
  let fireDeadline;
  let writeCalls = 0;
  const pending = (async () => {
    const candidateSets = await searchSeedCandidates(TEST_SOURCE, {
      searchPlaces() {
        return new Promise(() => {});
      },
      withDeadline(operation) {
        return withProviderDeadline(operation, {
          timeoutMs: 10,
          setTimeoutImpl(callback) {
            fireDeadline = callback;
            return "candidate-write-deadline";
          },
          clearTimeoutImpl() {},
        });
      },
    });
    writeCalls += 1;
    return candidateSets;
  })();

  await Promise.resolve();
  fireDeadline();
  await assert.rejects(pending, /timed out/i);
  assert.equal(writeCalls, 0);
});

test("seed generation retries one retryable provider failure after a bounded delay", async () => {
  let attempts = 0;
  const delays = [];
  const result = await withRetryableProviderRetry(async () => {
    attempts += 1;
    if (attempts === 1) {
      const error = new Error("TEST FIXTURE ONLY rate limit");
      error.retryable = true;
      throw error;
    }
    return "test-success";
  }, {
    sleep: async (milliseconds) => { delays.push(milliseconds); },
  });

  assert.equal(result, "test-success");
  assert.equal(attempts, 2);
  assert.deepEqual(delays, [1_100]);
});

test("seed generation does not retry a non-retryable provider failure", async () => {
  let attempts = 0;
  await assert.rejects(
    withRetryableProviderRetry(async () => {
      attempts += 1;
      const error = new Error("TEST FIXTURE ONLY invalid input");
      error.retryable = false;
      throw error;
    }, {
      sleep: async () => { throw new Error("sleep must not run"); },
    }),
    /invalid input/i,
  );
  assert.equal(attempts, 1);
});

test("seed generation retries a provider deadline once and remains bounded", async () => {
  let attempts = 0;
  await assert.rejects(
    withRetryableProviderRetry(
      () => {
        attempts += 1;
        return withProviderDeadline(
          () => new Promise(() => {}),
          {
            timeoutMs: 1,
            setTimeoutImpl(callback) {
              queueMicrotask(callback);
              return "test-retry-deadline";
            },
            clearTimeoutImpl() {},
          },
        );
      },
      { maxAttempts: 2, delayMs: 0, sleep: async () => {} },
    ),
    (error) => error.code === "PROVIDER_TIMEOUT" && error.retryable === true,
  );
  assert.equal(attempts, 2);
});

test("seed CLI refuses missing map credentials and missing confirmation selections", async () => {
  await assert.rejects(
    execFile(process.execPath, ["scripts/confirm-seed-places.mjs", "candidates"], {
      cwd: new URL("..", import.meta.url),
      env: { ...process.env, AMAP_WEB_SERVICE_KEY: "" },
    }),
    (error) => /AMAP_WEB_SERVICE_KEY/.test(error.stderr),
  );
  await assert.rejects(
    execFile(process.execPath, ["scripts/confirm-seed-places.mjs", "confirm"], {
      cwd: new URL("..", import.meta.url),
    }),
    (error) => /--selections/.test(error.stderr),
  );
});
