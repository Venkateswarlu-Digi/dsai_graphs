import '../styles/dashboard.css';
import { useState } from 'react';
import stockoutJson from '../data/Stockout_Risk_Scoring.json';
import useDashboardData from '../hooks/useDashboardData';
import NetworkStatus from '../components/NetworkStatus';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import SectionTitle from '../components/SectionTitle';
import DynamicChart from '../assets/charts/DynamicChart';
import RiskTrend from '../assets/charts/RiskTrend';
import RiskScatter from '../assets/charts/RiskScatter';
import { CHART_COLORS } from '../assets/charts/chartSetup';

const branchNames = new Proxy({}, { get: (_, branchId) => branchId });

function flatten(table) {
  return Object.values(table).flat();
}

function severityClass(value) {
  return String(value).toLowerCase();
}

function rowKey(row) {
  return `${row.part_number}-${row.branch_id}`;
}

function autoPrRaised(row) {
  return row.auto_pr_raised ?? row.auto_pr_triggered ?? false;
}

export default function StockoutRiskPage({ onNavigate }) {
  const [days, setDays] = useState(30);
  const { data, loading, error, reload } = useDashboardData('stockout', stockoutJson.result, days);
  const { metadata, summary, graph_data: graphs, forecast_table: table } = data;
  const forecastRows = flatten(table).sort((first, second) => second.stockout_risk_pct - first.stockout_risk_pct);
  const detailsByPartAndBranch = Object.fromEntries(forecastRows.map(row => [rowKey(row), row]));
  const alerts = graphs.auto_pr_trigger_log_today.map(alert => ({
    ...detailsByPartAndBranch[rowKey(alert)],
    ...alert, // The trigger log is the source of truth for PR state and alert timing.
  }));
  const riskTrend = graphs.risk_trend_over_time.map(item => ({
    d: new Date(`${item.period_date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    cr: item.critical_count,
    hi: item.high_count,
    md: item.medium_count,
  }));

  const kpis = [
    { label: 'Critical Parts (≥70%)', value: summary.critical_stockout_parts, delta: `${summary.branches_with_critical_alerts} branches · Hyd + Undercarriage`, type: 'alert', deltaDir: 'down' },
    { label: 'High Risk (50–70%)', value: summary.high_stockout_parts, delta: 'Auto-PR raised for most', type: 'alert-amb', deltaDir: 'warn' },
    { label: 'Jobs at Risk', value: summary.jobs_at_risk_if_stockouts_occur, delta: `${summary.sla_breach_risk_jobs} SLA breach · avg 17d delay`, deltaDir: 'down' },
    { label: 'Value at Stockout Risk', value: `₹${(summary.total_value_at_stockout_risk_inr / 10000000).toFixed(2)}Cr`, delta: 'if no action taken today', deltaDir: 'down' },
  ];

  return (
    <div className="shell stockout-shell">
      <Sidebar active="stockout" onNavigate={onNavigate} />
      <main className="main stockout-page">
        <Header
          title="Stockout Risk Scoring — Sub-model 4.2"
          days={days}
          onDaysChange={setDays}
          // subtitle="Upstream from 4.1 predicted_qty · Auto-PR automation"
        />

        <div className="stockout-content">
          <NetworkStatus loading={loading} error={error} onRetry={reload} />
          {/* <div className="stockout-intro">
            <div>
              <h2>Stockout Risk Scoring — Sub-model 4.2</h2>
              <p>Parts ranked by stockout probability. Upstream from 4.1 predicted_qty. Auto-PRs triggered for critical/high risk parts. Anomaly-flagged PRs held pending review.</p>
            </div>
            <span className="risk-action-badge">● {summary.critical_stockout_parts} CRITICAL · action required</span>
          </div> */}

          <div className="kpis stockout-kpis">
            {kpis.map(kpi => <KPICard key={kpi.label} {...kpi} />)}
          </div>

          <div className="stockout-chart-grid">
            <ChartCard
              title="Risk Trend — 6 Weeks"
              tag="stacked severity"
              height="sm"
              tooltip="Stacked bar chart of weekly Critical, High, and Medium stockout risk part counts over 6 weeks, showing whether the risk profile is trending up or down."
            >
              <RiskTrend data={riskTrend} />
            </ChartCard>
            <ChartCard
              title="Days Cover vs Lead Time"
              tag="scatter · bubble size = risk"
              height="sm"
              tooltip="Bubble scatter plot mapping each part's remaining days of stock cover against its vendor lead time, with bubble size representing risk score — parts in the danger zone (low cover, long lead time) stand out immediately."
            >
              <RiskScatter data={graphs.days_of_cover_vs_lead_time_scatter} />
            </ChartCard>
            <ChartCard
              title="Jobs at Risk by Category"
              tag="SLA impact"
              height="sm"
              tooltip="Bar chart showing jobs at stockout risk and jobs specifically at SLA breach risk, grouped by part category."
            >
              <DynamicChart
                labels={graphs.jobs_impacted_by_category.map(item => item.category)}
                datasets={[
                  {
                    label: "Jobs at Risk",
                    data: graphs.jobs_impacted_by_category.map(item => item.jobs_at_risk),
                    backgroundColor: `${CHART_COLORS.danger}D9`,
                  },
                  {
                    label: "SLA Jobs",
                    data: graphs.jobs_impacted_by_category.map(item => item.sla_jobs_at_risk),
                    backgroundColor: `${CHART_COLORS.warning}D9`,
                  },
                ]}
              />
            </ChartCard>
          </div>

          <div className="panel trigger-panel">
            <SectionTitle
              tag={`${summary.auto_pr_triggered_today} raised · ${summary.auto_pr_blocked_anomaly} blocked`}
              tooltip="Today’s automated purchase-requisition decisions, including any requests held for anomaly review."
            >Auto PR Trigger Log — Today</SectionTitle>
            <div className="trigger-list">
              {alerts.map(alert => (
                <div className="trigger-row" key={alert.alert_id}>
                  <span className={`trigger-state ${alert.auto_pr_raised ? 'raised' : 'blocked'}`}>{alert.auto_pr_raised ? 'PR RAISED' : 'BLOCKED'}</span>
                  <span className="trigger-id">{alert.alert_id}</span>
                  <span className="trigger-main">
                    <strong>{alert.part_number}</strong> — {alert.branch_name?.replace(' Branch', '') ?? branchNames[alert.branch_id]}
                    {alert.auto_pr_raised
                      ? ` · PR: ${alert.pr_number} · Qty: ${alert.rec_order_qty}`
                      : <small>{alert.auto_pr_blocked_reason}</small>}
                  </span>
                  <span className={`risk-orb ${severityClass(alert.severity)}`}>{alert.stockout_risk_pct}%</span>
                  <span className={`table-badge ${severityClass(alert.severity)}`}>{alert.severity}</span>
                  <span className="days-negative">{alert.days_until_stockout}d</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel stockout-table-panel">
            <SectionTitle tag="primary_table.rows · ranked by risk" tooltip="Critical and high-risk parts ranked by stockout probability, stock cover, and supplier lead time.">Critical & High Stockout Risk Parts</SectionTitle>
            <div className="data-table-wrap">
              <table className="data-table stockout-table">
                <thead>
                  <tr>
                    <th>#</th><th>Part</th><th>Branch</th><th>Category</th><th>Risk Score</th>
                    <th>Days to Stockout</th><th>Stock on Hand</th><th>Days Cover</th>
                    <th>Lead Time</th><th>Forecast 30d</th><th>Auto PR</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {forecastRows.map((row, index) => (
                    <tr key={row.prediction_id ?? row.alert_id}>
                      <td>{index + 1}</td>
                      <td><strong>{row.part_number}</strong><small>{row.part_description ?? 'Priority stockout alert'}</small></td>
                      <td>{row.branch_name?.replace(' Branch', '') ?? branchNames[row.branch_id]}</td>
                      <td><span className="category-chip">{row.part_category ?? 'Parts'}</span></td>
                      <td><span className={`risk-orb ${severityClass(row.severity)}`}>{row.stockout_risk_pct}%</span></td>
                      <td className="days-negative">{row.days_until_stockout}d</td>
                      <td>{row.stock_on_hand ?? '—'}</td>
                      <td className={(row.days_of_cover ?? 0) < (row.vendor_lead_time_days ?? 99) ? 'danger-text' : 'good-text'}>{row.days_of_cover != null ? `${row.days_of_cover}d` : '—'}</td>
                      <td>{row.vendor_lead_time_days != null ? `${row.vendor_lead_time_days}d` : '—'}</td>
                      <td>{row.predicted_qty_30d ?? row.rec_order_qty}</td>
                      <td><span className={`table-badge ${autoPrRaised(row) ? 'created' : 'pending'}`}>{autoPrRaised(row) ? 'PR Raised' : 'Pending'}</span></td>
                      <td><button className="table-action">⚡ Expedite</button> <button className="table-action muted">Review</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="foot-note">
            <span>model_name: {metadata.model_name} · model_version: {metadata.model_version}</span>
            <span>dependency: part_demand_forecast · confidence: {metadata.confidence_level}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
