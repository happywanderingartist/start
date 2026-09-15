import seed from "../../docs/seed/route-anpu-nanjing.json";

export type TravelMode = "walk" | "transit";

export interface RouteLeg {
  mode: TravelMode;
  minutes: number;
  meters: number;
  status: "prototype_estimate";
}

export interface RouteStop {
  id: string;
  order: number;
  name: string;
  poiStatus: "pending_verification";
  summary: string;
  detail: string;
  toNext: RouteLeg | null;
}

export interface FanRoute {
  id: string;
  title: string;
  city: string;
  artist: string;
  theme: string;
  estimatedTotalMinutes: number;
  dataStatus: "prototype_estimate_pending_map_verification";
  sourceNote: string;
  stops: RouteStop[];
}

function isFanRoute(value: unknown): value is FanRoute {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<FanRoute>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    candidate.dataStatus === "prototype_estimate_pending_map_verification" &&
    Array.isArray(candidate.stops) &&
    candidate.stops.length === 5 &&
    candidate.stops.every((stop, index) => stop.order === index + 1)
  );
}

if (!isFanRoute(seed)) {
  throw new Error("路线种子数据格式无效");
}

export const route: FanRoute = seed;
