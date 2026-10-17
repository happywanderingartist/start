export const CACHE_TTL_SECONDS = {
  walk: 2_592_000,
  ride: 2_592_000,
  drive: 2_592_000,
  transit: 86_400,
};

function cachePart(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${field} is required for a map cache key`);
  }
  return encodeURIComponent(value.trim());
}

function withTrailingSlash(baseUrl) {
  return String(baseUrl).endsWith("/") ? String(baseUrl) : `${baseUrl}/`;
}

export function createMapCache(cacheStorage, baseUrl) {
  if (!cacheStorage || typeof cacheStorage.match !== "function" || typeof cacheStorage.put !== "function") {
    throw new TypeError("A Cache API compatible cache storage is required");
  }
  if (typeof baseUrl !== "string" || baseUrl.trim() === "") {
    throw new TypeError("A base URL is required for map cache keys");
  }

  function key({ interfaceType, fromPoiId, toPoiId, mode }) {
    return new URL(
      `map/${cachePart(interfaceType, "interfaceType")}/${cachePart(fromPoiId, "fromPoiId")}/${cachePart(toPoiId, "toPoiId")}/${cachePart(mode, "mode")}`,
      withTrailingSlash(baseUrl),
    ).toString();
  }

  async function read(input) {
    const response = await cacheStorage.match(new Request(key(input)));
    if (!response) return null;
    const leg = await response.json();
    return { ...leg, dataStatus: "cached" };
  }

  async function write(input, leg) {
    const ttl = CACHE_TTL_SECONDS[leg?.mode];
    if (!ttl) throw new TypeError("A supported travel mode is required for cached legs");
    const response = new Response(JSON.stringify(leg), {
      headers: {
        "content-type": "application/json",
        "cache-control": `public, max-age=${ttl}`,
      },
    });
    await cacheStorage.put(new Request(key(input)), response);
  }

  return { key, read, write };
}
