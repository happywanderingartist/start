import { confirmAmapPlace, planAmapLeg, searchAmapPlaces } from "./map/amap.js";
import { MapProviderError } from "./map/errors.js";
import { createMapCache } from "./map/cache.js";
import { calculateRoute, recalculateRoute } from "./route/calculate.js";

const MAX_ROUTE_PLACES = 20;
const MAX_IDEMPOTENCY_KEY_LENGTH = 128;
const PROVIDER_TIMEOUT_MS = 6_000;
const ROUTE_MODES = new Set(["walk", "transit", "drive", "ride"]);

class ApiError extends Error {
  constructor(status, code, message, retryable = false) {
    super(message);
    this.status = status;
    this.code = code;
    this.retryable = retryable;
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function routeInputError() {
  return new ApiError(400, "INVALID_ROUTE_INPUT", "路线参数无效");
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasAmapKey(value) {
  return typeof value === "string" && value.trim() !== "";
}

function requireMethod(request, method) {
  if (request.method !== method) throw new ApiError(405, "METHOD_NOT_ALLOWED", "请求方法不被支持");
}

async function readBody(request) {
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    throw new ApiError(400, "INVALID_JSON", "请求体必须为 JSON");
  }
  try {
    const body = await request.json();
    if (!isObject(body)) throw new TypeError("Invalid JSON object");
    return body;
  } catch {
    throw new ApiError(400, "INVALID_JSON", "请求体必须为 JSON");
  }
}

function validCoordinate(value, minimum, maximum) {
  return typeof value === "number" && Number.isFinite(value) && value >= minimum && value <= maximum;
}

function validStoredPlace(place, id) {
  return isObject(place)
    && place.id === id
    && place.provider === "amap"
    && place.verificationStatus === "confirmed"
    && typeof place.providerPoiId === "string" && place.providerPoiId.trim() !== ""
    && typeof place.city === "string" && place.city.trim() !== ""
    && typeof place.name === "string" && place.name.trim() !== ""
    && typeof place.address === "string"
    && typeof place.district === "string"
    && typeof place.category === "string"
    && place.coordinateSystem === "gcj02"
    && validCoordinate(place.longitude, -180, 180)
    && validCoordinate(place.latitude, -90, 90);
}

function placeIdsFrom(input) {
  if (!isObject(input) || Object.hasOwn(input, "places") || Object.hasOwn(input, "previous")
    || !Array.isArray(input.placeIds)
    || input.placeIds.length < 2 || input.placeIds.length > MAX_ROUTE_PLACES) {
    throw routeInputError();
  }
  const ids = input.placeIds.map((id) => typeof id === "string" ? id.trim() : "");
  if (ids.some((id) => id === "") || new Set(ids).size !== ids.length) throw routeInputError();
  return ids;
}

function preferredModesFrom(input) {
  if (!Object.hasOwn(input, "preferredModes")) return [];
  if (!Array.isArray(input.preferredModes) || input.preferredModes.some((mode) => !ROUTE_MODES.has(mode))
    || new Set(input.preferredModes).size !== input.preferredModes.length) {
    throw routeInputError();
  }
  return input.preferredModes;
}

function resolvePlaces(input, confirmedPlaceStore) {
  const ids = placeIdsFrom(input);
  const places = ids.map((id) => confirmedPlaceStore.get(id));
  if (places.some((place, index) => !validStoredPlace(place, ids[index]))) throw routeInputError();
  if (new Set(places.map((place) => place.city)).size !== 1) throw routeInputError();
  return { ids, places };
}

function validPreviousLeg(leg, fromPlaceId, toPlaceId) {
  return isObject(leg)
    && leg.fromPlaceId === fromPlaceId
    && leg.toPlaceId === toPlaceId
    && ROUTE_MODES.has(leg.mode)
    && leg.provider === "amap"
    && ["fresh", "cached", "unavailable"].includes(leg.dataStatus)
    && (leg.dataStatus === "unavailable"
      ? leg.distanceMeters === null && leg.durationSeconds === null && leg.computedAt === null
      : typeof leg.distanceMeters === "number" && Number.isFinite(leg.distanceMeters) && leg.distanceMeters >= 0
        && typeof leg.durationSeconds === "number" && Number.isFinite(leg.durationSeconds) && leg.durationSeconds >= 0
        && typeof leg.computedAt === "string" && leg.computedAt !== "");
}

function validatePrevious(previous) {
  if (!isObject(previous) || typeof previous.id !== "string" || previous.id.trim() === ""
    || !Number.isInteger(previous.version) || previous.version < 0
    || !Array.isArray(previous.orderedPlaceIds) || previous.orderedPlaceIds.length < 2
    || previous.orderedPlaceIds.length > MAX_ROUTE_PLACES
    || previous.orderedPlaceIds.some((id) => typeof id !== "string" || id.trim() === "")
    || new Set(previous.orderedPlaceIds).size !== previous.orderedPlaceIds.length
    || !Array.isArray(previous.legs) || previous.legs.length !== previous.orderedPlaceIds.length - 1) {
    throw routeInputError();
  }
  preferredModesFrom(previous);
  for (let index = 0; index < previous.legs.length; index += 1) {
    if (!validPreviousLeg(previous.legs[index], previous.orderedPlaceIds[index], previous.orderedPlaceIds[index + 1])) {
      throw routeInputError();
    }
  }
  return previous;
}

function validateIdempotencyKey(value) {
  if (typeof value !== "string" || value.trim() === "" || value.length > MAX_IDEMPOTENCY_KEY_LENGTH) {
    throw routeInputError();
  }
  return value;
}

function routeIdFrom(value) {
  if (typeof value !== "string" || value.trim() === "" || value.length > MAX_IDEMPOTENCY_KEY_LENGTH) {
    throw routeInputError();
  }
  return value.trim();
}

function baseVersionFrom(value) {
  if (!Number.isInteger(value) || value < 1) throw routeInputError();
  return value;
}

function routeVersionKey(routeId, version) {
  return `${encodeURIComponent(routeId)}:${version}`;
}

function currentRouteVersionKey(routeId) {
  return `${encodeURIComponent(routeId)}:current`;
}

function recalculateRequestKey(routeId, baseVersion, idempotencyKey, placeIds) {
  return `api-recalculate:${encodeURIComponent(routeId)}:${baseVersion}:${encodeURIComponent(idempotencyKey)}:${placeIds.map(encodeURIComponent).join(",")}`;
}

function defaultCreateRouteId() {
  return `route-${crypto.randomUUID()}`;
}

function providerMode(mode) {
  return { walk: "walking", ride: "bicycling", drive: "driving", transit: "transit" }[mode] ?? mode;
}

async function planRouteLeg(input, dependencies) {
  const leg = await planAmapLeg({ ...input, mode: providerMode(input.mode) }, dependencies);
  return { ...leg, id: `${input.from.id}:${input.to.id}:${input.mode}`, mode: input.mode };
}

function timeoutError() {
  return new MapProviderError("TIMEOUT", "Map provider request timed out", { retryable: true });
}

async function runProviderOperation(operation, fetchImpl, {
  externalSignal,
  timeoutMs = PROVIDER_TIMEOUT_MS,
  setTimeoutImpl = setTimeout,
  clearTimeoutImpl = clearTimeout,
} = {}) {
  if (typeof fetchImpl !== "function" || !Number.isFinite(timeoutMs) || timeoutMs <= 0
    || typeof setTimeoutImpl !== "function" || typeof clearTimeoutImpl !== "function"
    || typeof operation !== "function") {
    throw new TypeError("A valid provider operation deadline is required");
  }
  const controller = new AbortController();
  let timer;
  let rejectExternal;
  const externalAbort = new Promise((_, reject) => {
    rejectExternal = reject;
  });
  const onExternalAbort = () => {
    const error = new MapProviderError("NETWORK_ERROR", "Map provider request was aborted", { retryable: true });
    controller.abort(externalSignal?.reason);
    rejectExternal(error);
  };
  if (externalSignal?.aborted) onExternalAbort();
  else externalSignal?.addEventListener("abort", onExternalAbort, { once: true });

  const deadline = new Promise((_, reject) => {
    timer = setTimeoutImpl(() => {
      const error = timeoutError();
      controller.abort(error);
      reject(error);
    }, timeoutMs);
  });
  const providerFetch = (request) => fetchImpl(new Request(request, { signal: controller.signal }));
  try {
    return await Promise.race([
      Promise.resolve().then(() => operation(providerFetch)),
      deadline,
      externalAbort,
    ]);
  } finally {
    clearTimeoutImpl(timer);
    externalSignal?.removeEventListener("abort", onExternalAbort);
  }
}

function providerUnavailable() {
  return json({ error: { code: "MAP_PROVIDER_UNAVAILABLE", message: "地图数据暂时无法更新", retryable: true } }, 503);
}

function errorResponse(error) {
  if (error instanceof ApiError) return json({ error: { code: error.code, message: error.message, retryable: error.retryable } }, error.status);
  if (error instanceof MapProviderError) {
    if (error.code === "INVALID_INPUT") return json({ error: { code: "INVALID_INPUT", message: "请求参数无效", retryable: false } }, 400);
    if (error.code === "PLACE_NOT_FOUND") return json({ error: { code: "PLACE_NOT_FOUND", message: "地点未找到", retryable: false } }, 404);
    return providerUnavailable();
  }
  return json({ error: { code: "INTERNAL_ERROR", message: "地图接口请求失败", retryable: false } }, 500);
}

export function createApiHandler({
  amapKey,
  fetchImpl,
  cacheStorage,
  now,
  idempotencyStore = new Map(),
  confirmedPlaceStore = new Map(),
  routeStore = new Map(),
  createRouteId = defaultCreateRouteId,
  timeoutMs,
  setTimeoutImpl,
  clearTimeoutImpl,
} = {}) {
  const callProvider = (request, operation) => runProviderOperation(
    (providerFetch) => operation({ key: amapKey, fetchImpl: providerFetch, now }),
    fetchImpl,
    { externalSignal: request.signal, timeoutMs, setTimeoutImpl, clearTimeoutImpl },
  );

  return async function handleApiRequest(request) {
    const url = new URL(request.url);
    try {
      if (url.pathname === "/api/places/search") {
        requireMethod(request, "GET");
        if (!hasAmapKey(amapKey)) return providerUnavailable();
        return json(await callProvider(request, (dependencies) => searchAmapPlaces({
          keyword: url.searchParams.get("keyword"),
          city: url.searchParams.get("city"),
        }, dependencies)));
      }
      if (url.pathname === "/api/places/confirm") {
        requireMethod(request, "POST");
        if (!hasAmapKey(amapKey)) return providerUnavailable();
        const input = await readBody(request);
        const confirmed = await callProvider(request, (dependencies) => confirmAmapPlace(input, dependencies));
        const place = { ...confirmed, id: `amap-${encodeURIComponent(confirmed.providerPoiId)}` };
        confirmedPlaceStore.set(place.id, place);
        return json(place);
      }
      if (url.pathname === "/api/routes/calculate" || url.pathname === "/api/routes/recalculate") {
        requireMethod(request, "POST");
        if (!hasAmapKey(amapKey)) return providerUnavailable();
        const body = await readBody(request);
        const { ids: placeIds, places } = resolvePlaces(body, confirmedPlaceStore);
        const cache = cacheStorage && typeof cacheStorage.match === "function" && typeof cacheStorage.put === "function"
          ? createMapCache(cacheStorage, url.origin)
          : undefined;
        const routeDependencies = {
          planLeg: (input) => callProvider(request, (dependencies) => planRouteLeg(input, dependencies)),
          cache,
          idempotencyStore,
        };
        let result;
        if (url.pathname === "/api/routes/calculate") {
          if (Object.hasOwn(body, "routeId") || Object.hasOwn(body, "baseVersion") || Object.hasOwn(body, "idempotencyKey")) {
            throw routeInputError();
          }
          const preferredModes = preferredModesFrom(body);
          const calculated = await calculateRoute({ places, preferredModes }, routeDependencies);
          const id = routeIdFrom(createRouteId());
          result = { id, version: 1, orderedPlaceIds: placeIds, preferredModes, ...calculated };
          routeStore.set(routeVersionKey(result.id, result.version), result);
          routeStore.set(currentRouteVersionKey(result.id), result.version);
        } else {
          const routeId = routeIdFrom(body.routeId);
          const baseVersion = baseVersionFrom(body.baseVersion);
          const idempotencyKey = validateIdempotencyKey(body.idempotencyKey);
          const requestKey = recalculateRequestKey(routeId, baseVersion, idempotencyKey, placeIds);
          if (idempotencyStore.has(requestKey)) return json(await idempotencyStore.get(requestKey));
          const stored = routeStore.get(routeVersionKey(routeId, baseVersion));
          if (!stored) throw new ApiError(404, "ROUTE_VERSION_NOT_FOUND", "路线版本不存在");
          const currentKey = currentRouteVersionKey(routeId);
          const currentVersion = routeStore.has(currentKey) ? routeStore.get(currentKey) : baseVersion;
          if (currentVersion !== baseVersion) {
            throw new ApiError(409, "ROUTE_VERSION_CONFLICT", "路线已被更新");
          }
          const previous = validatePrevious(stored);
          const preferredModes = Object.hasOwn(body, "preferredModes")
            ? preferredModesFrom(body)
            : previous.preferredModes;
          const reservation = { baseVersion, requestKey };
          routeStore.set(currentKey, reservation);
          const calculation = (async () => {
            try {
              const next = await recalculateRoute({
                previous: { ...previous, preferredModes },
                places,
                idempotencyKey,
              }, routeDependencies);
              routeStore.set(routeVersionKey(next.id, next.version), next);
              routeStore.set(currentKey, next.version);
              return next;
            } catch (error) {
              if (routeStore.get(currentKey) === reservation) routeStore.set(currentKey, baseVersion);
              throw error;
            }
          })();
          idempotencyStore.set(requestKey, calculation);
          try {
            result = await calculation;
            idempotencyStore.set(requestKey, result);
          } catch (error) {
            if (idempotencyStore.get(requestKey) === calculation) idempotencyStore.delete(requestKey);
            throw error;
          }
        }
        return json(result);
      }
      return json({ error: { code: "API_NOT_FOUND", message: "接口不存在", retryable: false } }, 404);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
