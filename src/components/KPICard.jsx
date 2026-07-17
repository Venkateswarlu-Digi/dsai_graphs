import InfoTooltip from './InfoTooltip';

export default function KPICard({ label, value, delta, tooltip, type = 'normal', deltaDir }) {
  const kpiClass = type === 'alert' ? 'alert' : type === 'alert-amb' ? 'alert-amb' : '';

  return (
    <div className={`kpi ${kpiClass}`}>
      <div className="label">
        {type === 'alert' && <i className="status-dot" />}
        {label}
        <InfoTooltip text={tooltip ?? `This KPI summarizes ${String(label).toLowerCase()} for the current dashboard data.`} />
      </div>
      <div className="value">{value}</div>
      {delta && <div className={`delta ${deltaDir ?? ''}`}>{delta}</div>}
    </div>
  );
}
