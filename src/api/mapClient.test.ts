import { afterEach, describe, expect, it, vi } from "vitest";
import { createMapClient, MapApiError } from "./mapClient";

const place = {
  id: "amap-test-poi",
  city: "南京",
  name: "测试地点",
  address: "测试路1号",
  district: "秦淮区",
  category: "风景名胜",
  provider: "amap" as const,
  providerPoiId: "test-poi",
  coordinateSystem: "gcj02" as const,
  longitude: 118.79,
  latitude: 32.02,
  verificationStatus: "confirmed" as const,
};

const calculatedRoute = {
  id: "route-test",
  version: 2,
  orderedPlaceIds: ["amap-a", "amap-b"],
  preferredModes: ["walk"],
  legs: [],
  transportDistanceMeters: 0,
  transportDurationSeconds: 0,
};

afterEach(() => vi.useRealTimers());

describe("map client", () => {
  it("uses only same-origin API paths and the server request contracts", async () => {
    const requests: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];
    const responses = [[place], place, calculatedRoute, calculatedRoute];
    const client = createMapClient(async (input, init) => {
      requests.push({ input, init });
      return Response.json(responses[requests.length - 1]);
    });

    await client.searchPlaces({ keyword: "夫子庙", city: "南京" });
    await client.confirmPlace({ providerPoiId: "test-poi", city: "南京" });
    await client.calculateRoute({ placeIds: ["amap-a", "amap-b"], preferredModes: ["walk"] });
    await client.recalculateRoute({
      routeId: "route-test",
      baseVersion: 1,
      placeIds: ["amap-a", "amap-b"],
      preferredModes: ["walk"],
      idempotencyKey: "request-test",
    });

    expect(requests.map(({ input }) => String(input))).toEqual([
      "/api/places/search?keyword=%E5%A4%AB%E5%AD%90%E5%BA%99&city=%E5%8D%97%E4%BA%AC",
      "/api/places/confirm",
      "/api/routes/calculate",
      "/api/routes/recalculate",
    ]);
    expect(requests.map(({ init }) => init?.method ?? "GET")).toEqual(["GET", "POST", "POST", "POST"]);
    expect(JSON.parse(String(requests[3].init?.body))).toEqual({
      routeId: "route-test",
      baseVersion: 1,
      placeIds: ["amap-a", "amap-b"],
      preferredModes: ["walk"],
      idempotencyKey: "request-test",
    });
  });

  it("aborts a request after eight seconds", async () => {
    vi.useFakeTimers();
    let requestSignal: AbortSignal | undefined;
    const client = createMapClient((_input, init) => {
      requestSignal = init?.signal ?? undefined;
      return new Promise((_resolve, reject) => {
        requestSignal?.addEventListener("abort", () => reject(requestSignal?.reason), { once: true });
      });
    });

    const pending = client.searchPlaces({ keyword: "夫子庙", city: "南京" });
    const rejection = expect(pending).rejects.toMatchObject({ code: "TIMEOUT", retryable: true });
    await vi.advanceTimersByTimeAsync(7_999);
    expect(requestSignal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);

    await rejection;
    expect(requestSignal?.aborted).toBe(true);
  });

  it("preserves server error codes and retryability", async () => {
    const client = createMapClient(async () => Response.json({
      error: { code: "MAP_PROVIDER_UNAVAILABLE", message: "地图数据暂时无法更新", retryable: true },
    }, { status: 503 }));

    const pending = client.searchPlaces({ keyword: "夫子庙", city: "南京" });

    await expect(pending).rejects.toEqual(expect.objectContaining({
      name: "MapApiError",
      code: "MAP_PROVIDER_UNAVAILABLE",
      retryable: true,
      message: "地图数据暂时无法更新",
    }));
    await expect(pending).rejects.toBeInstanceOf(MapApiError);
  });

  it("normalizes malformed success responses", async () => {
    const client = createMapClient(async () => new Response("not-json", {
      status: 200,
      headers: { "content-type": "application/json" },
    }));

    await expect(client.searchPlaces({ keyword: "夫子庙", city: "南京" })).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
      retryable: false,
    });
  });
});
