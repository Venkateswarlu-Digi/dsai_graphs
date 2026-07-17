import '../styles/dashboard.css';
import { useState } from 'react';
import anomalyJson from '../data/Anomaly_Detector.json';
import useDashboardData from '../hooks/useDashboardData';
import NetworkStatus from '../components/NetworkStatus';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import SectionTitle from '../components/SectionTitle';
import DynamicChart from '../assets/charts/DynamicChart';
import { CHART_COLORS } from '../assets/charts/chartSetup';

const branches = new Proxy({}, { get: (_, branchId) => branchId });

const dateLabel = value => new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export default function AnomalyDetectorPage({ onNavigate }) {
  const [days, setDays] = useState(30);
  const { data, loading, error, reload } = useDashboardData('anomaly', anomalyJson.result, days);
  const { metadata, summary, graph_data: graphs, forecast_table: table } = data;
  const anomalies = Object.values(table)
    .flat()
    .sort((first, second) => Math.abs(second.z_score) - Math.abs(first.z_score));

  const kpis = [
    { label: 'Anomalies Today', value: summary.anomalies_detected_today, delta: `avg critical z-score: ${summary.avg_z_score_critical}`, type: 'alert', deltaDir: 'down' },
    { label: 'Critical Anomalies', value: summary.critical_anomalies, delta: `z > 4.0 · immediate review`, type: 'alert', deltaDir: 'down' },
    { label: 'PRs Blocked', value: summary.auto_pr_blocked_due_to_anomaly, delta: 'auto-PR held pending review', type: 'alert-amb', deltaDir: 'warn' },
    { label: 'Reviewed OK Today', value: summary.anomalies_reviewed_ok_today, delta: `${summary.anomalies_escalated} escalated · ${summary.anomalies_pending_review} pending`, deltaDir: 'up' },
  ];

  return (
    <div className="shell anomaly-shell">
      <Sidebar active="anomaly" onNavigate={onNavigate} />
      <main className="main anomaly-page">
        <Header
          title="Anomaly Detector — Sub-model 4.4"
          days={days}
          onDaysChange={setDays}
          // subtitle="Z-Score + Isolation Forest · |z| > 2.5 = anomaly"
        />

        <div className="anomaly-content">
          <NetworkStatus loading={loading} error={error} onRetry={reload} />
          {/* <div className="anomaly-intro">
            <div>
              <h2>Consumption Anomaly Detector — Sub-model 4.4</h2>
              <p>Z-Score (|z| &gt; 2.5 = anomaly, |z| &gt; 4 critical) with Isolation Forest secondary confirmation. Anomalies block auto-PRs until human review.</p>
            </div>
            <span className="method-badge ml"><i /> Z-Score + Isolation Forest</span>
          </div> */}

          <div className="kpis anomaly-kpis">{kpis.map(kpi => <KPICard key={kpi.label} {...kpi} />)}</div>

          <div className="anomaly-chart-grid">
            <ChartCard
              title="Anomaly Timeline — 7 Days"
              tag="daily · stacked"
              height="sm"
              tooltip="Stacked daily bar chart showing the count of Critical and Warning consumption anomalies detected each day over the past week."
            >
              <DynamicChart
                stacked
                labels={graphs.anomaly_timeline.map(item => dateLabel(item.detection_date))}
                datasets={[
                  {
                    label: "Critical",
                    data: graphs.anomaly_timeline.map(item => item.critical_count),
                    backgroundColor: `${CHART_COLORS.danger}D9`,
                  },
                  {
                    label: "Warning",
                    data: graphs.anomaly_timeline.map(item => item.warning_count),
                    backgroundColor: `${CHART_COLORS.warning}D9`,
                  },
                ]}
              />
            </ChartCard>

            <ChartCard
              title="Anomalies by Category"
              tag="avg z-score"
              height="sm"
              tooltip="Bar chart showing the average anomaly z-score per part category, indicating which categories are showing the most abnormal consumption patterns."
            >
              <DynamicChart
                labels={graphs.anomaly_by_category_bar.map(item => item.category)}
                datasets={[
                  {
                    label: "Average Z-Score",
                    data: graphs.anomaly_by_category_bar.map(item => item.avg_z_score),
                    backgroundColor: graphs.anomaly_by_category_bar.map(item =>
                      item.avg_z_score > 4
                        ? `${CHART_COLORS.danger}D9`
                        : `${CHART_COLORS.accent}CC`
                    ),
                  },
                ]}
              />
            </ChartCard>
          </div>

          <div className="panel anomaly-action-panel">
            <SectionTitle
              tag={`${summary.anomalies_escalated} escalated · ${summary.anomalies_pending_review} pending`}
              tooltip="Critical anomalies need immediate review because they can block automated purchase requisitions."
            >Critical Anomalies — Requires Immediate Action</SectionTitle>
            {anomalies.filter(item => item.severity === 'CRITICAL').map(item => (
              <div className="anomaly-action-row" key={item.anomaly_id}>
                <span className="anomaly-pulse" />
                <div className="anomaly-action-copy">
                  <strong>{item.anomaly_id} · {item.part_number} — {item.part_description} [{branches[item.branch_id]}]</strong>
                  <span>Direction: {item.anomaly_direction ?? item.direction} · Consumed 7d: {item.recent_qty_consumed_7d ?? item.recent_qty_7d} · Expected avg: {item.expected_qty_rolling_avg ?? item.rolling_avg_30d} · Z-Score: <b>{item.z_score}</b></span>
                  <p>⚠ {item.possible_cause_hint}</p>
                </div>
                <div className="anomaly-statuses">
                  <span className="table-badge critical">{item.severity}</span>
                  <span className={`table-badge ${item.review_status.toLowerCase()}`}>{item.review_status}</span>
                  {item.auto_pr_blocked && <span className="table-badge blocked-anomaly">PR BLOCKED</span>}
                </div>
                <div className="anomaly-actions">
                  {item.auto_pr_blocked && <button className="table-action">✓ Approve PR</button>}
                  <button className="table-action muted">Mark Reviewed</button>
                  <button className="table-action danger">Escalate</button>
                </div>
              </div>
            ))}
          </div>

          <div className="panel anomaly-table-panel">
            <SectionTitle tag="primary_table" tooltip="Detailed anomaly records including consumption deviation, severity, review status, and available actions.">All Anomalies — Detailed View</SectionTitle>
            <div className="data-table-wrap">
              <table className="data-table anomaly-table">
                <thead>
                  <tr><th>#</th><th>Anomaly ID</th><th>Part</th><th>Branch</th><th>Category</th><th>Consumed 7d</th><th>Expected (30d avg)</th><th>Z Score</th><th>Direction</th><th>Severity</th><th>PR Blocked</th><th>Review Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {anomalies.map((item, index) => (
                    <tr key={item.anomaly_id}>
                      <td>{index + 1}</td>
                      <td className="anomaly-id">{item.anomaly_id}</td>
                      <td><strong>{item.part_number}</strong><small>{item.part_description}</small></td>
                      <td>{item.branch_name.replace(' Branch', '')}</td>
                      <td><span className="category-chip">{item.part_category}</span></td>
                      <td className={item.direction === 'DROP' || item.anomaly_direction === 'DROP' ? 'good-text' : 'danger-text'}>{item.recent_qty_consumed_7d ?? item.recent_qty_7d}</td>
                      <td>{item.expected_qty_rolling_avg ?? item.rolling_avg_30d}</td>
                      <td><span className={`z-chip ${Math.abs(item.z_score) > 4 ? 'critical' : 'warning'}`}>{item.z_score}</span></td>
                      <td><span className={`table-badge ${(item.anomaly_direction ?? item.direction).toLowerCase()}`}>{item.anomaly_direction ?? item.direction}</span></td>
                      <td><span className={`table-badge ${item.severity.toLowerCase()}`}>{item.severity}</span></td>
                      <td><span className={`table-badge ${item.auto_pr_blocked ? 'blocked-anomaly' : 'created'}`}>{item.auto_pr_blocked ? 'BLOCKED' : 'No'}</span></td>
                      <td><span className={`table-badge ${item.review_status.toLowerCase()}`}>{item.review_status}</span></td>
                      <td>{item.auto_pr_blocked && <button className="table-action">✓ Approve PR</button>} <button className="table-action muted">Review</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="foot-note">
            <span>model_name: {metadata.model_name} · model_version: {metadata.model_version}</span>
            <span>method: z_score + isolation_anomaly · |z|&gt;4=critical · secondary: isolation_forest</span>
          </div>
        </div>
      </main>
    </div>
  );
}
