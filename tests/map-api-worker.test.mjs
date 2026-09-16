import assert from "node:assert/strict";
import test from "node:test";

import { createApiHandler } from "../worker/api.js";
import { createWorker } from "../worker/index.js";
import { jsonRequest, readJson } from "./test-helpers.mjs";

const KEY = "task-five-key-must-never-leak";
const NOW = () => new Date("2026-09-16T08:00:00.000Z");
const POI = {
  id: "fixture-poi-001",
  name: "测试地点",
  address: "测试路 1 号",
  adname: "测试区",
  type: "测试分类",
  location: "118.790112,32.020077",
};

class MemoryCache {
  #responses = new Map();

  async match(request) {
    return this.#responses.get(request.url)?.clone();
  }

  async put(request, response) {
    this.#responses.set(request.url, response.clone());
  }
}

function upstreamResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function confirmedPlace(id, { city = "测试市", longitude = 118.790112, latitude = 32.020077 } = {}) {
  return {
    id: `amap-fixture-${id}`,
    provider: "amap",
    providerPoiId: `fixture-${id}`,
    city,
    name: `测试地点 ${id}`,
    address: "测试路 1 号",
    district: "测试区",
    category: "测试分类",
    coordinateSystem: "gcj02",
    longitude,
    latitude,
    verificationStatus: "confirmed",
  };
}

function placeStore(...places) {
  return new Map(places.map((place) => [place.id, place]));
}

function createHandler(fetchImpl, overrides = {}) {
  return createApiHandler({
    amapKey: KEY,
    fetchImpl,
    cacheStorage: new MemoryCache(),
    now: NOW,
    confirmedPlaceStore: new Map(),
    routeStore: new Map(),
    createRouteId: () => "route-test",
    ...overrides,
  });
}

function assertJson(response, status) {
  assert.equal(response.status, status);
  assert.match(response.headers.get("content-type") ?? "", /^application\/json/);
}

function assertSafeError(body, code, retryable = false) {
  assert.equal(body.error.code, code);
  assert.equal(body.error.retryable, retryable);
  const serialized = JSON.stringify(body);
  for (const forbidden of [KEY, "restapi.amap.com", "cause", "stack"]) {
    assert.equal(serialized.includes(forbidden), false);
  }
}

test("searches normalized POI candidates through the JSON API", async () => {
  const handler = createHandler(async (request) => {
    const url = new URL(request.url);
    assert.equal(url.pathname, "/v5/place/text");
    assert.equal(url.searchParams.get("keywords"), "测试地点");
    assert.equal(url.searchParams.get("city"), "测试市");
    return upstreamResponse({ status: "1", pois: [POI] });
  });

  const response = await handler(jsonRequest("/api/places/search?keyword=测试地点&city=测试市"));

  assertJson(response, 200);
  assert.equal((await readJson(response))[0].providerPoiId, "fixture-poi-001");
});

test("confirms a POI server-side, creates its stable ID, and stores no client coordinates", async () => {
  const store = new Map();
  const handler = createHandler(async (request) => {
    assert.equal(new URL(request.url).searchParams.get("keywords"), "fixture-poi-001");
    return upstreamResponse({ status: "1", pois: [POI] });
  }, { confirmedPlaceStore: store });

  const response = await handler(jsonRequest("/api/places/confirm", {
    method: "POST",
    body: { providerPoiId: "fixture-poi-001", city: "测试市", longitude: 0, latitude: 0 },
  }));

  assertJson(response, 200);
  const place = await readJson(response);
  assert.equal(place.id, "amap-fixture-poi-001");
  assert.equal(place.longitude, 118.790112);
  assert.equal(place.latitude, 32.020077);
  assert.deepEqual(store.get("amap-fixture-poi-001"), place);
});

test("calculates route legs from stored confirmed Place IDs only", async () => {
  const from = confirmedPlace("A");
  const to = confirmedPlace("B");
  const handler = createHandler(async (request) => {
    assert.equal(new URL(request.url).pathname, "/v5/direction/walking");
    return upstreamResponse({ status: "1", route: { paths: [{ distance: "820", duration: "700" }] } });
  }, { confirmedPlaceStore: placeStore(from, to) });

  const response = await handler(jsonRequest("/api/routes/calculate", {
    method: "POST",
    body: { placeIds: [from.id, to.id], preferredModes: [] },
  }));

  assertJson(response, 200);
  const body = await readJson(response);
  assert.equal(body.legs[0].fromPlaceId, from.id);
  assert.equal(body.legs[0].toPlaceId, to.id);
  assert.equal(body.legs[0].distanceMeters, 820);
});

test("keeps confirmed POIs for the lifetime of one Worker", async () => {
  const worker = createWorker({
    cacheStorage: new MemoryCache(),
    now: NOW,
    fetchImpl: async (request) => {
      const url = new URL(request.url);
      if (url.pathname === "/v5/place/text") {
        const id = url.searchParams.get("keywords");
        return upstreamResponse({ status: "1", pois: [{ ...POI, id, name: id }] });
      }
      return upstreamResponse({ status: "1", route: { paths: [{ distance: "820", duration: "700" }] } });
    },
  });
  const env = { AMAP_WEB_SERVICE_KEY: KEY, ASSETS: { fetch: async () => new Response("unexpected", { status: 500 }) } };
  const confirmed = [];

  for (const providerPoiId of ["fixture-a", "fixture-b"]) {
    const response = await worker.fetch(jsonRequest("/api/places/confirm", {
      method: "POST",
      body: { providerPoiId, city: "测试市" },
    }), env);
    confirmed.push(await readJson(response));
  }
  const calculated = await worker.fetch(jsonRequest("/api/routes/calculate", {
    method: "POST",
    body: { placeIds: confirmed.map((place) => place.id), preferredModes: [] },
  }), env);

  assertJson(calculated, 200);
  assert.equal((await readJson(calculated)).legs[0].distanceMeters, 820);
});

test("recalculates from a server-stored route version instead of client leg data", async () => {
  const from = confirmedPlace("A");
  const removed = confirmedPlace("B");
  const to = confirmedPlace("C");
  const handler = createHandler(async () => upstreamResponse({
    status: "1", route: { paths: [{ distance: "900", duration: "720" }] },
  }), { confirmedPlaceStore: placeStore(from, removed, to) });
  const initialResponse = await handler(jsonRequest("/api/routes/calculate", {
    method: "POST",
    body: {
      placeIds: [from.id, removed.id, to.id],
      preferredModes: [],
    },
  }));
  const initial = await readJson(initialResponse);
  const response = await handler(jsonRequest("/api/routes/recalculate", {
    method: "POST",
    body: {
      routeId: initial.id,
      baseVersion: initial.version,
      placeIds: [from.id, to.id],
      idempotencyKey: "drag-001",
      previous: { legs: [{ distanceMeters: 1, durationSeconds: 1 }] },
    },
  }));

  assertJson(response, 400);
  assertSafeError(await readJson(response), "INVALID_ROUTE_INPUT");

  const validResponse = await handler(jsonRequest("/api/routes/recalculate", {
    method: "POST",
    body: {
      routeId: initial.id,
      baseVersion: initial.version,
      placeIds: [from.id, to.id],
      idempotencyKey: "drag-001",
    },
  }));
  assertJson(validResponse, 200);
  const body = await readJson(validResponse);
  assert.equal(body.version, 2);
  assert.equal(body.id, initial.id);
  assert.deepEqual(body.orderedPlaceIds, [from.id, to.id]);
  assert.equal(body.legs[0].distanceMeters, 900);

  const exactRetry = await handler(jsonRequest("/api/routes/recalculate", {
    method: "POST",
    body: {
      routeId: initial.id,
      baseVersion: initial.version,
      placeIds: [from.id, to.id],
      idempotencyKey: "drag-001",
    },
  }));
  assertJson(exactRetry, 200);
  assert.deepEqual(await readJson(exactRetry), body);

  const staleEdit = await handler(jsonRequest("/api/routes/recalculate", {
    method: "POST",
    body: {
      routeId: initial.id,
      baseVersion: initial.version,
      placeIds: [from.id, removed.id],
      idempotencyKey: "drag-stale",
    },
  }));
  assertJson(staleEdit, 409);
  assertSafeError(await readJson(staleEdit), "ROUTE_VERSION_CONFLICT");
});

test("atomically rejects a different edit while the base version is being recalculated", async () => {
  const from = confirmedPlace("A");
  const middle = confirmedPlace("B");
  const to = confirmedPlace("C");
  let holdProvider = false;
  let releaseProvider;
  let markProviderStarted;
  const providerGate = new Promise((resolve) => {
    releaseProvider = resolve;
  });
  const providerStarted = new Promise((resolve) => {
    markProviderStarted = resolve;
  });
  const handler = createHandler(async () => {
    if (holdProvider) {
      markProviderStarted();
      await providerGate;
    }
    return upstreamResponse({ status: "1", route: { paths: [{ distance: "900", duration: "720" }] } });
  }, { confirmedPlaceStore: placeStore(from, middle, to) });
  const initial = await readJson(await handler(jsonRequest("/api/routes/calculate", {
    method: "POST",
    body: { placeIds: [from.id, middle.id, to.id], preferredModes: [] },
  })));
  holdProvider = true;

  const firstEdit = handler(jsonRequest("/api/routes/recalculate", {
    method: "POST",
    body: {
      routeId: initial.id,
      baseVersion: initial.version,
      placeIds: [from.id, to.id],
      idempotencyKey: "edit-first",
    },
  }));
  await providerStarted;
  const competingEdit = await handler(jsonRequest("/api/routes/recalculate", {
    method: "POST",
    body: {
      routeId: initial.id,
      baseVersion: initial.version,
      placeIds: [from.id, middle.id],
      idempotencyKey: "edit-second",
    },
  }));

  assertJson(competingEdit, 409);
  assertSafeError(await readJson(competingEdit), "ROUTE_VERSION_CONFLICT");
  releaseProvider();
  const committed = await firstEdit;
  assertJson(committed, 200);
  assert.equal((await readJson(committed)).version, 2);
});

test("rejects untrusted route data and malformed route input before provider I/O", async () => {
  const from = confirmedPlace("A");
  const to = confirmedPlace("B");
  const otherCity = confirmedPlace("C", { city: "另一城市" });
  const invalidCoordinate = confirmedPlace("D", { longitude: 181 });
  let providerCalls = 0;
  const handler = createHandler(async () => {
    providerCalls += 1;
    return upstreamResponse({ status: "1", route: { paths: [{ distance: "820", duration: "700" }] } });
  }, { confirmedPlaceStore: placeStore(from, to, otherCity, invalidCoordinate) });
  const valid = [from.id, to.id];
  const cases = [
    { placeIds: "not-an-array" },
    { placeIds: [] },
    { placeIds: [from.id] },
    { placeIds: [from.id, from.id] },
    { placeIds: Array.from({ length: 21 }, (_, index) => `amap-fixture-${index}`) },
    { placeIds: valid, places: [confirmedPlace("forged")] },
    { placeIds: [from.id, "amap-unknown"] },
    { placeIds: [from.id, otherCity.id] },
    { placeIds: [from.id, invalidCoordinate.id] },
    { placeIds: valid, preferredModes: "walk" },
    { placeIds: valid, preferredModes: ["walk", "walk"] },
    { placeIds: valid, preferredModes: ["flying"] },
    { placeIds: valid, previous: { id: "forged", legs: [] }, routeId: "route-test", baseVersion: 1, idempotencyKey: "save" },
    { placeIds: valid, routeId: "route-test", baseVersion: "one", idempotencyKey: "save" },
    { placeIds: valid, routeId: "route-test", baseVersion: 1, idempotencyKey: "" },
  ];

  for (const body of cases) {
    const path = Object.hasOwn(body, "routeId") ? "/api/routes/recalculate" : "/api/routes/calculate";
    const response = await handler(jsonRequest(path, { method: "POST", body }));
    assertJson(response, 400);
    assertSafeError(await readJson(response), "INVALID_ROUTE_INPUT");
  }
  assert.equal(providerCalls, 0);
});

test("continues route calculation without Cache API storage", async () => {
  const from = confirmedPlace("A");
  const to = confirmedPlace("B");
  const handler = createHandler(async () => upstreamResponse({
    status: "1", route: { paths: [{ distance: "820", duration: "700" }] },
  }), { confirmedPlaceStore: placeStore(from, to), cacheStorage: undefined });

  const response = await handler(jsonRequest("/api/routes/calculate", {
    method: "POST",
    body: { placeIds: [from.id, to.id], preferredModes: [] },
  }));

  assertJson(response, 200);
  assert.equal((await readJson(response)).legs[0].dataStatus, "fresh");
});

test("actively aborts a never-resolving provider request and clears its deadline", async () => {
  let timeoutCallback;
  const cleared = [];
  const handler = createHandler(() => new Promise(() => {}), {
    timeoutMs: 1,
    setTimeoutImpl: (callback) => {
      timeoutCallback = callback;
      return "provider-deadline";
    },
    clearTimeoutImpl: (timer) => cleared.push(timer),
  });
  const pending = handler(jsonRequest("/api/places/search?keyword=测试&city=测试市"));

  await Promise.resolve();
  assert.equal(typeof timeoutCallback, "function");
  timeoutCallback();
  const response = await pending;

  assertJson(response, 503);
  assertSafeError(await readJson(response), "MAP_PROVIDER_UNAVAILABLE", true);
  assert.deepEqual(cleared, ["provider-deadline"]);
});

test("keeps the provider deadline active through response body parsing", async () => {
  let timeoutCallback;
  let markJsonStarted;
  const cleared = [];
  const jsonStarted = new Promise((resolve) => {
    markJsonStarted = resolve;
  });
  const handler = createHandler(async () => ({
    status: 200,
    ok: true,
    json: async () => {
      markJsonStarted();
      return new Promise(() => {});
    },
  }), {
    timeoutMs: 1,
    setTimeoutImpl: (callback) => {
      timeoutCallback = callback;
      return "body-deadline";
    },
    clearTimeoutImpl: (timer) => cleared.push(timer),
  });
  const pending = handler(jsonRequest("/api/places/search?keyword=测试&city=测试市"));

  await jsonStarted;
  assert.equal(typeof timeoutCallback, "function");
  timeoutCallback();
  const outcome = await Promise.race([
    pending,
    new Promise((resolve) => setTimeout(() => resolve("still-pending"), 20)),
  ]);

  assert.notEqual(outcome, "still-pending");
  assertJson(outcome, 503);
  assertSafeError(await readJson(outcome), "MAP_PROVIDER_UNAVAILABLE", true);
  assert.deepEqual(cleared, ["body-deadline"]);
});

test("normalizes missing keys, limits, and unknown API paths without exposing provider internals", async () => {
  const noKey = createApiHandler({ fetchImpl: async () => upstreamResponse({}), now: NOW });
  const limited = createHandler(async () => upstreamResponse({ message: `key=${KEY}` }, 429));

  for (const handler of [noKey, limited]) {
    const response = await handler(jsonRequest("/api/places/search?keyword=测试&city=测试市"));
    assertJson(response, 503);
    assertSafeError(await readJson(response), "MAP_PROVIDER_UNAVAILABLE", true);
  }
  const missing = await limited(jsonRequest("/api/unknown"));
  assertJson(missing, 404);
  assertSafeError(await readJson(missing), "API_NOT_FOUND");
});

test("rejects wrong methods and non-JSON bodies as safe client errors", async () => {
  let providerCalls = 0;
  const handler = createHandler(async () => {
    providerCalls += 1;
    return upstreamResponse({ status: "1", pois: [POI] });
  });
  const cases = [
    [jsonRequest("/api/places/search?keyword=测试&city=测试市", { method: "POST" }), 405, "METHOD_NOT_ALLOWED"],
    [new Request("https://example.test/api/places/confirm", { method: "POST", body: "not-json" }), 400, "INVALID_JSON"],
    [new Request("https://example.test/api/routes/calculate", { method: "POST", body: "{}" }), 400, "INVALID_JSON"],
  ];

  for (const [request, status, code] of cases) {
    const response = await handler(request);
    assertJson(response, status);
    assertSafeError(await readJson(response), code);
  }
  assert.equal(providerCalls, 0);
});
