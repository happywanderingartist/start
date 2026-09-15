import { ArrowLeft, MapPin, NavigationArrow } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { route } from "../data/route";
import { useRouteSession } from "../state/RouteSessionContext";

export function NavigationSimulationPage() {
  const navigate = useNavigate();
  const { progress, activeMap } = useRouteSession();
  const destination = route.stops[progress.currentStopIndex] ?? route.stops[0];
  const provider = activeMap === "baidu" ? "百度地图" : "高德地图";
  return (
    <main className="screen simulation-screen">
      <div className="simulation-art"><img src="/assets/nanjing-abstract-city.png" alt="" /></div>
      <button aria-label="返回路线（顶部）" className="simulation-back" type="button" onClick={() => navigate("/routes/anpu-nanjing/live")}><ArrowLeft size={20} weight="bold" />返回路线</button>
      <section className="simulation-panel glass">
        <span className="simulation-icon"><NavigationArrow size={30} weight="fill" /></span>
        <p className="eyebrow">{provider} · 模拟打开</p>
        <h1>外部地图模拟</h1>
        <p className="simulation-note">此页面只模拟离开产品后的导航流程，没有接入真实地图或实时位置。</p>
        <div className="simulation-destination"><MapPin size={20} weight="fill" /><span><small>目的地</small><strong>{destination.name}</strong></span></div>
        <button className="primary-button full-button" type="button" onClick={() => navigate("/routes/anpu-nanjing/live")}>返回路线</button>
      </section>
    </main>
  );
}
