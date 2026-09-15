import { ArrowRight, MagnifyingGlass, PaperPlaneTilt, Sparkle } from "@phosphor-icons/react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { route } from "../data/route";
import { BottomNav, Brand } from "../components/AppChrome";
import { StarPet, type StarPetState } from "../components/StarPet";
import { useRouteSession } from "../state/RouteSessionContext";

const quickConditions = ["南京", "安溥", "半日", "步行"];

export function HomePage() {
  const navigate = useNavigate();
  const { showToast } = useRouteSession();
  const [request, setRequest] = useState("");
  const [loading, setLoading] = useState(false);
  const [petState, setPetState] = useState<StarPetState>("idle");
  const routeCardRef = useRef<HTMLElement>(null);
  const searchTimerRef = useRef<number | null>(null);
  const readyTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (searchTimerRef.current !== null) window.clearTimeout(searchTimerRef.current);
    if (readyTimerRef.current !== null) window.clearTimeout(readyTimerRef.current);
  }, []);

  const addCondition = (condition: string) => {
    setRequest((current) => {
      const parts = current.trim().split(/\s+/).filter(Boolean);
      return parts.includes(condition) ? current : [...parts, condition].join(" ");
    });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!request.trim()) {
      showToast("先写下想去的城市或想追寻的人");
      return;
    }
    setLoading(true);
    setPetState("searching");
    searchTimerRef.current = window.setTimeout(() => {
      setPetState("ready");
      readyTimerRef.current = window.setTimeout(() => navigate("/routes/anpu-nanjing"), 360);
    }, 760);
  };

  const findExisting = () => {
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    routeCardRef.current?.scrollIntoView?.({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });
    routeCardRef.current?.focus();
  };

  return (
    <main className="screen home-screen">
      <section className="home-intro">
        <header className="home-topbar">
          <Brand />
          <button className="route-search-button" type="button" aria-label="搜索已有路线" onClick={findExisting}>
            <MagnifyingGlass size={18} weight="bold" />
            <span>搜路线</span>
          </button>
        </header>

        <div className="pet-stage">
          <StarPet state={petState} />
        </div>

        <div className="home-prompt-copy">
          <h1>{petState === "ready" ? "找到一条适合出发的星迹" : "今天想沿着谁的星迹出发？"}</h1>
        </div>

        <form className="prompt-card glass" onSubmit={submit}>
          <label className="sr-only" htmlFor="route-request">想去哪里，想沿着谁的星迹？</label>
          <div className="prompt-row">
            <input id="route-request" value={request} onChange={(event) => setRequest(event.target.value)} placeholder="南京，安溥，半日步行" />
            <button className="send-button" type="submit" aria-label="整理路线" disabled={loading}>
              {loading ? <Sparkle className="loading-icon" size={20} weight="fill" /> : <PaperPlaneTilt size={20} weight="fill" />}
            </button>
          </div>
          <div className="quick-chips" role="group" aria-label="快捷条件">
            {quickConditions.map((condition) => {
              const isSelected = request.split(/\s+/).includes(condition);
              return (
                <button aria-pressed={isSelected} className={isSelected ? "is-selected" : ""} type="button" key={condition} onClick={() => addCondition(condition)}>{condition}</button>
              );
            })}
          </div>
          {loading && <p className="loading-copy" role="status">{petState === "ready" ? "路线已找到，即将打开…" : "正在整理星迹…"}</p>}
        </form>
      </section>

      <section className="recommend-section" aria-label="最近推荐">
        <article className="recommend-card glass" ref={routeCardRef} tabIndex={-1}>
          <div className="recommend-content">
            <div className="recommend-copy">
              <span className="route-tag">最近推荐</span>
              <h2>{route.title}</h2>
              <p>{route.stops.length} 个地点 · 约 {route.estimatedTotalMinutes / 60} 小时 · 原型待核验</p>
            </div>
            <Link to="/routes/anpu-nanjing" aria-label={`查看${route.title}`}><ArrowRight size={20} weight="bold" /></Link>
          </div>
        </article>
      </section>
      <BottomNav />
    </main>
  );
}
