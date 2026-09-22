import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { searchAmapPlaces, planAmapLeg } from "../worker/map/amap.js";
import { calculateRoute } from "../worker/route/calculate.js";

const SOURCE_PATH = new URL("../docs/seed/route-anpu-nanjing.source.json", import.meta.url);
const CANDIDATES_PATH = new URL("../docs/seed/route-anpu-nanjing.candidates.json", import.meta.url);
const CONFIRMED_SEED_PATH = new URL("../docs/seed/route-anpu-nanjing.json", import.meta.url);

function requireText(value, label) {
  if (typeof value !== "string" || value.trim() === "") throw new TypeError(`${label} is required`);
  return value.trim();
}

function sourcePlaces(source) {
  if (!source || !Array.isArray(source.places) || source.places.length !== 5) {
    throw new TypeError("Seed source must contain exactly five places");
  }
  return source.places.map((place, index) => {
    if (!place || typeof place !== "object") throw new TypeError(`Seed source place ${index + 1} is invalid`);
    return {
      ...place,
      id: requireText(place.id, `Seed source place ${index + 1} id`),
      keyword: requireText(place.keyword, `Seed source place ${index + 1} keyword`),
    };
  });
}

function candidateId(candidate, label) {
  if (!candidate || typeof candidate !== "object") throw new TypeError(`${label} is invalid`);
  return requireText(candidate.providerPoiId, `${label} providerPoiId`);
}

function confirmedPlace(candidate, sourceCity) {
  const providerPoiId = candidateId(candidate, "Selected candidate");
  const requiredFields = ["city", "name", "address", "district", "category", "provider", "coordinateSystem"];
  for (const field of requiredFields) requireText(candidate[field], `Selected candidate ${field}`);
  if (candidate.provider !== "amap" || candidate.coordinateSystem !== "gcj02") {
    throw new TypeError("Selected candidate must be an AMap GCJ-02 place");
  }
  if (candidate.city !== sourceCity) throw new TypeError("Selected candidate city must match the seed source city");
  if (!Number.isFinite(candidate.longitude) || !Number.isFinite(candidate.latitude) || candidate.longitude < -180 || candidate.longitude > 180 || candidate.latitude < -90 || candidate.latitude > 90) {
    throw new TypeError("Selected candidate must include valid in-range coordinates");
  }
  return {
    id: `amap-${encodeURIComponent(providerPoiId)}`,
    city: candidate.city,
    name: candidate.name,
    address: candidate.address,
    district: candidate.district,
    category: candidate.category,
    provider: "amap",
    providerPoiId,
    coordinateSystem: "gcj02",
    longitude: candidate.longitude,
    latitude: candidate.latitude,
    verificationStatus: "confirmed",
  };
}

export function withProviderDeadline(operation, {
  timeoutMs = 8_000,
  setTimeoutImpl = setTimeout,
  clearTimeoutImpl = clearTimeout,
} = {}) {
  if (typeof operation !== "function") throw new TypeError("A provider operation is required");
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new TypeError("A positive provider timeout is required");
  if (typeof setTimeoutImpl !== "function" || typeof clearTimeoutImpl !== "function") {
    throw new TypeError("Provider deadline timers are required");
  }
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    let settled = false;
    let timer;
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      clearTimeoutImpl(timer);
      callback(value);
    };
    timer = setTimeoutImpl(() => {
      const error = new Error("Map provider operation timed out");
      error.code = "PROVIDER_TIMEOUT";
      error.retryable = true;
      controller.abort(error);
      finish(reject, error);
    }, timeoutMs);
    Promise.resolve().then(() => operation(controller.signal)).then(
      (value) => finish(resolve, value),
      (error) => finish(reject, error),
    );
  });
}

export function fetchWithSignal(signal, fetchImpl) {
  if (!(signal instanceof AbortSignal)) throw new TypeError("A provider abort signal is required");
  if (typeof fetchImpl !== "function") throw new TypeError("A fetch implementation is required");
  return (request) => fetchImpl(new Request(request, { signal }));
}

export async function withRetryableProviderRetry(operation, {
  maxAttempts = 2,
  delayMs = 1_100,
  sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
} = {}) {
  if (typeof operation !== "function") throw new TypeError("A retryable provider operation is required");
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) throw new TypeError("Provider retry attempts must be a positive integer");
  if (!Number.isFinite(delayMs) || delayMs < 0) throw new TypeError("Provider retry delay must be non-negative");
  if (typeof sleep !== "function") throw new TypeError("A provider retry sleep function is required");

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (error?.retryable !== true || attempt === maxAttempts) throw error;
      await sleep(delayMs);
    }
  }
  throw new Error("Provider retry attempts were exhausted");
}

function summaryFromLegs(legs) {
  if (legs.some((leg) => leg.dataStatus === "unavailable" || leg.distanceMeters === null || leg.durationSeconds === null)) {
    return { transportDistanceMeters: null, transportDurationSeconds: null };
  }
  return {
    transportDistanceMeters: legs.reduce((total, leg) => total + leg.distanceMeters, 0),
    transportDurationSeconds: legs.reduce((total, leg) => total + leg.durationSeconds, 0),
  };
}

function assertCalculatedLegs(legs, places) {
  if (!Array.isArray(legs) || legs.length !== places.length - 1) {
    throw new TypeError("Route calculation must return one leg for each adjacent place pair");
  }
  legs.forEach((leg, index) => {
    if (!leg || leg.fromPlaceId !== places[index].id || leg.toPlaceId !== places[index + 1].id) {
      throw new TypeError("Route calculation returned a leg that does not connect adjacent places");
    }
    if (!["walk", "transit", "drive", "ride"].includes(leg.mode)) throw new TypeError("Route calculation returned an invalid leg mode");
    if (leg.provider !== "amap") throw new TypeError("Route calculation returned an invalid leg provider");
    if (!["fresh", "cached", "unavailable"].includes(leg.dataStatus)) throw new TypeError("Route calculation returned an invalid leg dataStatus");
    if (leg.id !== `${leg.fromPlaceId}:${leg.toPlaceId}:${leg.mode}`) throw new TypeError("Route calculation returned an invalid leg id");
    if (leg.dataStatus === "unavailable") {
      if (leg.distanceMeters !== null || leg.durationSeconds !== null || leg.computedAt !== null) {
        throw new TypeError("Unavailable legs must have null metrics and computedAt");
      }
      return;
    }
    if (!Number.isFinite(leg.distanceMeters) || !Number.isFinite(leg.durationSeconds) || leg.distanceMeters < 0 || leg.durationSeconds < 0) {
      throw new TypeError("Available legs must include non-negative finite metrics");
    }
    if (typeof leg.computedAt !== "string" || Number.isNaN(Date.parse(leg.computedAt)) || new Date(leg.computedAt).toISOString() !== leg.computedAt) {
      throw new TypeError("Available legs must include an ISO computedAt timestamp");
    }
  });
}

export async function searchSeedCandidates(source, dependencies) {
  if (typeof dependencies?.searchPlaces !== "function") throw new TypeError("A seed place search function is required");
  const places = sourcePlaces(source);
  const candidateSets = [];
  for (const place of places) {
    const candidates = await (dependencies.withDeadline ?? withProviderDeadline)(
      (signal) => dependencies.searchPlaces(
        { keyword: place.keyword, city: requireText(source.city, "Seed source city") },
        { signal },
      ),
    );
    if (!Array.isArray(candidates) || candidates.length < 1 || candidates.length > 10) {
      throw new TypeError(`Seed candidate search for ${place.id} must return 1 to 10 candidates`);
    }
    candidates.forEach((candidate, index) => candidateId(candidate, `Candidate ${index + 1}`));
    candidateSets.push({ sourcePlaceId: place.id, keyword: place.keyword, candidates });
  }
  return candidateSets;
}

export function assertCandidateDocument(source, candidateDocument) {
  if (!candidateDocument || candidateDocument.routeId !== requireText(source.id, "Seed source id")) {
    throw new TypeError("Candidate document routeId must match the seed source id");
  }
  if (!Array.isArray(candidateDocument.candidateSets)) throw new TypeError("Candidate document must contain candidateSets");
  return candidateDocument.candidateSets;
}

export function confirmSeedCandidates(source, candidateSets, selectedPoiIds) {
  const sourcePlaceList = sourcePlaces(source);
  if (!Array.isArray(candidateSets) || candidateSets.length !== sourcePlaceList.length) {
    throw new TypeError("Seed confirmation requires candidate sets for all five source places");
  }
  if (!Array.isArray(selectedPoiIds) || selectedPoiIds.length !== sourcePlaceList.length) {
    throw new TypeError("Seed confirmation requires exactly five selected providerPoiIds");
  }
  const selectedIds = selectedPoiIds.map((id) => requireText(id, "Selected providerPoiId"));
  if (new Set(selectedIds).size !== selectedIds.length) {
    throw new TypeError("Seed confirmation requires unique selected providerPoiIds");
  }

  const places = Object.create(null);
  const stops = sourcePlaceList.map((sourcePlace, index) => {
    const candidateSet = candidateSets[index];
    if (!candidateSet || candidateSet.sourcePlaceId !== sourcePlace.id || candidateSet.keyword !== sourcePlace.keyword || !Array.isArray(candidateSet.candidates)) {
      throw new TypeError("Seed candidate sets must match the source place order and keyword");
    }
    const selectedId = selectedIds[index];
    const candidate = candidateSet.candidates.find((item) => item?.providerPoiId === selectedId);
    if (!candidate) {
      throw new TypeError("Each selected providerPoiId must belong to its matching candidate set");
    }
    const place = confirmedPlace(candidate, requireText(source.city, "Seed source city"));
    places[place.id] = place;
    return {
      placeId: place.id,
      order: index + 1,
      suggestedStayMinutes: Number.isFinite(sourcePlace.suggestedStayMinutes) ? sourcePlace.suggestedStayMinutes : 0,
      visitStatus: "upcoming",
      story: typeof sourcePlace.story === "string"
        ? sourcePlace.story
        : typeof sourcePlace.detail === "string"
          ? sourcePlace.detail
          : typeof sourcePlace.summary === "string"
            ? sourcePlace.summary
            : "",
      checkInTips: Array.isArray(sourcePlace.checkInTips) ? sourcePlace.checkInTips.filter((tip) => typeof tip === "string") : [],
      imageUrls: Array.isArray(sourcePlace.imageUrls) ? sourcePlace.imageUrls.filter((url) => typeof url === "string") : [],
    };
  });

  return {
    route: {
      id: requireText(source.id, "Seed source id"),
      version: 1,
      title: requireText(source.title, "Seed source title"),
      city: requireText(source.city, "Seed source city"),
      artist: requireText(source.artist, "Seed source artist"),
      stops,
      legs: [],
      transportDistanceMeters: null,
      transportDurationSeconds: null,
      suggestedTotalMinutes: null,
    },
    places,
  };
}

export async function calculateConfirmedSeed(bundle, dependencies) {
  if (!bundle?.route || !bundle.places || !Array.isArray(bundle.route.stops)) {
    throw new TypeError("A confirmed seed bundle is required");
  }
  if (typeof dependencies?.calculateRoute !== "function") throw new TypeError("A route calculation function is required");
  const places = bundle.route.stops.map((stop) => bundle.places[stop.placeId]);
  if (places.some((place) => !place)) throw new TypeError("Confirmed seed stops must reference places");

  const calculation = await dependencies.calculateRoute({ places, preferredModes: ["transit"] });
  const legs = calculation?.legs;
  assertCalculatedLegs(legs, places);
  const summary = summaryFromLegs(legs);
  const suggestedStayMinutes = bundle.route.stops.reduce((total, stop) => total + stop.suggestedStayMinutes, 0);
  return {
    route: {
      ...bundle.route,
      legs,
      ...summary,
      suggestedTotalMinutes: summary.transportDurationSeconds === null
        ? null
        : Math.ceil(summary.transportDurationSeconds / 60) + suggestedStayMinutes,
    },
    places: bundle.places,
  };
}

function parseSelections(text) {
  const parsed = JSON.parse(text);
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.selectedPoiIds)) return parsed.selectedPoiIds;
  throw new TypeError("Selection file must contain selectedPoiIds");
}

function requireAmapKey() {
  return requireText(process.env.AMAP_WEB_SERVICE_KEY, "AMAP_WEB_SERVICE_KEY");
}

function selectionPath(args) {
  if (args.length !== 2 || args[0] !== "--selections") {
    throw new TypeError("confirm requires --selections <path>");
  }
  return args[1];
}

async function runCandidates() {
  const key = requireAmapKey();
  const source = JSON.parse(await readFile(SOURCE_PATH, "utf8"));
  const candidateSets = await searchSeedCandidates(source, {
    withDeadline: (operation) => withRetryableProviderRetry(
      () => withProviderDeadline(operation),
    ),
    searchPlaces: (input, { signal }) => searchAmapPlaces(input, {
      key,
      fetchImpl: fetchWithSignal(signal, fetch),
    }),
  });
  await writeFile(CANDIDATES_PATH, `${JSON.stringify({ routeId: source.id, candidateSets }, null, 2)}\n`, "utf8");
}

async function runConfirm(args) {
  const selectionsFile = selectionPath(args);
  const key = requireAmapKey();
  const [sourceText, candidatesText, selectionsText] = await Promise.all([
    readFile(SOURCE_PATH, "utf8"),
    readFile(CANDIDATES_PATH, "utf8"),
    readFile(selectionsFile, "utf8"),
  ]);
  const source = JSON.parse(sourceText);
  const candidates = JSON.parse(candidatesText);
  const selectedPoiIds = parseSelections(selectionsText);
  const uncalculatedBundle = confirmSeedCandidates(source, assertCandidateDocument(source, candidates), selectedPoiIds);
  const bundle = await calculateConfirmedSeed(uncalculatedBundle, {
    calculateRoute: ({ places, preferredModes }) => calculateRoute({ places, preferredModes }, {
      planLeg: async (input) => {
        const mode = input.mode === "walk" ? "walking" : input.mode;
        const leg = await withRetryableProviderRetry(
          () => withProviderDeadline(
            (signal) => planAmapLeg({ ...input, mode }, {
              key,
              fetchImpl: fetchWithSignal(signal, fetch),
              now: () => new Date(),
            }),
          ),
        );
        return { ...leg, id: `${input.from.id}:${input.to.id}:${input.mode}`, mode: input.mode };
      },
    }),
  });
  await writeFile(CONFIRMED_SEED_PATH, `${JSON.stringify(bundle, null, 2)}\n`, "utf8");
}

async function runCli() {
  const [command, ...args] = process.argv.slice(2);
  if (command === "candidates" && args.length === 0) return runCandidates();
  if (command === "confirm") return runConfirm(args);
  throw new TypeError("Usage: confirm-seed-places.mjs candidates | confirm --selections <path>");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runCli().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
