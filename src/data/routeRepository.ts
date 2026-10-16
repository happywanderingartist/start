import type { RouteBundle } from "../domain/route";
import { routeBundle } from "./route";

const publishedRoutes = [{ bundle: routeBundle, path: "/routes/anpu-nanjing" }] as const;

function searchableText(bundle: RouteBundle): string {
  const placeText = bundle.route.stops.flatMap((stop) => {
    const place = bundle.places[stop.placeId];
    return [place.name, place.address, place.district, place.category];
  });
  return [bundle.route.title, bundle.route.city, bundle.route.artist, ...placeText]
    .join(" ")
    .toLocaleLowerCase("zh-CN");
}

export function searchPublishedRoutes(query: string): RouteBundle[] {
  const tokens = query.trim().toLocaleLowerCase("zh-CN").split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return publishedRoutes.map(({ bundle }) => bundle);
  return publishedRoutes.filter(({ bundle }) => {
    const text = searchableText(bundle);
    return tokens.every((token) => text.includes(token));
  }).map(({ bundle }) => bundle);
}

export function getPublishedRoute(routeId: string): RouteBundle | undefined {
  return publishedRoutes.find(({ bundle }) => bundle.route.id === routeId)?.bundle;
}

export function getPublishedRoutePath(routeId: string): string | undefined {
  return publishedRoutes.find(({ bundle }) => bundle.route.id === routeId)?.path;
}
