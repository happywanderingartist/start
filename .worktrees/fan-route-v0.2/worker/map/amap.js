import { AMAP_PROVIDER, COORDINATE_SYSTEM, locationOf, MAX_PLACE_RESULTS, ROUTE_MODES } from "./contracts.js";
import { MapProviderError } from "./errors.js";

const AMAP_BASE = "https://restapi.amap.com";

function fail(code, message, options) {
  throw new MapProviderError(code, message, options);
}

function requireText(value, field) {
  if (typeof value !== "string" || value.trim() === "") fail("INVALID_INPUT", `A valid ${field} is required`);
  return value.trim();
}

function numberAt(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function strictNumber(value) {
  if (typeof value !== "number" && (typeof value !== "string" || value.trim() === "")) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function coordinateOf(location) {
  if (typeof location !== "string") fail("INVALID_RESPONSE", "Map provider returned an invalid coordinate");
  const [rawLongitude, rawLatitude, ...remaining] = location.split(",");
  const longitude = strictNumber(rawLongitude);
  const latitude = strictNumber(rawLatitude);
  if (remaining.length || longitude === null || latitude === null || longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
    fail("INVALID_RESPONSE", "Map provider returned an invalid coordinate");
  }
  return { longitude, latitude };
}

function normalizePlace(poi, city) {
  if (!poi || typeof poi !== "object") fail("INVALID_RESPONSE", "Map provider returned an invalid place");
  const { longitude, latitude } = coordinateOf(poi.location);
  const providerPoiId = requireProviderText(poi.id, "place identifier");
  return {
    provider: AMAP_PROVIDER,
    providerPoiId,
    city,
    name: requireProviderText(poi.name, "place name"),
    address: typeof poi.address === "string" ? poi.address : "",
    district: typeof poi.adname === "string" ? poi.adname : "",
    category: typeof poi.type === "string" ? poi.type : "",
    coordinateSystem: COORDINATE_SYSTEM,
    longitude,
    latitude,
  };
}

function requireProviderText(value, field) {
  if (typeof value !== "string" || value.trim() === "") fail("INVALID_RESPONSE", `Map provider returned an invalid ${field}`);
  return value.trim();
}

function endpoint(path, params) {
  const url = new URL(path, AMAP_BASE);
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value);
  return url;
}

async function requestAmap(path, params, { key, fetchImpl }) {
  requireText(key, "map provider key");
  if (typeof fetchImpl !== "function") fail("INVALID_INPUT", "A fetch implementation is required");
  const url = endpoint(path, { ...params, key });
  let response;
  try {
    response = await fetchImpl(new Request(url));
  } catch (cause) {
    if (cause?.name === "AbortError") fail("TIMEOUT", "Map provider request timed out", { retryable: true, cause });
    fail("NETWORK_ERROR", "Map provider request failed", { retryable: true, cause });
  }
  if (!response || typeof response.status !== "number") fail("NETWORK_ERROR", "Map provider request failed", { retryable: true });
  if (response.status === 429) fail("RATE_LIMIT", "Map provider rate limit reached", { retryable: true, status: 429 });
  if (!response.ok) fail("HTTP_ERROR", "Map provider request failed", { retryable: response.status >= 500, status: response.status });
  let body;
  try {
    body = await response.json();
  } catch (cause) {
    if (cause?.name === "AbortError") fail("TIMEOUT", "Map provider request timed out", { retryable: true });
    fail("INVALID_RESPONSE", "Map provider returned an invalid response", { cause });
  }
  if (body?.infocode === "10021") {
    fail("RATE_LIMIT", "Map provider rate limit reached", { retryable: true });
  }
  if (!body || body.status !== "1") fail("PROVIDER_ERROR", "Map provider returned an error", { retryable: false });
  return body;
}

export async function searchAmapPlaces({ keyword, city }, dependencies) {
  const normalizedKeyword = requireText(keyword, "keyword");
  const normalizedCity = requireText(city, "city");
  const body = await requestAmap("/v5/place/text", {
    keywords: normalizedKeyword,
    city: normalizedCity,
    page_size: String(MAX_PLACE_RESULTS),
  }, dependencies);
  if (!Array.isArray(body.pois)) fail("INVALID_RESPONSE", "Map provider returned invalid places");
  return body.pois.slice(0, MAX_PLACE_RESULTS).map((poi) => normalizePlace(poi, normalizedCity));
}

export async function confirmAmapPlace({ providerPoiId, city }, dependencies) {
  const poiId = requireText(providerPoiId, "provider place identifier");
  const normalizedCity = requireText(city, "city");
  const body = await requestAmap("/v5/place/text", {
    keywords: poiId,
    city: normalizedCity,
    types: "",
    page_size: "10",
  }, dependencies);
  if (!Array.isArray(body.pois)) fail("INVALID_RESPONSE", "Map provider returned invalid places");
  const poi = body.pois.find((candidate) => candidate?.id === poiId);
  if (!poi) fail("PLACE_NOT_FOUND", "Map provider could not confirm this place");
  return { ...normalizePlace(poi, normalizedCity), verificationStatus: "confirmed" };
}

function normalizedRouteInput(input) {
  const city = requireText(input?.city, "city");
  if (!ROUTE_MODES.has(input?.mode)) fail("INVALID_INPUT", "A supported travel mode is required");
  for (const [label, place] of [["origin", input.from], ["destination", input.to]]) {
    if (!place || typeof place.id !== "string" || place.id.trim() === "" || numberAt(place.longitude) === null || numberAt(place.latitude) === null || place.longitude < -180 || place.longitude > 180 || place.latitude < -90 || place.latitude > 90) {
      fail("INVALID_INPUT", `A valid ${label} is required`);
    }
  }
  return { ...input, city };
}

function validatedNow(now) {
  let computedAt;
  try {
    computedAt = now();
  } catch {
    fail("INVALID_INPUT", "A valid clock is required");
  }
  if (!(computedAt instanceof Date) || Number.isNaN(computedAt.getTime())) fail("INVALID_INPUT", "A valid clock is required");
  return computedAt;
}

function normalizePath(path, input, computedAt) {
  const distanceMeters = strictNumber(path?.distance);
  const durationSeconds = strictNumber(path?.cost?.duration ?? path?.duration);
  if (distanceMeters === null || durationSeconds === null || distanceMeters < 0 || durationSeconds < 0) {
    fail("INVALID_RESPONSE", "Map provider returned an invalid route");
  }
  return {
    id: `${input.from.id}:${input.to.id}:${input.mode}`,
    fromPlaceId: input.from.id,
    toPlaceId: input.to.id,
    mode: input.mode,
    distanceMeters,
    durationSeconds,
    provider: AMAP_PROVIDER,
    computedAt: computedAt.toISOString(),
    dataStatus: "fresh",
  };
}

export async function planAmapLeg(input, dependencies) {
  const normalizedInput = normalizedRouteInput(input);
  if (typeof dependencies?.now !== "function") fail("INVALID_INPUT", "A clock is required");
  const computedAt = validatedNow(dependencies.now);
  const isTransit = normalizedInput.mode === "transit";
  const path = isTransit ? "/v5/direction/transit/integrated" : `/v5/direction/${normalizedInput.mode}`;
  const body = await requestAmap(path, {
    origin: locationOf(normalizedInput.from),
    destination: locationOf(normalizedInput.to),
    ...(isTransit ? { city1: normalizedInput.city, city2: normalizedInput.city } : {}),
  }, dependencies);
  const paths = isTransit ? body.route?.transits : body.route?.paths;
  if (!Array.isArray(paths) || paths.length === 0) fail("NO_ROUTE", "Map provider returned no route");
  return normalizePath(paths[0], normalizedInput, computedAt);
}

export { MapProviderError };
