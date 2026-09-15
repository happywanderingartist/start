import { describe, expect, it, vi } from "vitest";
import {
  createInitialProgress,
  loadProgress,
  progressReducer,
  saveProgress,
  type StorageLike,
} from "./routeSession";

const routeId = "route-anpu-nanjing-old-city";

describe("progressReducer", () => {
  it("starts a route at the first target", () => {
    const next = progressReducer(createInitialProgress(routeId), { type: "start" });
    expect(next).toMatchObject({ status: "in_progress", currentStopIndex: 0, arrivedStopIds: [] });
  });

  it("advances only when the current stop is marked arrived", () => {
    const started = progressReducer(createInitialProgress(routeId), { type: "start" });
    const next = progressReducer(started, { type: "arrive", stopId: "stop-1", stopIndex: 0, stopCount: 5 });
    expect(next).toMatchObject({ status: "in_progress", currentStopIndex: 1, arrivedStopIds: ["stop-1"] });
  });

  it("enters completed state after the fifth arrival", () => {
    let progress = progressReducer(createInitialProgress(routeId), { type: "start" });
    for (let index = 1; index <= 5; index += 1) {
      progress = progressReducer(progress, { type: "arrive", stopId: `stop-${index}`, stopIndex: index - 1, stopCount: 5 });
    }
    expect(progress.status).toBe("completed");
    expect(progress.arrivedStopIds).toHaveLength(5);
  });

  it("resets to a clean not-started state", () => {
    const started = progressReducer(createInitialProgress(routeId), { type: "start" });
    expect(progressReducer(started, { type: "reset" })).toEqual(createInitialProgress(routeId));
  });

  it("rejects a stale arrival from a different stop index", () => {
    const restarted = progressReducer(createInitialProgress(routeId), { type: "start" });
    const staleArrival = { type: "arrive", stopId: "stop-3", stopIndex: 2, stopCount: 5 } as const;

    expect(progressReducer(restarted, staleArrival)).toEqual(restarted);
  });
});

describe("progress storage", () => {
  it("falls back safely when stored JSON is malformed", () => {
    const onError = vi.fn();
    const storage: StorageLike = {
      getItem: () => "not-json",
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    expect(loadProgress(storage, routeId, onError)).toEqual(createInitialProgress(routeId));
    expect(onError).toHaveBeenCalledOnce();
  });

  it("reports write failures without throwing", () => {
    const onError = vi.fn();
    const storage: StorageLike = {
      getItem: vi.fn(),
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: vi.fn(),
    };
    expect(() => saveProgress(storage, createInitialProgress(routeId), onError)).not.toThrow();
    expect(onError).toHaveBeenCalledOnce();
  });

  it("rejects persisted progress that is out of range or skips the route order", () => {
    const stopIds = ["stop-1", "stop-2", "stop-3", "stop-4", "stop-5"];
    const onError = vi.fn();
    const snapshots = [
      { routeId, status: "in_progress", currentStopIndex: 9, arrivedStopIds: [], updatedAt: null },
      { routeId, status: "in_progress", currentStopIndex: 1, arrivedStopIds: ["stop-2"], updatedAt: null },
      { routeId, status: "completed", currentStopIndex: 4, arrivedStopIds: ["stop-1"], updatedAt: null },
    ];

    for (const snapshot of snapshots) {
      const storage: StorageLike = {
        getItem: () => JSON.stringify(snapshot),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      };
      expect(loadProgress(storage, routeId, onError, stopIds)).toEqual(createInitialProgress(routeId));
    }
    expect(onError).toHaveBeenCalledTimes(3);
  });
});
