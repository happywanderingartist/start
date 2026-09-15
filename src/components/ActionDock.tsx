export function ActionDock({ secondaryLabel, primaryLabel, onSecondary, onPrimary }: {
  secondaryLabel: string;
  primaryLabel: string;
  onSecondary: () => void;
  onPrimary: () => void;
}) {
  return (
    <div className="action-dock">
      <button className="secondary-button" type="button" onClick={onSecondary}>{secondaryLabel}</button>
      <button className="primary-button" type="button" onClick={onPrimary}>{primaryLabel}</button>
    </div>
  );
}
