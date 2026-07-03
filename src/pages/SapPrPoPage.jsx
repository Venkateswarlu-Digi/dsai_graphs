import '../styles/dashboard.css';
import sapJson from '../data/SAP_PR.json';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import DynamicChart from '../assets/charts/DynamicChart';
import SapActivityChart from '../assets/charts/SapActivityChart';
import { CHART_COLORS } from '../assets/charts/chartSetup';

const branchNames = {
  'BR-NGR-03': 'Nagpur',
  'BR-CHN-02': 'Chennai'
};
const categories = ['Engine', 'Undercarriage', 'Hydraulics', 'Filters', 'Transmission'];
const dateLabel = value => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-CA') : '—';
const money = value => `₹${(value / 100000).toFixed(2)}L`;

export default function SapPrPoPage({ onNavigate }) {
  const { metadata, summary, graph_data: graphs, forecast_table: table } = sapJson.result;
  const actionRows = Object.values(table).flat();

  const kpis = [
    { label: 'Auto-PRs Raised', value: summary.sap_prs_auto_raised_today, delta: `PO value today: ${money(summary.total_po_value_today_inr)}`, deltaDir: 'up' },
    { label: 'Pending Human Approval', value: summary.sap_prs_pending_human_approval, delta: `${summary.sap_prs_blocked_anomaly} blocked · anomaly review`, type: 'alert-amb', deltaDir: 'warn' },
    { label: 'Jobs Advanced', value: summary.jobs_advanced_to_next_stage, delta: 'parts readiness triggers sent', deltaDir: 'up' },
    { label: 'Live Availability Queries', value: summary.real_time_availability_queries_today.toLocaleString('en-IN'), delta: `${summary.eta_predictions_served} ETA predictions served` },
  ];

  return (
    <div className="shell sap-shell">
      <Sidebar active="sap" onNavigate={onNavigate} />
      <main className="main sap-page">
        <Header
          title="SAP PR/PO Automation — Sub-model 4.5"
          subtitle="BAPI_PR_CREATE · SAP MM real-time inventory API"
        />

        <div className="sap-content">
          <div className="sap-intro">
            <div>
              <h2>SAP PR/PO & Parts Intelligence — Sub-model 4.5</h2>
              <p>BAPI_PR_CREATE + SAP MM real-time inventory API. Auto-raises PRs for critical/high-risk parts. ETA accuracy {summary.avg_eta_accuracy_pct}%. API uptime {summary.sap_api_uptime_pct}%.</p>
            </div>
            <span className="method-badge rule">● BAPI_PR_CREATE · SAP MM API</span>
          </div>

          <div className="kpis sap-kpis">{kpis.map(kpi => <KPICard key={kpi.label} {...kpi} />)}</div>

          <div className="sap-top-charts">
            <ChartCard
              title="PR/PO Activity — 7 Days"
              tag="daily volume"
              height="sm"
              tooltip="Shows the daily volume of Purchase Requisitions (PRs) and Purchase Orders (POs) processed over the past seven days. This helps monitor procurement activity, automation throughput, and order processing trends."
            >
              <SapActivityChart data={graphs.pr_po_activity_timeline} />
            </ChartCard>
            <ChartCard
              title="Consumption Trend by Category"
              tag="weekly units"
              height="sm"
              tooltip="Displays weekly parts consumption trends across major inventory categories. Tracking these trends helps identify demand patterns, seasonal changes, and categories requiring replenishment planning."
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
            <h3>Real-Time Inventory Status from SAP MM <span className="tag">live · updated 4h ago</span></h3>
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
            <h3>Parts Readiness — Job Status <span className="tag">{graphs.parts_readiness_status_by_job.length} active jobs</span></h3>
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
              tooltip="Compares predicted delivery accuracy with actual on-time delivery performance for each vendor. This helps evaluate supplier reliability and improve procurement planning."
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
              tooltip="Shows the number of inventory shortage alerts grouped by severity level, along with the number of affected SLA-critical jobs. This enables teams to prioritize high-impact shortages and reduce service disruptions."
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
            <h3>SAP PR/PO Action Log <span className="tag">{summary.sap_prs_auto_raised_today} created · {summary.sap_prs_blocked_anomaly} blocked</span></h3>
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
