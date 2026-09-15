import { Check, MapPin, X } from "@phosphor-icons/react";
import type { MapProvider } from "../state/RouteSessionContext";
import { useState } from "react";

export function DialogShell({ title, children, onClose }: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="bottom-sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet-handle" />
        <div className="sheet-heading">
          <h2>{title}</h2>
          <button className="sheet-close" type="button" aria-label="关闭" onClick={onClose}><X size={20} /></button>
        </div>
        {children}
      </section>
    </div>
  );
}

export function MapPicker({ onSelect, onClose }: {
  onSelect: (provider: MapProvider, remember: boolean) => void;
  onClose: () => void;
}) {
  const [remember, setRemember] = useState(false);
  return (
    <DialogShell title="选择地图" onClose={onClose}>
      <p className="sheet-copy">仅用于模拟离开产品后的导航流程，不会打开真实地图。</p>
      <div className="map-options">
        <button type="button" aria-label="高德地图" onClick={() => onSelect("amap", remember)}><span className="map-icon amap"><MapPin size={22} weight="fill" /></span><span><strong>高德地图</strong><small>模拟打开</small></span><Check size={18} /></button>
        <button type="button" aria-label="百度地图" onClick={() => onSelect("baidu", remember)}><span className="map-icon baidu"><MapPin size={22} weight="fill" /></span><span><strong>百度地图</strong><small>模拟打开</small></span><Check size={18} /></button>
      </div>
      <label className="remember-choice">
        <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
        <span>记住我的选择</span>
      </label>
      <button className="text-button sheet-cancel" type="button" onClick={onClose}>取消</button>
    </DialogShell>
  );
}

export function ConfirmDialog({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  return (
    <DialogShell title="重新开始这条路线？" onClose={onClose}>
      <p className="sheet-copy">当前路线进度会被清除，并从第一站重新开始。</p>
      <div className="confirm-actions">
        <button className="secondary-button" type="button" onClick={onClose}>保留进度</button>
        <button className="primary-button danger-button" type="button" onClick={onConfirm}>确认重新开始</button>
      </div>
    </DialogShell>
  );
}

export function InfoDialog({ title, copy, onClose }: { title: string; copy: string; onClose: () => void }) {
  return (
    <DialogShell title={title} onClose={onClose}>
      <p className="sheet-copy">{copy}</p>
      <button className="primary-button full-button" type="button" onClick={onClose}>知道了</button>
    </DialogShell>
  );
}
