import { Bus, CaretDown, CaretUp, PersonSimpleWalk } from "@phosphor-icons/react";
import type { RouteStop } from "../data/route";

function StopMarker({ order, state = "upcoming" }: { order: number; state?: "upcoming" | "current" | "arrived" }) {
  return <span className={`stop-marker is-${state}`} aria-label={`第 ${order} 站`}>{state === "arrived" ? "✓" : order}</span>;
}

export function LegLabel({ stop }: { stop: RouteStop }) {
  if (!stop.toNext) return null;
  const Icon = stop.toNext.mode === "walk" ? PersonSimpleWalk : Bus;
  const mode = stop.toNext.mode === "walk" ? "步行" : "公交";
  return (
    <div className="leg-label">
      <span className="leg-icon"><Icon size={20} weight="bold" /></span>
      <span>{mode}约 {stop.toNext.minutes} 分钟 · {stop.toNext.meters} 米</span>
      <small>原型估算</small>
    </div>
  );
}

export function RouteTimeline({ stops, expanded, onToggle }: {
  stops: RouteStop[];
  expanded: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="route-timeline">
      {stops.map((stop) => {
        const open = expanded.has(stop.id);
        return (
          <div className="timeline-stop" key={stop.id}>
            <div className="track-column"><StopMarker order={stop.order} /></div>
            <article className={`place-card ${open ? "is-open" : ""}`}>
              <button className="place-card-toggle" type="button" aria-label={`${open ? "收起" : "展开"} ${stop.name}`} aria-expanded={open} onClick={() => onToggle(stop.id)}>
                <span className="place-title"><strong>{stop.name}</strong>{open && <small>{stop.summary}</small>}</span>
                <span className="expand-icon">{open ? <CaretUp size={20} weight="bold" /> : <CaretDown size={20} weight="bold" />}</span>
              </button>
              {open && (
                <div className="place-card-body">
                  <img src="/assets/nanjing-abstract-city.png" alt="抽象南京城市意象，原型配图" />
                  <p>{stop.detail}</p>
                  <span className="verification-note">地点资料待核验</span>
                </div>
              )}
            </article>
            {stop.toNext && <div className="track-column track-segment" aria-hidden="true"><i /><i /><i /></div>}
            {stop.toNext && <LegLabel stop={stop} />}
          </div>
        );
      })}
    </div>
  );
}

export function ProgressTrack({ stops, arrivedIds, currentIndex }: {
  stops: RouteStop[];
  arrivedIds: string[];
  currentIndex: number;
}) {
  return (
    <div className="progress-track" aria-label="路线进度">
      {stops.map((stop, index) => (
        <div className="progress-node" key={stop.id}>
          <StopMarker order={stop.order} state={arrivedIds.includes(stop.id) ? "arrived" : index === currentIndex ? "current" : "upcoming"} />
          {index < stops.length - 1 && <span className={arrivedIds.includes(stop.id) ? "is-complete" : ""} />}
        </div>
      ))}
    </div>
  );
}
