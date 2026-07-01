export default function KPICard({ label, value, delta, type = 'normal', deltaDir }) {
  const kpiClass = type === 'alert' ? 'alert' : type === 'alert-amb' ? 'alert-amb' : '';

  return (
    <div className={`kpi ${kpiClass}`}>
      <div className="label">
        {type === 'alert' && <i className="status-dot" />}
        {label}
      </div>
      <div className="value">{value}</div>
      {delta && <div className={`delta ${deltaDir ?? ''}`}>{delta}</div>}
    </div>
  );
}
