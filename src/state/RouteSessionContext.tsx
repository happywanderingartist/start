import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { route } from "../data/route";
import {
  createInitialProgress,
  loadProgress,
  progressReducer,
  saveProgress,
  type RouteProgress,
  type StorageLike,
} from "./routeSession";

export type MapProvider = "amap" | "baidu";

const MAP_STORAGE_KEY = "fan-route:map-preference:v1";
const SAVED_STORAGE_KEY = "fan-route:saved-routes:v1";

interface RouteSessionValue {
  progress: RouteProgress;
  activeMap: MapProvider | null;
  isSaved: boolean;
  toast: string | null;
  startRoute: () => void;
  arriveCurrentStop: () => void;
  restartRoute: () => void;
  chooseMap: (provider: MapProvider, remember: boolean) => void;
  toggleSaved: () => void;
  showToast: (message: string) => void;
}

const RouteSessionContext = createContext<RouteSessionValue | null>(null);

function getStorage(): StorageLike | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readMap(storage: StorageLike | null): MapProvider | null {
  if (!storage) return null;
  try {
    const value = storage.getItem(MAP_STORAGE_KEY);
    return value === "amap" || value === "baidu" ? value : null;
  } catch {
    return null;
  }
}

function readSaved(storage: StorageLike | null): boolean {
  if (!storage) return false;
  try {
    const ids: unknown = JSON.parse(storage.getItem(SAVED_STORAGE_KEY) ?? "[]");
    return Array.isArray(ids) && ids.includes(route.id);
  } catch {
    return false;
  }
}

export function RouteSessionProvider({ children }: { children: React.ReactNode }) {
  const storageRef = useRef<StorageLike | null>(getStorage());
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const storageWarningShown = useRef(false);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2800);
  }, []);

  const warnStorage = useCallback(() => {
    if (storageWarningShown.current) return;
    storageWarningShown.current = true;
    showToast("无法保存到本地，当前会话仍可继续");
  }, [showToast]);

  const [progress, dispatch] = useReducer(
    progressReducer,
    route.id,
    (routeId) => (storageRef.current ? loadProgress(storageRef.current, routeId, warnStorage, route.stops.map((stop) => stop.id)) : createInitialProgress(routeId)),
  );
  const [rememberedMap, setRememberedMap] = useState<MapProvider | null>(() => readMap(storageRef.current));
  const [sessionMap, setSessionMap] = useState<MapProvider | null>(null);
  const [isSaved, setIsSaved] = useState(() => readSaved(storageRef.current));

  useEffect(() => {
    if (storageRef.current) saveProgress(storageRef.current, progress, warnStorage);
  }, [progress, warnStorage]);

  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);

  const chooseMap = useCallback((provider: MapProvider, remember: boolean) => {
    setSessionMap(provider);
    if (!remember) return;
    setRememberedMap(provider);
    try {
      storageRef.current?.setItem(MAP_STORAGE_KEY, provider);
    } catch {
      warnStorage();
    }
  }, [warnStorage]);

  const toggleSaved = useCallback(() => {
    setIsSaved((current) => {
      const next = !current;
      try {
        storageRef.current?.setItem(SAVED_STORAGE_KEY, JSON.stringify(next ? [route.id] : []));
      } catch {
        warnStorage();
      }
      showToast(next ? "路线已收藏" : "已取消收藏");
      return next;
    });
  }, [showToast, warnStorage]);

  const value = useMemo<RouteSessionValue>(() => ({
    progress,
    activeMap: sessionMap ?? rememberedMap,
    isSaved,
    toast,
    startRoute: () => dispatch({ type: "start" }),
    arriveCurrentStop: () => {
      const stop = route.stops[progress.currentStopIndex];
      if (stop) dispatch({ type: "arrive", stopId: stop.id, stopIndex: progress.currentStopIndex, stopCount: route.stops.length });
    },
    restartRoute: () => {
      dispatch({ type: "reset" });
      dispatch({ type: "start" });
    },
    chooseMap,
    toggleSaved,
    showToast,
  }), [progress, sessionMap, rememberedMap, isSaved, toast, chooseMap, toggleSaved, showToast]);

  return <RouteSessionContext.Provider value={value}>{children}</RouteSessionContext.Provider>;
}

export function useRouteSession(): RouteSessionValue {
  const value = useContext(RouteSessionContext);
  if (!value) throw new Error("useRouteSession must be used inside RouteSessionProvider");
  return value;
}
