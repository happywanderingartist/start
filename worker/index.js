import { createApiHandler } from "./api.js";

async function serveAssets(request, env) {
  const response = await env.ASSETS.fetch(request);
  const acceptsHtml = request.headers.get("accept")?.includes("text/html");

  if (response.status !== 404 || !acceptsHtml || !["GET", "HEAD"].includes(request.method)) {
    return response;
  }

  const indexUrl = new URL(request.url);
  indexUrl.pathname = "/index.html";
  indexUrl.search = "";
  return env.ASSETS.fetch(new Request(indexUrl, request));
}

export function createWorker(overrides = {}) {
  const idempotencyStore = overrides.idempotencyStore ?? new Map();
  const confirmedPlaceStore = overrides.confirmedPlaceStore ?? new Map();
  const routeStore = overrides.routeStore ?? new Map();

  return {
    async fetch(request, env) {
      const pathname = new URL(request.url).pathname;
      if (pathname === "/api" || pathname.startsWith("/api/")) {
        const handler = createApiHandler({
          amapKey: env.AMAP_WEB_SERVICE_KEY,
          fetchImpl: overrides.fetchImpl ?? globalThis.fetch,
          cacheStorage: overrides.cacheStorage ?? globalThis.caches?.default,
          now: overrides.now ?? (() => new Date()),
          idempotencyStore,
          confirmedPlaceStore,
          routeStore,
          createRouteId: overrides.createRouteId,
          timeoutMs: overrides.timeoutMs,
          setTimeoutImpl: overrides.setTimeoutImpl,
          clearTimeoutImpl: overrides.clearTimeoutImpl,
        });
        return handler(request);
      }
      return serveAssets(request, env);
    },
  };
}

export default createWorker();
