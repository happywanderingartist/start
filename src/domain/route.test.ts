import { describe, expect, it } from "vitest";
import { assertRouteBundle, summarizeRoute, type RouteBundle } from "./route";

const validBundle: RouteBundle = {
  route: {
    id: "route-test",
    version: 1,
    title: "Test route",
    city: "Nanjing",
    artist: "Test artist",
    stops: [
      {
        placeId: "place-a",
        order: 1,
        suggestedStayMinutes: 20,
        visitStatus: "upcoming",
        story: "A story",
        checkInTips: ["Tip"],
        imageUrls: ["https://example.test/a.jpg"],
      },
      {
        placeId: "place-b",
        order: 2,
        suggestedStayMinutes: 30,
        visitStatus: "current",
        story: "Another story",
        checkInTips: [],
        imageUrls: [],
      },
      {
        placeId: "place-c",
        order: 3,
        suggestedStayMinutes: 15,
        visitStatus: "arrived",
        story: "A third story",
        checkInTips: [],
        imageUrls: [],
      },
    ],
    legs: [
      {
        id: "leg-a-b",
        fromPlaceId: "place-a",
        toPlaceId: "place-b",
        mode: "walk",
        distanceMeters: 820,
        durationSeconds: 700,
        provider: "amap",
        computedAt: "2026-09-16T00:00:00.000Z",
        dataStatus: "fresh",
      },
      {
        id: "leg-b-c",
        fromPlaceId: "place-b",
        toPlaceId: "place-c",
        mode: "transit",
        distanceMeters: 1000,
        durationSeconds: 800,
        provider: "amap",
        computedAt: "2026-09-16T00:00:00.000Z",
        dataStatus: "fresh",
      },
    ],
    transportDistanceMeters: 1820,
    transportDurationSeconds: 1500,
    suggestedTotalMinutes: 65,
  },
  places: {
    "place-a": {
      id: "place-a",
      city: "Nanjing",
      name: "Place A",
      address: "Test address A",
      district: "Test district",
      category: "test",
      provider: "amap",
      providerPoiId: "poi-a",
      coordinateSystem: "gcj02",
      longitude: 120.1,
      latitude: 32.1,
      verificationStatus: "confirmed",
    },
    "place-b": {
      id: "place-b",
      city: "Nanjing",
      name: "Place B",
      address: "Test address B",
      district: "Test district",
      category: "test",
      provider: "amap",
      providerPoiId: "poi-b",
      coordinateSystem: "gcj02",
      longitude: 120.2,
      latitude: 32.2,
      verificationStatus: "confirmed",
    },
    "place-c": {
      id: "place-c",
      city: "Nanjing",
      name: "Place C",
      address: "Test address C",
      district: "Test district",
      category: "test",
      provider: "amap",
      providerPoiId: "poi-c",
      coordinateSystem: "gcj02",
      longitude: 120.3,
      latitude: 32.3,
      verificationStatus: "confirmed",
    },
  },
};

function cloneBundle(): RouteBundle {
  return structuredClone(validBundle);
}

describe("assertRouteBundle", () => {
  it("accepts a verified route bundle", () => {
    expect(assertRouteBundle(validBundle)).toEqual(validBundle);
  });

  it("guards primitive and malformed top-level input with a field path", () => {
    expect(() => assertRouteBundle(null)).toThrow(/bundle/i);
    expect(() => assertRouteBundle("route")).toThrow(/bundle/i);
    expect(() => assertRouteBundle({ route: [], places: {} })).toThrow(/route/i);
  });

  it("rejects a stop whose place is missing", () => {
    const bundle = cloneBundle();
    bundle.route.stops[1].placeId = "missing-place";

    expect(() => assertRouteBundle(bundle)).toThrow(/route\.stops\[1\]\.placeId.*missing place/i);
  });

  it.each(["toString", "__proto__"])("rejects inherited place key %s", (placeId) => {
    const bundle = cloneBundle();
    bundle.route.stops[1].placeId = placeId;

    expect(() => assertRouteBundle(bundle)).toThrow(/route\.stops\[1\]\.placeId.*missing place/i);
  });

  it("rejects legs that do not connect adjacent stops", () => {
    const bundle = cloneBundle();
    bundle.route.legs[0].toPlaceId = "place-c";

    expect(() => assertRouteBundle(bundle)).toThrow(/route\.legs\[0\].*adjacent/i);
  });

  it("rejects a non-gcj02 coordinate system", () => {
    const bundle = cloneBundle();
    bundle.places["place-a"].coordinateSystem = "wgs84" as "gcj02";

    expect(() => assertRouteBundle(bundle)).toThrow(/places\.place-a\.coordinateSystem.*gcj02/i);
  });

  it("rejects an unconfirmed POI", () => {
    const bundle = cloneBundle();
    bundle.places["place-a"].verificationStatus = "candidate" as "confirmed";

    expect(() => assertRouteBundle(bundle)).toThrow(/places\.place-a\.verificationStatus.*confirmed/i);
  });

  it("rejects unavailable legs with non-null metrics", () => {
    const bundle = cloneBundle();
    bundle.route.legs[0].dataStatus = "unavailable";

    expect(() => assertRouteBundle(bundle)).toThrow(/route\.legs\[0\].*unavailable/i);
  });

  it("rejects route aggregates that disagree with leg totals", () => {
    const bundle = cloneBundle();
    bundle.route.transportDistanceMeters = 999;

    expect(() => assertRouteBundle(bundle)).toThrow(/transportDistanceMeters.*match/i);
  });

  it("rejects non-null route aggregates when any leg is unavailable", () => {
    const bundle = cloneBundle();
    bundle.route.legs[1].dataStatus = "unavailable";
    bundle.route.legs[1].distanceMeters = null;
    bundle.route.legs[1].durationSeconds = null;

    expect(() => assertRouteBundle(bundle)).toThrow(/transportDistanceMeters.*unavailable/i);
  });

  it("guards invalid nested primitives and reports their field paths", () => {
    const bundle = cloneBundle();
    (bundle.route.legs[0] as unknown as { distanceMeters: unknown }).distanceMeters = "820";

    expect(() => assertRouteBundle(bundle)).toThrow(/route\.legs\[0\]\.distanceMeters/i);
  });
});

describe("summarizeRoute", () => {
  it("sums fresh leg metrics", () => {
    expect(summarizeRoute(validBundle)).toEqual({
      distanceMeters: 1820,
      durationSeconds: 1500,
      dataStatus: "fresh",
    });
  });

  it("returns unavailable when any leg is unavailable", () => {
    const bundle = cloneBundle();
    bundle.route.legs[1].dataStatus = "unavailable";
    bundle.route.legs[1].distanceMeters = null;
    bundle.route.legs[1].durationSeconds = null;
    bundle.route.transportDistanceMeters = null;
    bundle.route.transportDurationSeconds = null;

    expect(summarizeRoute(assertRouteBundle(bundle))).toEqual({
      distanceMeters: null,
      durationSeconds: null,
      dataStatus: "unavailable",
    });
  });

  it("marks a route cached when all metrics exist but any leg is cached", () => {
    const bundle = cloneBundle();
    bundle.route.legs[1].dataStatus = "cached";

    expect(summarizeRoute(assertRouteBundle(bundle))).toEqual({
      distanceMeters: 1820,
      durationSeconds: 1500,
      dataStatus: "cached",
    });
  });
});
