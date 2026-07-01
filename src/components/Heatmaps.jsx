const LEGEND = [
  ['CRITICAL >70%', 'rgba(239,68,68,.13)', '#EF4444'],
  ['HIGH 50–70%', 'rgba(245,158,11,.14)', '#B77900'],
  ['MEDIUM 30–50%', 'rgba(139,92,246,.12)', '#8B5CF6'],
  ['LOW <30%', 'rgba(18,190,131,.11)', '#087F59'],
];

function cellStyle(risk) {
  const bg =
    risk >= 70 ? 'rgba(239,68,68,.13)' : risk >= 50 ? 'rgba(245,158,11,.14)' : risk >= 30 ? 'rgba(139,92,246,.12)' : 'rgba(18,190,131,.11)';
  const tc = risk >= 70 ? '#EF4444' : risk >= 50 ? '#B77900' : risk >= 30 ? '#8B5CF6' : '#087F59';
  return { bg, tc };
}

export default function Heatmaps({ data = [] }) {
  const branches = [...new Set(data.map(d => d.branch))];
  const cats = [...new Set(data.map(d => d.cat))];

  return (
    <div>
      <div className="heatmap-wrap">
        <table className="heatmap-table">
          <thead>
            <tr>
              <th>Branch \ Category</th>
              {cats.map(c => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {branches.map(br => (
              <tr key={br}>
                <td className="branch-cell">{br}</td>
                {cats.map(cat => {
                  const cell = data.find(d => d.branch === br && d.cat === cat);
                  if (!cell) return <td key={cat} className="heatmap-empty">—</td>;
                  const { bg, tc } = cellStyle(cell.risk);
                  return (
                    <td key={cat} className="heatmap-cell" style={{ background: bg }}>
                      <div className="risk-val" style={{ color: tc }}>{cell.risk}%</div>
                      <div className="risk-parts" style={{ color: tc }}>{cell.parts} parts</div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="heatmap-legend">
        {LEGEND.map(([label, bg, tc]) => (
          <span key={label} style={{ background: bg, color: tc }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
