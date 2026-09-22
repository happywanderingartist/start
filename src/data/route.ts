import seed from "../../docs/seed/route-anpu-nanjing.json";
import {
  assertRouteBundle,
  summarizeRoute,
  type MapDataStatus,
  type RouteBundle,
  type TravelMode,
} from "../domain/route";

export interface CompatibilityRouteLeg {
  mode: TravelMode;
  minutes: number;
  meters: number;
  status: Exclude<MapDataStatus, "unavailable">;
}

export interface RouteStop {
  id: string;
  order: number;
  name: string;
  poiStatus: "confirmed";
  summary: string;
  detail: string;
  toNext: CompatibilityRouteLeg | null;
}

export interface CompatibilityRoute {
  id: string;
  title: string;
  city: string;
  artist: string;
  estimatedTotalMinutes: number | null;
  dataStatus: MapDataStatus;
  stops: RouteStop[];
}

export const routeBundle = assertRouteBundle(seed);

export function createCompatibilityRoute(bundle: RouteBundle): CompatibilityRoute {
  const estimatedTotalMinutes = bundle.route.suggestedTotalMinutes;
  return {
    id: bundle.route.id,
    title: bundle.route.title,
    city: bundle.route.city,
    artist: bundle.route.artist,
    estimatedTotalMinutes,
    dataStatus: summarizeRoute(bundle).dataStatus,
    stops: bundle.route.stops.map((stop, index) => {
      const place = bundle.places[stop.placeId];
      const leg = bundle.route.legs[index];
      const toNext = !leg || leg.dataStatus === "unavailable" || leg.distanceMeters === null || leg.durationSeconds === null
        ? null
        : {
            mode: leg.mode,
            minutes: Math.ceil(leg.durationSeconds / 60),
            meters: leg.distanceMeters,
            status: leg.dataStatus,
          };

      return {
        id: place.id,
        order: stop.order,
        name: place.name,
        poiStatus: place.verificationStatus,
        summary: place.address,
        detail: stop.story,
        toNext,
      };
    }),
  };
}

export const route = createCompatibilityRoute(routeBundle);
