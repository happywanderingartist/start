import { Info, MapPin } from "@phosphor-icons/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ActionDock } from "../components/ActionDock";
import { TopBar } from "../components/AppChrome";
import { ConfirmDialog, InfoDialog, MapPicker } from "../components/Dialogs";
import { RouteTimeline } from "../components/RouteTimeline";
import { route } from "../data/route";
import { useRouteSession, type MapProvider } from "../state/RouteSessionContext";

export function RouteDetailPage() {
  const navigate = useNavigate();
  const { progress, activeMap, startRoute, restartRoute, chooseMap } = useRouteSession();
  const [expanded, setExpanded] = useState(() => new Set([route.stops[0].id]));
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [showRestart, setShowRestart] = useState(false);

  const enterLive = () => {
    if (progress.status === "completed") {
      setShowRestart(true);
      return;
    }
    if (progress.status === "in_progress") {
      navigate("/routes/anpu-nanjing/live");
      return;
    }
    if (!activeMap) {
      setShowMapPicker(true);
      return;
    }
    startRoute();
    navigate("/routes/anpu-nanjing/live");
  };

  const selectMap = (provider: MapProvider, remember: boolean) => {
    chooseMap(provider, remember);
    startRoute();
    setShowMapPicker(false);
    navigate("/routes/anpu-nanjing/live");
  };

  const toggle = (id: string) => setExpanded((current) => {
    const next = new Set(current);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const primaryLabel = progress.status === "in_progress" ? "继续路线" : progress.status === "completed" ? "再次复刻" : "开始复刻";

  return (
    <main className="screen detail-screen with-action-dock">
      <section className="detail-hero">
        <img className="hero-art" src="/assets/nanjing-abstract-city.png" alt="" />
        <TopBar />
        <div className="detail-heading">
          <h1>{route.title}</h1>
          <p><MapPin size={18} weight="fill" />{route.city} · {route.stops.length} 个地点 · {route.estimatedTotalMinutes === null ? "时长暂不可用" : `约 ${route.estimatedTotalMinutes} 分钟`}</p>
          <span className="data-disclosure"><Info size={17} />原型路线，POI 待核验</span>
        </div>
      </section>
      <section className="route-section" aria-label="路线站点">
        <RouteTimeline stops={route.stops} expanded={expanded} onToggle={toggle} />
      </section>
      <ActionDock secondaryLabel="调整路线" primaryLabel={primaryLabel} onSecondary={() => setShowAdjust(true)} onPrimary={enterLive} />
      {showMapPicker && <MapPicker onClose={() => setShowMapPicker(false)} onSelect={selectMap} />}
      {showAdjust && <InfoDialog title="调整路线" copy="路线编辑将在后续版本开放。本轮原型先验证查看、导航与推进路线的主流程。" onClose={() => setShowAdjust(false)} />}
      {showRestart && <ConfirmDialog onClose={() => setShowRestart(false)} onConfirm={() => { restartRoute(); setShowRestart(false); navigate("/routes/anpu-nanjing/live"); }} />}
    </main>
  );
}
