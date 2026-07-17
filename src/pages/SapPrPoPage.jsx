import '../styles/dashboard.css';
import { useState } from 'react';
import sapJson from '../data/SAP_PR.json';
import useDashboardData from '../hooks/useDashboardData';
import NetworkStatus from '../components/NetworkStatus';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import SectionTitle from '../components/SectionTitle';
import DynamicChart from '../assets/charts/DynamicChart';
import SapActivityChart from '../assets/charts/SapActivityChart';
import { CHART_COLORS } from '../assets/charts/chartSetup';

const branchNames = new Proxy({}, { get: (_, branchId) => branchId });
const dateLabel = value => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-CA') : '—';
const money = value => `₹${(value / 100000).toFixed(2)}L`;

export default function SapPrPoPage({ onNavigate }) {
  const [days, setDays] = useState(30);
  const { data, loading, error, reload } = useDashboardData('sap', sapJson.result, days);
  const { metadata, summary, graph_data: graphs, forecast_table: table } = data;
  const actionRows = Object.values(table).flat();
  const categories = Object.keys(graphs.consumption_analytics_category_trend[0] ?? {})
    .filter(key => key !== 'period_date');

const kpis = [
  {
    label: 'Auto-PRs Raised',
    value: summary.sap_prs_auto_raised_today,
    delta: `PO value today: ${money(summary.total_po_value_today_inr)}`,
    deltaDir: 'up',
    tooltip:
      'Purchase Requisitions automatically created in SAP today, with no human involvement.',
  },
  {
    label: 'Pending Human Approval',
    value: summary.sap_prs_pending_human_approval,
    delta: `${summary.sap_prs_blocked_anomaly} blocked · anomaly review`,
    type: 'alert-amb',
    deltaDir: 'warn',
    tooltip:
      'PRs that need a person to sign off before proceeding — typically because they are linked to a flagged anomaly.',
  },
  {
    label: 'Jobs Advanced',
    value: summary.jobs_advanced_to_next_stage,
    delta: 'parts readiness triggers sent',
    deltaDir: 'up',
    tooltip:
      'Work orders that moved to their next stage today because all required parts became available.',
  },
  {
    label: 'Live Availability Queries',
    value: summary.real_time_availability_queries_today.toLocaleString('en-IN'),
    delta: `${summary.eta_predictions_served} ETA predictions served`,
    tooltip:
      'Number of real-time stock-check requests served today (e.g. technicians or planners checking part availability).',
  },
];

  return (
    <div className="shell sap-shell">
      <Sidebar active="sap" onNavigate={onNavigate} />
      <main className="main sap-page">
        <Header
          title="SAP PR/PO Automation — Sub-model 4.5"
          days={days}
          onDaysChange={setDays}
          subtitle="This is the module that actually writes into SAP and reads live data back from it — it's the operational bridge between everything the other 4 modules calculate and what actually happens in the procurement system. BAPI_PR_CREATE is the specific SAP function used to automatically create Purchase Requisitions. SAP MM stands for SAP Materials Management — SAP's core module for inventory, procurement, and warehouse operations"
        />

        <div className="sap-content">
          <NetworkStatus loading={loading} error={error} onRetry={reload} />
          {/* <div className="sap-intro">
            <div>
              <h2>SAP PR/PO & Parts Intelligence — Sub-model 4.5</h2>
              <p>BAPI_PR_CREATE + SAP MM real-time inventory API. Auto-raises PRs for critical/high-risk parts. ETA accuracy {summary.avg_eta_accuracy_pct}%. API uptime {summary.sap_api_uptime_pct}%.</p>
            </div>
            <span className="method-badge rule">● BAPI_PR_CREATE · SAP MM API</span>
          </div> */}

          <div className="kpis sap-kpis">{kpis.map(kpi => <KPICard key={kpi.label} {...kpi} />)}</div>

          <div className="sap-top-charts">
            <ChartCard
              title="PR/PO Activity"
              tag="daily volume"
              height="sm"
              tooltip="A combo chart showing daily counts of Auto PRs raised (bar), POs Raised (bar), and Job Triggers sent (line) over the past week — gives a sense of the daily operational volume flowing through this automation."
            >
              <SapActivityChart data={graphs.pr_po_activity_timeline} />
            </ChartCard>
            <ChartCard
              title="Consumption Trend by Category"
              tag="weekly units"
              height="sm"
              tooltip="A multi-line chart tracking weekly consumption units for every part category simultaneously, useful for spotting which categories' demand is shifting week over week."
            >
              <DynamicChart
                type="line"
                labels={graphs.consumption_analytics_category_trend.map(item =>
                  dateLabel(item.period_date)
                )}
                datasets={categories.map(category => ({
                  label: category,
                  data: graphs.consumption_analytics_category_trend.map(
                    item => item[category]
                  ),
                }))}
              />
            </ChartCard>
          </div>

          <div className="panel inventory-panel">
            <SectionTitle tag="live · updated 4h ago" tooltip="A bar chart comparing each vendor's ETA Accuracy % (how close the predicted delivery date was to the actual delivery date) against their On-Time %, to judge how trustworthy each vendor's delivery estimates are.">Real-Time Inventory Status from SAP MM</SectionTitle>
            <div className="data-table-wrap">
              <table className="data-table inventory-table">
                <thead><tr><th>Part Number</th><th>Branch</th><th>Stock on Hand</th><th>Reserved</th><th>Effective Available</th><th>Open PO Qty</th><th>Next Delivery ETA</th><th>Status</th></tr></thead>
                <tbody>
                  {graphs.real_time_inventory_availability.map(item => (
                    <tr key={`${item.part_number}-${item.branch_id}`}>
                      <td>{item.part_number}</td><td>{branchNames[item.branch_id]}</td><td>{item.stock_on_hand}</td>
                      <td className="warn-text">{item.reserved_qty}</td>
                      <td className={item.effective_available < 5 ? 'danger-text' : 'good-text'}>{item.effective_available}</td>
                      <td>{item.open_po_qty || '—'}</td><td>{dateLabel(item.eta_next_delivery)}</td>
                      <td><span className={`table-badge ${item.availability_status.toLowerCase()}`}>{item.availability_status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel readiness-panel">
            <SectionTitle tag={`${graphs.parts_readiness_status_by_job.length} active jobs`} tooltip="Whether every required part is available for each active job and the next operational stage.">Parts Readiness — Job Status</SectionTitle>
            <div className="readiness-grid">
              {graphs.parts_readiness_status_by_job.map(job => (
                <div className={`readiness-card ${job.readiness_status.toLowerCase()}`} key={job.job_id}>
                  <span className={`table-badge ${job.readiness_status.toLowerCase()}`}>{job.readiness_status}</span>
                  <strong>{job.job_id}</strong><small>{job.wo_id}</small>
                  <div className="parts-counts">
                    <span><b>{job.parts_available}</b>Available</span>
                    <span><b>{job.parts_on_order}</b>On Order</span>
                    <span><b>{job.parts_missing}</b>Missing</span>
                  </div>
                  <p>Next: {job.next_stage}</p>
                  {job.trigger_sent && <em>✓ Trigger Sent</em>}
                  {job.blocking_part && <em className="blocked-note">Blocked on: {job.blocking_part}</em>}
                </div>
              ))}
            </div>
          </div>

          <div className="sap-bottom-charts">
            <ChartCard
              title="Vendor ETA Prediction Accuracy"
              tag="predicted vs actual"
              height="sm"
              tooltip="Bar chart comparing each vendor's predicted delivery ETA accuracy against their actual on-time delivery percentage, used to evaluate vendor forecasting reliability."
            >
              <DynamicChart
                labels={graphs.eta_prediction_accuracy.map(item => item.vendor_name)}
                datasets={[
                  {
                    label: "ETA Accuracy %",
                    data: graphs.eta_prediction_accuracy.map(item => item.accuracy_pct),
                    backgroundColor: `${CHART_COLORS.primary}D9`,
                  },
                  {
                    label: "On-Time %",
                    data: graphs.eta_prediction_accuracy.map(item => item.on_time_pct),
                    backgroundColor: `${CHART_COLORS.secondary}B8`,
                  },
                ]}
              />
            </ChartCard>

            <ChartCard
              title="Shortage Alerts by Severity"
              tag="notified"
              height="sm"
              tooltip="A grouped bar chart showing Total Alerts vs. SLA-impacting Jobs, broken down by severity tier — highlights where shortages are creating the most contractual/customer exposure, not just the most raw alert volume."
            >
              <DynamicChart
                labels={graphs.shortage_alerts_by_severity.map(item => item.severity)}
                datasets={[
                  {
                    label: "Total Alerts",
                    data: graphs.shortage_alerts_by_severity.map(item => item.count),
                    backgroundColor: [
                      `${CHART_COLORS.danger}D9`,
                      `${CHART_COLORS.warning}D9`,
                      `${CHART_COLORS.accent}CC`,
                      `${CHART_COLORS.primary}D9`,
                    ],
                  },
                  {
                    label: "SLA Jobs",
                    data: graphs.shortage_alerts_by_severity.map(
                      item => item.sla_jobs_impacted
                    ),
                    backgroundColor: `${CHART_COLORS.danger}70`,
                  },
                ]}
              />
            </ChartCard>
          </div>

          <div className="panel sap-action-panel">
            <SectionTitle tag={`${summary.sap_prs_auto_raised_today} created · ${summary.sap_prs_blocked_anomaly} blocked`} tooltip="One card is shown per active work order, letting the workshop team see at a glance whether every part they need is actually available">SAP PR/PO Action Log</SectionTitle>
            <div className="data-table-wrap">
              <table className="data-table sap-action-table">
                <thead><tr><th>PR ID</th><th>Part</th><th>Branch</th><th>Vendor</th><th>Qty</th><th>Value</th><th>Order Date</th><th>Stockout Risk</th><th>SAP Status</th><th>ETA if Today</th><th>Actions</th></tr></thead>
                <tbody>
                  {actionRows.map(row => (
                    <tr key={row.pr_id}>
                      <td>{row.pr_id}</td>
                      <td><strong>{row.part_number}</strong><small>{row.part_description}</small></td>
                      <td>{row.branch_name.replace(' Branch', '')}</td><td>{row.vendor_name}</td><td>{row.rec_order_qty}</td>
                      <td className="good-text">{money(row.pr_value_inr)}</td><td className="warn-text">{dateLabel(row.rec_order_date)}</td>
                      <td><span className={`risk-orb ${row.stockout_risk_pct >= 70 ? 'critical' : 'high'}`}>{row.stockout_risk_pct}%</span></td>
                      <td><span className={`table-badge ${row.sap_pr_status.toLowerCase()}`}>{row.sap_pr_status.replace('_', ' ')}</span></td>
                      <td>{dateLabel(row.eta_if_ordered_today)}</td>
                      <td>{row.sap_pr_status === 'CREATED' ? <><button className="table-action">⚡ Expedite</button> <button className="table-action muted">View SAP</button></> : <><button className="table-action">✓ Approve</button> <button className="table-action danger">Reject</button></>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="foot-note">
            <span>model_name: {metadata.model_name} · model_version: {metadata.model_version}</span>
            <span>BAPI_PR_CREATE · SAP_PO_inventory_api · SLA_accuracy: {summary.avg_eta_accuracy_pct}%</span>
          </div>
        </div>
      </main>
    </div>
  );
}
