import assert from "node:assert/strict";
import test from "node:test";
import {
  confirmAmapPlace,
  MapProviderError,
  planAmapLeg,
  searchAmapPlaces,
} from "../worker/map/amap.js";

const KEY = "test-amap-key-must-never-leak";
const NOW = () => new Date("2026-09-16T08:00:00.000Z");
const PLACE = {
  id: "B00190N5AC",
  name: "南京中国科举博物馆",
  address: "贡院街95号",
  adname: "秦淮区",
  type: "科教文化服务",
  location: "118.790112,32.020077",
};

function response(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function fixtureFetch(assertRequest, body, status = 200) {
  return async (request) => {
    assertRequest(request);
    return response(body, status);
  };
}

function assertError(error, code) {
  assert.ok(error instanceof MapProviderError);
  assert.equal(error.code, code);
  assert.equal(error.message.includes(KEY), false);
  assert.equal(error.message.includes("restapi.amap.com"), false);
  return true;
}

test("search normalizes AMap POIs into internal GCJ-02 candidates", async () => {
  const results = await searchAmapPlaces(
    { keyword: "科举博物馆", city: "南京市" },
    {
      key: KEY,
      fetchImpl: fixtureFetch((request) => {
        const url = new URL(request.url);
        assert.equal(request.method, "GET");
        assert.equal(url.origin + url.pathname, "https://restapi.amap.com/v5/place/text");
        assert.equal(url.searchParams.get("keywords"), "科举博物馆");
        assert.equal(url.searchParams.get("city"), "南京市");
        assert.equal(url.searchParams.get("page_size"), "10");
        assert.equal(url.searchParams.get("key"), KEY);
      }, { status: "1", pois: [PLACE] }),
    },
  );

  assert.deepEqual(results[0], {
    provider: "amap",
    providerPoiId: "B00190N5AC",
    city: "南京市",
    name: "南京中国科举博物馆",
    address: "贡院街95号",
    district: "秦淮区",
    category: "科教文化服务",
    coordinateSystem: "gcj02",
    longitude: 118.790112,
    latitude: 32.020077,
  });
});

test("search caps normalized AMap POIs at ten results", async () => {
  const pois = Array.from({ length: 11 }, (_, index) => ({ ...PLACE, id: `poi-${index}` }));
  const results = await searchAmapPlaces({ keyword: "博物馆", city: "南京市" }, {
    key: KEY,
    fetchImpl: fixtureFetch(() => {}, { status: "1", pois }),
  });
  assert.equal(results.length, 10);
});

test("search validates input and malformed provider coordinates", async () => {
  for (const input of [{ keyword: "", city: "南京市" }, { keyword: "博物馆", city: "" }]) {
    await assert.rejects(() => searchAmapPlaces(input, { key: KEY, fetchImpl: async () => response({}) }), (error) => assertError(error, "INVALID_INPUT"));
  }
  await assert.rejects(() => searchAmapPlaces({ keyword: "博物馆", city: "南京市" }, {
    key: KEY,
    fetchImpl: fixtureFetch(() => {}, { status: "1", pois: [{ ...PLACE, location: "not-a-coordinate" }] }),
  }), (error) => assertError(error, "INVALID_RESPONSE"));
});

test("search normalizes provider, timeout, and rate-limit failures without secrets", async () => {
  const base = { keyword: "博物馆", city: "南京市" };
  await assert.rejects(() => searchAmapPlaces(base, {
    key: KEY,
    fetchImpl: fixtureFetch(() => {}, { status: "0", info: "INVALID_USER_KEY" }),
  }), (error) => assertError(error, "PROVIDER_ERROR"));
  await assert.rejects(() => searchAmapPlaces(base, {
    key: KEY,
    fetchImpl: async () => { throw new DOMException("timed out", "AbortError"); },
  }), (error) => assertError(error, "TIMEOUT"));
  await assert.rejects(() => searchAmapPlaces(base, {
    key: KEY,
    fetchImpl: fixtureFetch(() => {}, { message: "too many requests" }, 429),
  }), (error) => assertError(error, "RATE_LIMIT"));
  await assert.rejects(() => searchAmapPlaces(base, {
    key: KEY,
    fetchImpl: fixtureFetch(() => {}, {
      status: "0",
      info: "CUQPS_HAS_EXCEEDED_THE_LIMIT",
      infocode: "10021",
    }),
  }), (error) => {
    assertError(error, "RATE_LIMIT");
    assert.equal(error.retryable, true);
    return true;
  });
});

test("confirmation re-fetches provider POI by ID and returns a confirmed server-derived Place", async () => {
  const place = await confirmAmapPlace({ providerPoiId: "B00190N5AC", city: "南京市" }, {
    key: KEY,
    fetchImpl: fixtureFetch((request) => {
      const url = new URL(request.url);
      assert.equal(url.pathname, "/v5/place/text");
      assert.equal(url.searchParams.get("keywords"), "B00190N5AC");
      assert.equal(url.searchParams.get("city"), "南京市");
      assert.equal(url.searchParams.get("types"), "");
    }, { status: "1", pois: [PLACE] }),
  });
  assert.deepEqual(place, {
    provider: "amap", providerPoiId: "B00190N5AC", city: "南京市", name: "南京中国科举博物馆",
    address: "贡院街95号", district: "秦淮区", category: "科教文化服务", coordinateSystem: "gcj02",
    longitude: 118.790112, latitude: 32.020077, verificationStatus: "confirmed",
  });
});

for (const [mode, path, expectedPath, extra] of [
  ["walking", { distance: "820", duration: "700" }, "/v5/direction/walking", {}],
  ["driving", { distance: "1820", duration: "600" }, "/v5/direction/driving", {}],
  ["bicycling", { distance: "1250", duration: "500" }, "/v5/direction/bicycling", {}],
  ["transit", { distance: "2100", cost: { duration: "1200" } }, "/v5/direction/transit/integrated", { city1: "南京市", city2: "南京市" }],
]) {
  test(`plans ${mode} legs with the AMap ${mode} request shape`, async () => {
    const leg = await planAmapLeg({
      from: { id: "from", longitude: 118.790112, latitude: 32.020077 },
      to: { id: "to", longitude: 118.800112, latitude: 32.030077 }, city: "南京市", mode,
    }, {
      key: KEY, now: NOW,
      fetchImpl: fixtureFetch((request) => {
        const url = new URL(request.url);
        assert.equal(url.pathname, expectedPath);
        assert.equal(url.searchParams.get("origin"), "118.790112,32.020077");
        assert.equal(url.searchParams.get("destination"), "118.800112,32.030077");
        for (const [name, value] of Object.entries(extra)) assert.equal(url.searchParams.get(name), value);
      }, { status: "1", route: mode === "transit" ? { transits: [path] } : { paths: [path] } }),
    });
    assert.deepEqual(leg, {
      id: `from:to:${mode}`, fromPlaceId: "from", toPlaceId: "to", mode,
      distanceMeters: Number(path.distance), durationSeconds: Number(path.cost?.duration ?? path.duration),
      provider: "amap", computedAt: "2026-09-16T08:00:00.000Z", dataStatus: "fresh",
    });
  });
}

test("planning rejects no route and malformed inputs without fabricated fallback data", async () => {
  const input = { from: { id: "from", longitude: 118.7, latitude: 32.0 }, to: { id: "to", longitude: 118.8, latitude: 32.1 }, city: "南京市", mode: "walking" };
  await assert.rejects(() => planAmapLeg(input, { key: KEY, now: NOW, fetchImpl: fixtureFetch(() => {}, { status: "1", route: { paths: [] } }) }), (error) => assertError(error, "NO_ROUTE"));
  await assert.rejects(() => planAmapLeg({ ...input, mode: "flying" }, { key: KEY, now: NOW, fetchImpl: async () => response({}) }), (error) => assertError(error, "INVALID_INPUT"));
  await assert.rejects(() => planAmapLeg({ ...input, from: { ...input.from, longitude: "bad" } }, { key: KEY, now: NOW, fetchImpl: async () => response({}) }), (error) => assertError(error, "INVALID_INPUT"));
});

test("normalizes errors without retaining a sensitive upstream cause", async () => {
  const upstream = new Error(`upstream ${KEY} https://restapi.amap.com/v5/place/text?key=${KEY}`);
  upstream.payload = { key: KEY, url: "https://restapi.amap.com/full" };
  await assert.rejects(() => searchAmapPlaces({ keyword: "博物馆", city: "南京市" }, {
    key: KEY,
    fetchImpl: async () => { throw upstream; },
  }), (error) => {
    assertError(error, "NETWORK_ERROR");
    assert.equal(error.cause, undefined);
    const serializable = JSON.stringify(error);
    for (const secret of [KEY, "restapi.amap.com", "payload", "stack"]) assert.equal(serializable.includes(secret), false);
    return true;
  });
});

test("rejects out-of-range request and provider coordinates", async () => {
  const input = { from: { id: "from", longitude: 181, latitude: 32 }, to: { id: "to", longitude: 118, latitude: 32 }, city: "南京市", mode: "walking" };
  await assert.rejects(() => planAmapLeg(input, { key: KEY, now: NOW, fetchImpl: async () => response({}) }), (error) => assertError(error, "INVALID_INPUT"));
  await assert.rejects(() => planAmapLeg({ ...input, from: { ...input.from, longitude: 118, latitude: -91 } }, { key: KEY, now: NOW, fetchImpl: async () => response({}) }), (error) => assertError(error, "INVALID_INPUT"));
  await assert.rejects(() => searchAmapPlaces({ keyword: "博物馆", city: "南京市" }, {
    key: KEY,
    fetchImpl: fixtureFetch(() => {}, { status: "1", pois: [{ ...PLACE, location: "181,32" }] }),
  }), (error) => assertError(error, "INVALID_RESPONSE"));
  await assert.rejects(() => searchAmapPlaces({ keyword: "博物馆", city: "南京市" }, {
    key: KEY,
    fetchImpl: fixtureFetch(() => {}, { status: "1", pois: [{ ...PLACE, location: "118,-91" }] }),
  }), (error) => assertError(error, "INVALID_RESPONSE"));
});

test("rejects empty and non-numeric route metrics instead of accepting zero-value coercions", async () => {
  const input = { from: { id: "from", longitude: 118.7, latitude: 32.0 }, to: { id: "to", longitude: 118.8, latitude: 32.1 }, city: "南京市", mode: "walking" };
  for (const path of [
    { distance: "", duration: "60" }, { distance: null, duration: "60" }, { distance: false, duration: "60" },
    { distance: "100", duration: "" }, { distance: "100", duration: null }, { distance: "100", duration: false },
    { distance: "-1", duration: "60" }, { distance: "100", duration: "not-a-number" },
  ]) {
    await assert.rejects(() => planAmapLeg(input, { key: KEY, now: NOW, fetchImpl: fixtureFetch(() => {}, { status: "1", route: { paths: [path] } }) }), (error) => assertError(error, "INVALID_RESPONSE"));
  }
});

test("validates clock dependencies before fetching and rejects invalid clock values", async () => {
  const input = { from: { id: "from", longitude: 118.7, latitude: 32.0 }, to: { id: "to", longitude: 118.8, latitude: 32.1 }, city: "南京市", mode: "walking" };
  let calls = 0;
  await assert.rejects(() => planAmapLeg(input, { key: KEY, fetchImpl: async () => { calls += 1; return response({}); } }), (error) => assertError(error, "INVALID_INPUT"));
  assert.equal(calls, 0);
  let invalidDateCalls = 0;
  await assert.rejects(() => planAmapLeg(input, {
    key: KEY, now: () => new Date("not-a-date"),
    fetchImpl: async () => { invalidDateCalls += 1; return response({ status: "1", route: { paths: [{ distance: "100", duration: "60" }] } }); },
  }), (error) => assertError(error, "INVALID_INPUT"));
  assert.equal(invalidDateCalls, 0);
});

test("normalizes AbortError raised while parsing an upstream response as retryable timeout", async () => {
  await assert.rejects(() => searchAmapPlaces({ keyword: "博物馆", city: "南京市" }, {
    key: KEY,
    fetchImpl: async () => ({ status: 200, ok: true, json: async () => { throw new DOMException("parse timeout", "AbortError"); } }),
  }), (error) => {
    assertError(error, "TIMEOUT");
    assert.equal(error.retryable, true);
    return true;
  });
});
