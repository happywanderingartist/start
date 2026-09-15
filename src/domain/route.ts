export type CoordinateSystem = "gcj02";
export type TravelMode = "walk" | "transit" | "drive" | "ride";
export type MapDataStatus = "fresh" | "cached" | "unavailable";

export interface Place {
  id: string;
  city: string;
  name: string;
  address: string;
  district: string;
  category: string;
  provider: "amap";
  providerPoiId: string;
  coordinateSystem: "gcj02";
  longitude: number;
  latitude: number;
  verificationStatus: "confirmed";
}

export interface RouteLeg {
  id: string;
  fromPlaceId: string;
  toPlaceId: string;
  mode: TravelMode;
  distanceMeters: number | null;
  durationSeconds: number | null;
  provider: "amap";
  computedAt: string | null;
  dataStatus: MapDataStatus;
}

export interface RouteStop {
  placeId: string;
  order: number;
  suggestedStayMinutes: number;
  visitStatus: "upcoming" | "current" | "arrived" | "skipped";
  story: string;
  checkInTips: string[];
  imageUrls: string[];
}

export interface FanRoute {
  id: string;
  version: number;
  title: string;
  city: string;
  artist: string;
  stops: RouteStop[];
  legs: RouteLeg[];
  transportDistanceMeters: number | null;
  transportDurationSeconds: number | null;
  suggestedTotalMinutes: number | null;
}

export interface RouteBundle {
  route: FanRoute;
  places: Record<string, Place>;
}

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function fail(path: string, message: string): never {
  throw new Error(`${path}: ${message}`);
}

function fieldValue(value: UnknownRecord, path: string): unknown {
  const key = path.slice(path.lastIndexOf(".") + 1);
  return value[key];
}

function stringAt(value: UnknownRecord, path: string): string {
  const field = fieldValue(value, path);
  if (typeof field !== "string") fail(path, "must be a string");
  return field;
}

function nullableStringAt(value: UnknownRecord, path: string): string | null {
  const field = fieldValue(value, path);
  if (field !== null && typeof field !== "string") fail(path, "must be a string or null");
  return field as string | null;
}

function numberAt(value: UnknownRecord, path: string): number {
  const field = fieldValue(value, path);
  if (typeof field !== "number" || !Number.isFinite(field)) fail(path, "must be a finite number");
  return field;
}

function nullableNumberAt(value: UnknownRecord, path: string): number | null {
  if (fieldValue(value, path) === null) return null;
  return numberAt(value, path);
}

function oneOf<T extends string>(value: UnknownRecord, path: string, choices: readonly T[]): T {
  const field = fieldValue(value, path);
  if (typeof field !== "string" || !choices.includes(field as T)) {
    fail(path, `must be one of ${choices.join(", ")}`);
  }
  return field as T;
}

function stringArrayAt(value: UnknownRecord, path: string): string[] {
  const field = fieldValue(value, path);
  if (!Array.isArray(field)) fail(path, "must be an array");
  return field.map((item, index) => {
    if (typeof item !== "string") fail(`${path}[${index}]`, "must be a string");
    return item;
  });
}

function placeAt(value: unknown, path: string): Place {
  if (!isRecord(value)) fail(path, "must be an object");
  const place: Place = {
    id: stringAt(value, `${path}.id`),
    city: stringAt(value, `${path}.city`),
    name: stringAt(value, `${path}.name`),
    address: stringAt(value, `${path}.address`),
    district: stringAt(value, `${path}.district`),
    category: stringAt(value, `${path}.category`),
    provider: oneOf(value, `${path}.provider`, ["amap"] as const),
    providerPoiId: stringAt(value, `${path}.providerPoiId`),
    coordinateSystem: oneOf(value, `${path}.coordinateSystem`, ["gcj02"] as const),
    longitude: numberAt(value, `${path}.longitude`),
    latitude: numberAt(value, `${path}.latitude`),
    verificationStatus: oneOf(value, `${path}.verificationStatus`, ["confirmed"] as const),
  };
  return place;
}

function stopAt(value: unknown, path: string): RouteStop {
  if (!isRecord(value)) fail(path, "must be an object");
  return {
    placeId: stringAt(value, `${path}.placeId`),
    order: numberAt(value, `${path}.order`),
    suggestedStayMinutes: numberAt(value, `${path}.suggestedStayMinutes`),
    visitStatus: oneOf(value, `${path}.visitStatus`, ["upcoming", "current", "arrived", "skipped"] as const),
    story: stringAt(value, `${path}.story`),
    checkInTips: stringArrayAt(value, `${path}.checkInTips`),
    imageUrls: stringArrayAt(value, `${path}.imageUrls`),
  };
}

function legAt(value: unknown, path: string): RouteLeg {
  if (!isRecord(value)) fail(path, "must be an object");
  const dataStatus = oneOf(value, `${path}.dataStatus`, ["fresh", "cached", "unavailable"] as const);
  const distanceMeters = nullableNumberAt(value, `${path}.distanceMeters`);
  const durationSeconds = nullableNumberAt(value, `${path}.durationSeconds`);
  if (dataStatus === "unavailable" && (distanceMeters !== null || durationSeconds !== null)) {
    fail(path, "unavailable legs must have null distanceMeters and durationSeconds");
  }
  if (dataStatus !== "unavailable" && (distanceMeters === null || durationSeconds === null)) {
    fail(path, "available legs must have distanceMeters and durationSeconds");
  }
  return {
    id: stringAt(value, `${path}.id`),
    fromPlaceId: stringAt(value, `${path}.fromPlaceId`),
    toPlaceId: stringAt(value, `${path}.toPlaceId`),
    mode: oneOf(value, `${path}.mode`, ["walk", "transit", "drive", "ride"] as const),
    distanceMeters,
    durationSeconds,
    provider: oneOf(value, `${path}.provider`, ["amap"] as const),
    computedAt: nullableStringAt(value, `${path}.computedAt`),
    dataStatus,
  };
}

export function assertRouteBundle(value: unknown): RouteBundle {
  if (!isRecord(value)) fail("bundle", "must be an object");
  if (!isRecord(value.route)) fail("bundle.route", "must be an object");
  if (!isRecord(value.places)) fail("bundle.places", "must be an object");

  const places: Record<string, Place> = Object.create(null) as Record<string, Place>;
  for (const [key, rawPlace] of Object.entries(value.places)) {
    places[key] = placeAt(rawPlace, `bundle.places.${key}`);
    if (places[key].id !== key) fail(`bundle.places.${key}.id`, "must match its places key");
  }

  const route = value.route;
  const rawStops = route.stops;
  const rawLegs = route.legs;
  if (!Array.isArray(rawStops)) fail("bundle.route.stops", "must be an array");
  if (!Array.isArray(rawLegs)) fail("bundle.route.legs", "must be an array");
  const stops = rawStops.map((item, index) => stopAt(item, `bundle.route.stops[${index}]`));
  const legs = rawLegs.map((item, index) => legAt(item, `bundle.route.legs[${index}]`));
  if (legs.length !== Math.max(0, stops.length - 1)) fail("bundle.route.legs", "must contain one leg between each adjacent stop");
  stops.forEach((stop, index) => {
    if (!Object.hasOwn(places, stop.placeId)) fail(`bundle.route.stops[${index}].placeId`, "references a missing place");
    if (stop.order !== index + 1) fail(`bundle.route.stops[${index}].order`, "must match stop order");
  });
  legs.forEach((leg, index) => {
    const from = stops[index]?.placeId;
    const to = stops[index + 1]?.placeId;
    if (leg.fromPlaceId !== from || leg.toPlaceId !== to) {
      fail(`bundle.route.legs[${index}]`, "must connect adjacent stops");
    }
  });

  const parsedRoute: FanRoute = {
    id: stringAt(route, "bundle.route.id"),
    version: numberAt(route, "bundle.route.version"),
    title: stringAt(route, "bundle.route.title"),
    city: stringAt(route, "bundle.route.city"),
    artist: stringAt(route, "bundle.route.artist"),
    stops,
    legs,
    transportDistanceMeters: nullableNumberAt(route, "bundle.route.transportDistanceMeters"),
    transportDurationSeconds: nullableNumberAt(route, "bundle.route.transportDurationSeconds"),
    suggestedTotalMinutes: nullableNumberAt(route, "bundle.route.suggestedTotalMinutes"),
  };
  const summary = summarizeRoute({ route: parsedRoute, places });
  if (parsedRoute.transportDistanceMeters !== summary.distanceMeters) {
    fail(
      "bundle.route.transportDistanceMeters",
      summary.dataStatus === "unavailable" ? "must be null when legs are unavailable" : "must match leg summary",
    );
  }
  if (parsedRoute.transportDurationSeconds !== summary.durationSeconds) {
    fail(
      "bundle.route.transportDurationSeconds",
      summary.dataStatus === "unavailable" ? "must be null when legs are unavailable" : "must match leg summary",
    );
  }
  return { route: parsedRoute, places };
}

export function summarizeRoute(bundle: RouteBundle): {
  distanceMeters: number | null;
  durationSeconds: number | null;
  dataStatus: MapDataStatus;
} {
  if (bundle.route.legs.some((leg) => leg.dataStatus === "unavailable")) {
    return { distanceMeters: null, durationSeconds: null, dataStatus: "unavailable" };
  }
  const dataStatus = bundle.route.legs.some((leg) => leg.dataStatus === "cached") ? "cached" : "fresh";
  return {
    distanceMeters: bundle.route.legs.reduce((total, leg) => total + (leg.distanceMeters ?? 0), 0),
    durationSeconds: bundle.route.legs.reduce((total, leg) => total + (leg.durationSeconds ?? 0), 0),
    dataStatus,
  };
}
