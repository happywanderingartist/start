export type RouteStatus = "not_started" | "in_progress" | "completed";

export interface RouteProgress {
  routeId: string;
  status: RouteStatus;
  currentStopIndex: number;
  arrivedStopIds: string[];
  updatedAt: string | null;
}

export type ProgressAction =
  | { type: "start" }
  | { type: "arrive"; stopId: string; stopIndex: number; stopCount: number }
  | { type: "reset" };

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const PROGRESS_STORAGE_KEY = "fan-route:anpu-nanjing:progress:v1";

export function createInitialProgress(routeId: string): RouteProgress {
  return {
    routeId,
    status: "not_started",
    currentStopIndex: 0,
    arrivedStopIds: [],
    updatedAt: null,
  };
}

export function progressReducer(progress: RouteProgress, action: ProgressAction): RouteProgress {
  if (action.type === "reset") return createInitialProgress(progress.routeId);
  if (action.type === "start") {
    if (progress.status !== "not_started") return progress;
    return { ...progress, status: "in_progress", updatedAt: new Date().toISOString() };
  }
  if (
    progress.status !== "in_progress" ||
    action.stopIndex !== progress.currentStopIndex ||
    progress.arrivedStopIds.includes(action.stopId)
  ) return progress;

  const arrivedStopIds = [...progress.arrivedStopIds, action.stopId];
  const completed = arrivedStopIds.length >= action.stopCount;
  return {
    ...progress,
    status: completed ? "completed" : "in_progress",
    currentStopIndex: completed ? action.stopCount - 1 : Math.min(progress.currentStopIndex + 1, action.stopCount - 1),
    arrivedStopIds,
    updatedAt: new Date().toISOString(),
  };
}

function isProgress(value: unknown, routeId: string, stopIds: readonly string[]): value is RouteProgress {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<RouteProgress>;
  const hasValidShape = (
    candidate.routeId === routeId &&
    ["not_started", "in_progress", "completed"].includes(candidate.status ?? "") &&
    Number.isInteger(candidate.currentStopIndex) &&
    (candidate.currentStopIndex ?? -1) >= 0 &&
    Array.isArray(candidate.arrivedStopIds) &&
    candidate.arrivedStopIds.every((id) => typeof id === "string") &&
    (candidate.updatedAt === null || typeof candidate.updatedAt === "string")
  );
  if (!hasValidShape || stopIds.length === 0) return hasValidShape;

  const currentStopIndex = candidate.currentStopIndex as number;
  const arrivedStopIds = candidate.arrivedStopIds as string[];
  if (currentStopIndex >= stopIds.length || new Set(arrivedStopIds).size !== arrivedStopIds.length) return false;
  if (!arrivedStopIds.every((id, index) => id === stopIds[index])) return false;
  if (candidate.status === "not_started") return currentStopIndex === 0 && arrivedStopIds.length === 0;
  if (candidate.status === "completed") return currentStopIndex === stopIds.length - 1 && arrivedStopIds.length === stopIds.length;
  return arrivedStopIds.length < stopIds.length && currentStopIndex === arrivedStopIds.length;
}

export function loadProgress(storage: StorageLike, routeId: string, onError: () => void, stopIds: readonly string[] = []): RouteProgress {
  try {
    const raw = storage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return createInitialProgress(routeId);
    const parsed: unknown = JSON.parse(raw);
    if (!isProgress(parsed, routeId, stopIds)) throw new Error("invalid progress");
    return parsed;
  } catch {
    onError();
    return createInitialProgress(routeId);
  }
}

export function saveProgress(storage: StorageLike, progress: RouteProgress, onError: () => void): void {
  try {
    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    onError();
  }
}
