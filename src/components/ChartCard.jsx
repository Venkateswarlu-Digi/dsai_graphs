import InfoTooltip from "./InfoTooltip";

export default function ChartCard({
  title,
  tooltip,
  tag,
  children,
}) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <span>{title}</span>

          {tooltip && (
            <InfoTooltip text={tooltip} />
          )}
        </div>

        <span className="tag">{tag}</span>
      </div>

      <div className="chart-wrap">
        {children}
      </div>
    </div>
  );
}