import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "./App";
import { route } from "./data/route";
import { RouteSessionProvider } from "./state/RouteSessionContext";
import { PROGRESS_STORAGE_KEY } from "./state/routeSession";

const stopIds = route.stops.map((stop) => stop.id);

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <RouteSessionProvider>
        <AppRoutes />
      </RouteSessionProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe("fan route prototype", () => {
  it("introduces the star pet before the route prompt", () => {
    renderAt("/");

    const mascot = screen.getByRole("img", { name: "星粒正在等待你的路线灵感" });
    const prompt = screen.getByLabelText("想去哪里，想沿着谁的星迹？");

    expect(mascot.compareDocumentPosition(prompt) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole("heading", { name: "今天想沿着谁的星迹出发？" })).toBeInTheDocument();
  });

  it("moves from searching to ready before opening the route", () => {
    vi.useFakeTimers();
    renderAt("/");

    fireEvent.change(screen.getByLabelText("想去哪里，想沿着谁的星迹？"), { target: { value: "南京 安溥" } });
    fireEvent.click(screen.getByRole("button", { name: "整理路线" }));

    expect(screen.getByRole("img", { name: "星粒正在寻找路线" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("正在整理星迹");

    act(() => vi.advanceTimersByTime(760));
    expect(screen.getByRole("img", { name: "星粒已经找到路线" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("路线已找到，即将打开");

    act(() => vi.advanceTimersByTime(360));
    expect(screen.getByRole("heading", { name: "安溥·南京老城巷陌" })).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("writes quick conditions into the request and opens the recommended route", async () => {
    const user = userEvent.setup();
    renderAt("/");

    const input = screen.getByLabelText("想去哪里，想沿着谁的星迹？");
    const cityCondition = screen.getByRole("button", { name: "南京" });
    await user.click(cityCondition);
    expect(input).toHaveValue("南京");
    expect(cityCondition).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("link", { name: /查看安溥·南京老城巷陌/ }));
    expect(await screen.findByRole("heading", { name: "安溥·南京老城巷陌" })).toBeInTheDocument();
  });

  it("offers a visible entry to existing routes and focuses the recommendation", async () => {
    const user = userEvent.setup();
    renderAt("/");

    const entry = screen.getByRole("button", { name: "搜索已有路线" });
    expect(entry).toHaveTextContent("搜路线");
    await user.click(entry);

    expect(screen.getByRole("article")).toHaveFocus();
  });

  it("keeps multiple place cards expanded", async () => {
    const user = userEvent.setup();
    renderAt("/routes/anpu-nanjing");

    expect(screen.getByText("地点故事、图片和具体入口将在POI核验后补充。")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: `展开 ${route.stops[1].name}` }));
    expect(screen.getByText("具体关联信息与开放时间待补充。")).toBeInTheDocument();
    expect(screen.getByText("地点故事、图片和具体入口将在POI核验后补充。")).toBeInTheDocument();
  });

  it("starts through the map picker and remembers the selected provider", async () => {
    const user = userEvent.setup();
    renderAt("/routes/anpu-nanjing");

    await user.click(screen.getByRole("button", { name: "开始复刻" }));
    expect(screen.getByRole("dialog", { name: "选择地图" })).toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: "记住我的选择" }));
    await user.click(screen.getByRole("button", { name: "高德地图" }));

    expect(await screen.findByText("路线进行中")).toBeInTheDocument();
    expect(window.localStorage.getItem("fan-route:map-preference:v1")).toBe("amap");
    expect(JSON.parse(window.localStorage.getItem(PROGRESS_STORAGE_KEY) ?? "{}").status).toBe("in_progress");
  });

  it("returns from simulated navigation without advancing, then advances on arrival", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({
        routeId: "route-anpu-nanjing-old-city",
        status: "in_progress",
        currentStopIndex: 0,
        arrivedStopIds: [],
        updatedAt: "2026-09-14T00:00:00.000Z",
      }),
    );
    renderAt("/routes/anpu-nanjing/live");

    await user.click(screen.getByRole("button", { name: "导航下一站" }));
    await user.click(screen.getByRole("button", { name: "百度地图" }));
    expect(await screen.findByRole("heading", { name: "外部地图模拟" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "返回路线" }));

    expect(await screen.findByRole("heading", { name: "古秦淮" })).toBeInTheDocument();
    expect(screen.getByText("0 / 5")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "我已到达" }));
    expect(await screen.findByRole("heading", { name: route.stops[1].name })).toBeInTheDocument();
    expect(screen.getByText("1 / 5")).toBeInTheDocument();
  });

  it("shows one brief arrival state before advancing and persisting exactly once", () => {
    vi.useFakeTimers();
    window.localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({
        routeId: "route-anpu-nanjing-old-city",
        status: "in_progress",
        currentStopIndex: 0,
        arrivedStopIds: [],
        updatedAt: "2026-09-14T00:00:00.000Z",
      }),
    );
    renderAt("/routes/anpu-nanjing/live");

    expect(screen.getByRole("img", { name: "星粒正在陪你前进" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "我已到达" }));

    expect(screen.getByRole("img", { name: "星粒正在庆祝到站" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "我已到达" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "导航下一站" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "重新开始" })).toBeDisabled();
    expect(screen.getByRole("heading", { name: "古秦淮" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "我已到达" }));

    act(() => vi.advanceTimersByTime(619));
    expect(screen.getByRole("heading", { name: "古秦淮" })).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole("heading", { name: route.stops[1].name })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "星粒正在陪你前进" })).toBeInTheDocument();
    expect(screen.getByText("1 / 5")).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(PROGRESS_STORAGE_KEY) ?? "{}").arrivedStopIds).toEqual([stopIds[0]]);
  });

  it("moves from final-stop arrival feedback into the compact completion state", () => {
    vi.useFakeTimers();
    window.localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({
        routeId: "route-anpu-nanjing-old-city",
        status: "in_progress",
        currentStopIndex: 4,
        arrivedStopIds: stopIds.slice(0, 4),
        updatedAt: "2026-09-14T00:00:00.000Z",
      }),
    );
    renderAt("/routes/anpu-nanjing/live");

    fireEvent.click(screen.getByRole("button", { name: "我已到达" }));
    expect(screen.getByRole("img", { name: "星粒正在庆祝到站" })).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(620));
    expect(screen.getByRole("heading", { name: "星迹已完成" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "星粒正在庆祝路线完成" })).toBeInTheDocument();
  });

  it("cancels pending arrival work when the live route unmounts", () => {
    vi.useFakeTimers();
    window.localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({
        routeId: "route-anpu-nanjing-old-city",
        status: "in_progress",
        currentStopIndex: 0,
        arrivedStopIds: [],
        updatedAt: "2026-09-14T00:00:00.000Z",
      }),
    );
    const view = renderAt("/routes/anpu-nanjing/live");

    fireEvent.click(screen.getByRole("button", { name: "我已到达" }));
    view.unmount();
    act(() => vi.advanceTimersByTime(620));

    expect(JSON.parse(window.localStorage.getItem(PROGRESS_STORAGE_KEY) ?? "{}").arrivedStopIds).toEqual([]);
  });

  it("shows completion and requires confirmation before resetting", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({
        routeId: "route-anpu-nanjing-old-city",
        status: "completed",
        currentStopIndex: 4,
        arrivedStopIds: stopIds,
        updatedAt: "2026-09-14T00:00:00.000Z",
      }),
    );
    renderAt("/routes/anpu-nanjing/live");

    expect(screen.getByRole("heading", { name: "星迹已完成" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "星粒正在庆祝路线完成" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "重新开始" }));
    expect(screen.getByRole("dialog", { name: "重新开始这条路线？" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "确认重新开始" }));
    expect(await screen.findByRole("heading", { name: "古秦淮" })).toBeInTheDocument();
    expect(screen.getByText("0 / 5")).toBeInTheDocument();
  });

  it("gives feedback for an unavailable bottom navigation item", async () => {
    const user = userEvent.setup();
    renderAt("/");
    await user.click(screen.getByRole("button", { name: "社区" }));
    expect(screen.getByRole("status")).toHaveTextContent("社区将在后续版本开放");
  });
});
