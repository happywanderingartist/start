import { describe, expect, it } from "vitest";
import { routeBundle } from "./route";
import { getPublishedRoute, getPublishedRoutePath, searchPublishedRoutes } from "./routeRepository";

describe("published route repository", () => {
  it.each(["安溥", "南京", "老城", "南京 安溥"])("matches the verified route for %s", (query) => {
    expect(searchPublishedRoutes(query).map((bundle) => bundle.route.id)).toEqual([routeBundle.route.id]);
  });

  it("returns no route for an unrelated city and artist", () => {
    expect(searchPublishedRoutes("苏打绿 台北")).toEqual([]);
  });

  it("returns published recommendations for an empty query", () => {
    expect(searchPublishedRoutes("   ")).toEqual([routeBundle]);
  });

  it("gets only an existing published route by its stable id", () => {
    expect(getPublishedRoute(routeBundle.route.id)).toBe(routeBundle);
    expect(getPublishedRoute("route-not-published")).toBeUndefined();
  });

  it("resolves navigation paths only for published route ids", () => {
    expect(getPublishedRoutePath(routeBundle.route.id)).toBe("/routes/anpu-nanjing");
    expect(getPublishedRoutePath("route-not-published")).toBeUndefined();
  });
});
