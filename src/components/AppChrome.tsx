import {
  ArrowLeft,
  BookmarkSimple,
  House,
  MapTrifold,
  ShareNetwork,
  Sparkle,
  User,
  Users,
} from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { useRouteSession } from "../state/RouteSessionContext";

export function IconButton({ label, children, onClick, pressed }: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <button className="icon-button" type="button" aria-label={label} aria-pressed={pressed} onClick={onClick}>
      {children}
    </button>
  );
}

export function TopBar({ backTo = "/", showActions = true }: { backTo?: string; showActions?: boolean }) {
  const navigate = useNavigate();
  const { isSaved, toggleSaved, showToast } = useRouteSession();
  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${document.title} ${window.location.href}`);
      showToast("分享链接已复制");
    } catch {
      showToast("暂时无法复制分享链接");
    }
  };
  return (
    <header className="top-bar">
      <IconButton label="返回" onClick={() => navigate(backTo)}><ArrowLeft size={22} weight="bold" /></IconButton>
      {showActions && (
        <div className="top-actions">
          <IconButton label={isSaved ? "取消收藏" : "收藏"} pressed={isSaved} onClick={toggleSaved}>
            <BookmarkSimple size={22} weight={isSaved ? "fill" : "regular"} />
          </IconButton>
          <IconButton label="分享" onClick={share}><ShareNetwork size={22} /></IconButton>
        </div>
      )}
    </header>
  );
}

export function Brand() {
  return <div className="brand"><Sparkle size={19} weight="fill" /><span>星迹</span></div>;
}

export function BottomNav() {
  const navigate = useNavigate();
  const { showToast } = useRouteSession();
  const unavailable = (label: string) => showToast(`${label}将在后续版本开放`);
  return (
    <nav className="bottom-nav" aria-label="主导航">
      <button className="is-active" type="button" onClick={() => navigate("/")}><House size={22} weight="fill" /><span>首页</span></button>
      <button type="button" onClick={() => unavailable("社区")}><Users size={22} /><span>社区</span></button>
      <button type="button" onClick={() => unavailable("行程")}><MapTrifold size={22} /><span>行程</span></button>
      <button type="button" onClick={() => unavailable("我的")}><User size={22} /><span>我的</span></button>
    </nav>
  );
}

export function Toast() {
  const { toast } = useRouteSession();
  if (!toast) return null;
  return <div className="toast" role="status">{toast}</div>;
}
