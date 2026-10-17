export const AMAP_PROVIDER = "amap";
export const COORDINATE_SYSTEM = "gcj02";
export const ROUTE_MODES = new Set(["walking", "driving", "bicycling", "transit"]);
export const MAX_PLACE_RESULTS = 10;

export function locationOf(place) {
  return `${place.longitude},${place.latitude}`;
}
