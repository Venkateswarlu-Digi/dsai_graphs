import React from 'react';

const LEGEND = [
  ['CRITICAL >70%', 'rgba(239,90,90,.2)', '#ef5a5a'],
  ['HIGH 50–70%', 'rgba(245,180,0,.18)', '#f5b400'],
  ['MEDIUM 30–50%', 'rgba(167,139,250,.15)', '#a78bfa'],
  ['LOW <30%', 'rgba(52,214,184,.12)', '#34d6b8'],
];

function cellStyle(risk) {
  const bg =
    risk >= 70 ? 'rgba(239,90,90,.2)' : risk >= 50 ? 'rgba(245,180,0,.18)' : risk >= 30 ? 'rgba(167,139,250,.15)' : 'rgba(52,214,184,.12)';
  const tc = risk >= 70 ? '#ef5a5a' : risk >= 50 ? '#f5b400' : risk >= 30 ? '#a78bfa' : '#34d6b8';
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
