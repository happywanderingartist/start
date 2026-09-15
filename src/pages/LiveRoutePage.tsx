import { ArrowRight, CheckCircle, Info, MapPin, NavigationArrow } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TopBar } from "../components/AppChrome";
import { ConfirmDialog, MapPicker } from "../components/Dialogs";
import { LegLabel, ProgressTrack } from "../components/RouteTimeline";
import { StarPet, type StarPetState } from "../components/StarPet";
import { route } from "../data/route";
import { useRouteSession, type MapProvider } from "../state/RouteSessionContext";

export function LiveRoutePage() {
  const navigate = useNavigate();
  const { progress, activeMap, chooseMap, arriveCurrentStop, restartRoute } = useRouteSession();
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [showRestart, setShowRestart] = useState(false);
  const [petState, setPetState] = useState<StarPetState>("moving");
  const [isArriving, setIsArriving] = useState(false);
  const arrivalTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (arrivalTimerRef.current !== null) window.clearTimeout(arrivalTimerRef.current);
  }, []);

  const cancelPendingArrival = () => {
    if (arrivalTimerRef.current !== null) window.clearTimeout(arrivalTimerRef.current);
    arrivalTimerRef.current = null;
    setIsArriving(false);
    setPetState("moving");
  };

  const confirmRestart = () => {
    cancelPendingArrival();
    restartRoute();
    setShowRestart(false);
  };

  if (progress.status === "completed") {
    return (
      <main className="screen live-screen completion-screen">
        <TopBar backTo="/routes/anpu-nanjing" showActions={false} />
        <section className="completion-card glass">
          <div className="completion-pet"><StarPet state="completed" size="compact" /></div>
          <p className="eyebrow">{route.stops.length} / {route.stops.length} 已到达</p>
          <h1>星迹已完成</h1>
          <p>这条南京老城路线已经走完。纪念小卡将在后续版本生成。</p>
          <Link className="primary-link" to="/routes/anpu-nanjing">回看路线 <ArrowRight size={18} /></Link>
          <button className="text-button" type="button" onClick={() => setShowRestart(true)}>重新开始</button>
        </section>
        {showRestart && <ConfirmDialog onClose={() => setShowRestart(false)} onConfirm={confirmRestart} />}
      </main>
    );
  }

  const current = route.stops[progress.currentStopIndex] ?? route.stops[0];
  const next = route.stops[progress.currentStopIndex + 1];
  const openNavigation = () => {
    if (!activeMap) {
      setShowMapPicker(true);
      return;
    }
    navigate("/routes/anpu-nanjing/live/navigation");
  };
  const selectMap = (provider: MapProvider, remember: boolean) => {
    chooseMap(provider, remember);
    setShowMapPicker(false);
    navigate("/routes/anpu-nanjing/live/navigation");
  };
  const markArrival = () => {
    if (isArriving) return;
    setIsArriving(true);
    setPetState("arrived");
    arrivalTimerRef.current = window.setTimeout(() => {
      arrivalTimerRef.current = null;
      arriveCurrentStop();
      setIsArriving(false);
      setPetState("moving");
    }, 620);
  };

  return (
    <main className="screen live-screen with-live-actions">
      <section className="live-hero">
        <img className="hero-art" src="/assets/nanjing-abstract-city.png" alt="" />
        <TopBar backTo="/routes/anpu-nanjing" showActions={false} />
        <div className="live-title-row">
          <div><p className="eyebrow">路线进行中</p><h1>{route.title}</h1></div>
          <button className="reset-link" type="button" onClick={() => setShowRestart(true)} disabled={isArriving}>重新开始</button>
        </div>
        <div className="progress-summary glass">
          <span>已完成</span><strong>{progress.arrivedStopIds.length} / {route.stops.length}</strong>
          <div className="progress-bar"><span style={{ width: `${progress.arrivedStopIds.length / route.stops.length * 100}%` }} /></div>
          <div className="live-pet-mini">
            <StarPet state={petState} size="compact" />
            <span className="sr-only" aria-live="polite" aria-atomic="true">{petState === "arrived" ? "到站反馈" : "正在前进"}</span>
          </div>
        </div>
      </section>

      <section className="live-content">
        <ProgressTrack stops={route.stops} arrivedIds={progress.arrivedStopIds} currentIndex={progress.currentStopIndex} />
        <article className="current-card glass">
          <div className="current-label"><span>当前目标</span><span className="prototype-pill"><Info size={14} />原型数据</span></div>
          <h2>{current.name}</h2>
          <p className="current-summary">{current.summary}</p>
          <img src="/assets/nanjing-abstract-city.png" alt="抽象南京城市意象" />
          <p className="current-detail">{current.detail}</p>
          <div className="destination-row"><MapPin size={19} weight="fill" /><span>目的地待 POI 核验</span></div>
        </article>
        {current.toNext && <LegLabel stop={current} />}
        {next && <div className="next-stop"><span>下一站</span><strong>{next.name}</strong></div>}
      </section>

      <div className="live-actions">
        <button className="secondary-button" type="button" onClick={markArrival} disabled={isArriving}><CheckCircle size={21} weight="bold" />我已到达</button>
        <button className="primary-button" type="button" onClick={openNavigation} disabled={isArriving}><NavigationArrow size={21} weight="fill" />导航下一站</button>
      </div>
      {showMapPicker && <MapPicker onClose={() => setShowMapPicker(false)} onSelect={selectMap} />}
      {showRestart && <ConfirmDialog onClose={() => setShowRestart(false)} onConfirm={confirmRestart} />}
    </main>
  );
}
