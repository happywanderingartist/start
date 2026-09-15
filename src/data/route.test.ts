import { describe, expect, it } from "vitest";
import { route } from "./route";

describe("route data", () => {
  it("keeps the five seed stops and prototype-estimate disclosure", () => {
    expect(route.id).toBe("route-anpu-nanjing-old-city");
    expect(route.stops.map((stop) => stop.name)).toEqual([
      "古秦淮",
      "江南贡院／南京中国科举博物馆",
      "夫子庙牌坊",
      "ARTALL爱涛设计酒店",
      "三七八巷",
    ]);
    expect(route.stops.slice(0, -1).every((stop) => stop.toNext?.status === "prototype_estimate")).toBe(true);
    expect(route.dataStatus).toBe("prototype_estimate_pending_map_verification");
  });
});
