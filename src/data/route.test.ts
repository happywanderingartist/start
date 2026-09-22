import { describe, expect, it } from "vitest";
import { assertRouteBundle } from "../domain/route";
import { createCompatibilityRoute, route, routeBundle } from "./route";

describe("route data", () => {
  it("loads the five human-confirmed AMap places through the domain validator", () => {
    expect(routeBundle.route.id).toBe("route-anpu-nanjing-old-city");
    expect(routeBundle.route.stops).toHaveLength(5);
    expect(routeBundle.route.legs).toHaveLength(4);
    expect(Object.values(routeBundle.places).every((place) => place.verificationStatus === "confirmed")).toBe(true);
    expect(route.stops.map((stop) => stop.name)).toEqual([
      "古秦淮",
      "中国科举博物馆(江南贡院)",
      "夫子庙-古秦淮西牌坊",
      "南京夫子庙ARTALL爱涛设计酒店",
      "三七八巷",
    ]);
  });

  it("derives compatibility metrics from the verified route legs", () => {
    expect(routeBundle.route.transportDistanceMeters).toBe(1496);
    expect(routeBundle.route.transportDurationSeconds).toBe(1198);
    expect(routeBundle.route.suggestedTotalMinutes).toBe(20);
    expect(route.stops.map((stop) => stop.toNext)).toEqual([
      { mode: "walk", minutes: 2, meters: 131, status: "fresh" },
      { mode: "walk", minutes: 4, meters: 271, status: "fresh" },
      { mode: "walk", minutes: 11, meters: 782, status: "fresh" },
      { mode: "walk", minutes: 5, meters: 312, status: "fresh" },
      null,
    ]);
    expect(JSON.stringify(route)).not.toContain("prototype_estimate");
  });

  it("maps an unavailable leg to null instead of fabricated zero metrics", () => {
    const unavailableSeed = structuredClone(routeBundle);
    unavailableSeed.route.legs[1] = {
      ...unavailableSeed.route.legs[1],
      distanceMeters: null,
      durationSeconds: null,
      computedAt: null,
      dataStatus: "unavailable",
    };
    unavailableSeed.route.transportDistanceMeters = null;
    unavailableSeed.route.transportDurationSeconds = null;
    unavailableSeed.route.suggestedTotalMinutes = null;
    const unavailableBundle = assertRouteBundle(unavailableSeed);

    const compatibilityRoute = createCompatibilityRoute(unavailableBundle);

    expect(compatibilityRoute.estimatedTotalMinutes).toBeNull();
    expect(compatibilityRoute.stops[1].toNext).toBeNull();
    expect(JSON.stringify(compatibilityRoute.stops[1])).not.toContain('"minutes":0');
    expect(JSON.stringify(compatibilityRoute.stops[1])).not.toContain('"meters":0');
  });
});
