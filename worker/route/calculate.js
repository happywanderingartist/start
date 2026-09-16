const DEFAULT_IDEMPOTENCY_STORE = new Map();

function pairKey(fromPlaceId, toPlaceId) {
  return `${fromPlaceId}:${toPlaceId}`;
}

function routePairs(placeIds) {
  return placeIds.slice(1).map((toPlaceId, index) => pairKey(placeIds[index], toPlaceId));
}

function unavailableLeg(from, to, mode = "walk") {
  return {
    id: `${from.id}:${to.id}:${mode}`,
    fromPlaceId: from.id,
    toPlaceId: to.id,
    mode,
    distanceMeters: null,
    durationSeconds: null,
    provider: "amap",
    computedAt: null,
    dataStatus: "unavailable",
  };
}

function routeSummary(legs) {
  if (legs.some((leg) => leg.dataStatus === "unavailable" || leg.distanceMeters === null || leg.durationSeconds === null)) {
    return {
      transportDistanceMeters: null,
      transportDurationSeconds: null,
      dataStatus: "unavailable",
    };
  }
  return {
    transportDistanceMeters: legs.reduce((total, leg) => total + leg.distanceMeters, 0),
    transportDurationSeconds: legs.reduce((total, leg) => total + leg.durationSeconds, 0),
    dataStatus: legs.every((leg) => leg.dataStatus === "cached") ? "cached" : "fresh",
  };
}

function cacheInput(from, to, mode) {
  return {
    interfaceType: "route",
    fromPoiId: from.providerPoiId,
    toPoiId: to.providerPoiId,
    mode,
  };
}

async function cachedOrPlanned(from, to, mode, dependencies) {
  const input = cacheInput(from, to, mode);
  const cached = await dependencies.cache?.read(input);
  if (cached) return cached;

  try {
    const leg = await dependencies.planLeg({ from, to, city: from.city, mode });
    if (dependencies.cache) await dependencies.cache.write(input, leg);
    return leg;
  } catch {
    const fallback = await dependencies.cache?.read(input);
    return fallback ?? unavailableLeg(from, to, mode);
  }
}

function shouldEvaluateTransit(walkLeg) {
  return walkLeg.durationSeconds > 1800 || walkLeg.distanceMeters > 2000;
}

async function calculatePairs(places, pairs, preferredModes, dependencies) {
  if (!dependencies || typeof dependencies.planLeg !== "function") {
    throw new TypeError("A route leg planner is required");
  }
  const byId = new Map(places.map((place) => [place.id, place]));
  const wantsTransit = preferredModes.includes("transit");
  const legs = [];

  for (const key of pairs) {
    const [fromPlaceId, toPlaceId] = key.split(":");
    const from = byId.get(fromPlaceId);
    const to = byId.get(toPlaceId);
    if (!from || !to) throw new TypeError(`Route pair ${key} references a missing place`);

    const walkLeg = await cachedOrPlanned(from, to, "walk", dependencies);
    if (walkLeg.dataStatus === "unavailable" || !shouldEvaluateTransit(walkLeg)) {
      legs.push(walkLeg);
      continue;
    }

    const transitLeg = await cachedOrPlanned(from, to, "transit", dependencies);
    legs.push(wantsTransit && transitLeg.dataStatus !== "unavailable" ? transitLeg : walkLeg);
  }

  return legs;
}

export function affectedPairs(oldPlaceIds, newPlaceIds) {
  const existingPairs = new Set(routePairs(oldPlaceIds));
  return routePairs(newPlaceIds).filter((key) => !existingPairs.has(key));
}

export async function calculateRoute({ places, preferredModes = [] }, dependencies) {
  if (!Array.isArray(places)) throw new TypeError("places must be an array");
  const legs = await calculatePairs(places, routePairs(places.map((place) => place.id)), preferredModes, dependencies);
  return { legs, ...routeSummary(legs) };
}

export async function recalculateRoute({ previous, places, idempotencyKey }, dependencies) {
  if (!previous || !Array.isArray(places) || typeof idempotencyKey !== "string" || idempotencyKey.trim() === "") {
    throw new TypeError("previous route, places, and idempotencyKey are required");
  }
  const oldPlaceIds = previous.orderedPlaceIds ?? previous.stops?.map((stop) => stop.placeId);
  if (!Array.isArray(oldPlaceIds)) throw new TypeError("previous route place order is required");

  const newPlaceIds = places.map((place) => place.id);
  const requestKey = `${previous.id ?? "route"}:${idempotencyKey}:${newPlaceIds.join(",")}`;
  const store = dependencies?.idempotencyStore ?? DEFAULT_IDEMPOTENCY_STORE;
  if (store.has(requestKey)) return store.get(requestKey);

  const calculation = (async () => {
    const changedPairs = affectedPairs(oldPlaceIds, newPlaceIds);
    const changedLegs = await calculatePairs(places, changedPairs, previous.preferredModes ?? [], dependencies);
    const changedByPair = new Map(changedLegs.map((leg) => [pairKey(leg.fromPlaceId, leg.toPlaceId), leg]));
    const previousByPair = new Map((previous.legs ?? []).map((leg) => [pairKey(leg.fromPlaceId, leg.toPlaceId), leg]));
    const legs = routePairs(newPlaceIds).map((key) => changedByPair.get(key) ?? previousByPair.get(key));
    if (legs.some((leg) => !leg)) throw new TypeError("previous route is missing an unchanged leg");

    return {
      ...previous,
      version: (previous.version ?? 0) + 1,
      orderedPlaceIds: newPlaceIds,
      legs,
      ...routeSummary(legs),
    };
  })();
  store.set(requestKey, calculation);

  try {
    const result = await calculation;
    store.set(requestKey, result);
    return result;
  } catch (error) {
    if (store.get(requestKey) === calculation) store.delete(requestKey);
    throw error;
  }
}
