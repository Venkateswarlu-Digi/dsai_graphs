import '../styles/dashboard.css';
import safetyJson from '../data/Safety_Stock_Lead_Time_Optimiser.json';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import DynamicChart from '../assets/charts/DynamicChart';

const branchNames = {
  'BR-BLR-01': 'Bangalore',
  'BR-HYD-03': 'Hyderabad',
  'BR-MUM-05': 'Mumbai',
  'BR-DEL-04': 'Delhi',
};

const inr = value => `₹${(value / 100000).toFixed(value >= 100000 ? 1 : 2)}L`;
const dateLabel = value => new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export default function SafetyStockPage({ onNavigate }) {
  const { metadata, summary, graph_data: graphs, forecast_table: table } = safetyJson.result;
  const stockRecommendations = table.SAFETY_STOCK_INCREASE;
  const vendorSwitch = table.VENDOR_SWITCH[0];
  const vendorNames = Object.fromEntries(graphs.vendor_lead_time_performance_bar.map(vendor => [vendor.vendor_id, vendor.vendor_name]));

  const kpis = [
    { label: 'Increase Recommended', value: summary.parts_with_safety_stock_increase_recommended, delta: `net investment: ${inr(summary.net_investment_change_inr)} additional`, deltaDir: 'up' },
    { label: 'Decrease Recommended', value: summary.parts_with_safety_stock_decrease_recommended, delta: 'over-stocked · free up capital', deltaDir: 'up' },
    { label: 'Vendor Switch Recs', value: summary.vendor_switch_recommendations, delta: 'Hydraulics · CatParts Direct', type: 'alert-amb', deltaDir: 'warn' },
    { label: 'Stockout Prevention Value', value: `₹${(summary.estimated_stockout_prevention_value_inr / 10000000).toFixed(2)}Cr`, delta: 'est. savings if recs accepted', deltaDir: 'up' },
  ];

  return (
    <div className="shell safety-shell">
      <Sidebar active="safety" onNavigate={onNavigate} />
      <main className="main safety-page">
        <Header
          title="Safety Stock Optimiser — Sub-model 4.3"
          subtitle={`SS = Z × √(L×σd² + d²×σL²) · Service level ${metadata.granularity}`}
        />

        <div className="safety-content">
          <div className="safety-intro">
            <div>
              <h2>Safety Stock Optimiser — Sub-model 4.3</h2>
              <p>Safety stock computed with SS = Z × √(L×σd² + d²×σL²). Service-level target 80%. Lead-time variability factored in.</p>
            </div>
            <span className="method-badge rule">● rule_based formula · sub-model</span>
          </div>

          <div className="kpis safety-kpis">{kpis.map(kpi => <KPICard key={kpi.label} {...kpi} />)}</div>

          <div className="safety-chart-grid">
            <ChartCard title="Safety Stock: Current vs Recommended" tag="avg by category" height="sm">
              <DynamicChart
                labels={graphs.safety_stock_current_vs_recommended_bar.map(item => item.category)}
                datasets={[
                  { label: 'Current', data: graphs.safety_stock_current_vs_recommended_bar.map(item => item.current_safety_stock_avg), backgroundColor: '#38bdf888' },
                  { label: 'Recommended', data: graphs.safety_stock_current_vs_recommended_bar.map(item => item.recommended_safety_stock_avg), backgroundColor: graphs.safety_stock_current_vs_recommended_bar.map(item => item.change_pct < 0 ? '#ef5a5acc' : '#34d6b8cc') },
                ]}
              />
            </ChartCard>
            <ChartCard title="Vendor Lead Time Trend" tag="4 vendors · 4 months" height="sm">
              <DynamicChart
                type="line"
                labels={graphs.lead_time_trend_by_vendor.map(item => dateLabel(item.period_date))}
                datasets={graphs.vendor_lead_time_performance_bar.map(vendor => ({
                  label: vendor.vendor_name,
                  data: graphs.lead_time_trend_by_vendor.map(item => item[`${vendor.vendor_id}_actual_days`]),
                }))}
              />
            </ChartCard>
          </div>

          <div className="panel vendor-dashboard">
            <h3>Vendor Performance Dashboard <span className="tag">lead_time · online_%</span></h3>
            <div className="vendor-card-grid">
              {graphs.vendor_lead_time_performance_bar.map(vendor => (
                <div className={`vendor-card tier-${vendor.risk_tier.toLowerCase()}`} key={vendor.vendor_id}>
                  <strong>{vendor.vendor_name}</strong>
                  <small>{vendor.vendor_id}</small>
                  <dl>
                    <dt>Quoted Lead Time</dt><dd>{vendor.quoted_lead_time}d</dd>
                    <dt>Actual Avg</dt><dd>{vendor.actual_avg_lead_time}d</dd>
                    <dt>Lead Time σ</dt><dd>{vendor.lead_time_std_dev}d</dd>
                    <dt>On-Time %</dt><dd>{vendor.on_time_pct}%</dd>
                  </dl>
                  <span className={`table-badge ${vendor.risk_tier.toLowerCase()}`}>{vendor.risk_tier} RISK</span>
                  {vendor.switch_recommended && <span className="switch-note">⚠ Switch Recommended</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="panel order-schedule">
            <h3>Recommended Order Schedule <span className="tag">{graphs.recommended_order_schedule.length} reminders · date today</span></h3>
            {graphs.recommended_order_schedule.map(order => (
              <div className="schedule-row" key={`${order.part_number}-${order.branch_id}`}>
                <span><strong>{order.part_number}</strong><small>{branchNames[order.branch_id]} · {vendorNames[order.vendor_id]}</small></span>
                <span className="schedule-date">Qty {order.rec_order_qty} · Rec. date {dateLabel(order.rec_order_date)}</span>
                <span className={`schedule-track ${order.status.toLowerCase()}`}><i /></span>
                <span className={`table-badge ${order.status.toLowerCase()}`}>{order.status.replace('_', ' ')}</span>
                <em>{order.days_overdue > 0 ? `${order.days_overdue} days overdue` : order.days_overdue === 0 ? 'due today' : `in ${Math.abs(order.days_overdue)} days`}</em>
              </div>
            ))}
          </div>

          <div className="panel safety-recommendations">
            <h3>Safety Stock Change Recommendations <span className="tag">primary_table</span></h3>
            <div className="data-table-wrap">
              <table className="data-table safety-table">
                <thead>
                  <tr><th>#</th><th>Part</th><th>Branch</th><th>Current SS</th><th>Recommended SS</th><th>Change</th><th>Est. Investment</th><th>Risk Reduction</th><th>Reason</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {stockRecommendations.map((row, index) => (
                    <tr key={row.recommendation_id}>
                      <td>{index + 1}</td>
                      <td><strong>{row.part_number}</strong><small>{row.part_description}</small></td>
                      <td>{branchNames[row.branch_id]}</td>
                      <td>{row.current_safety_stock_qty}</td>
                      <td className="good-text">{row.recommended_safety_stock_qty}</td>
                      <td><span className="table-badge created">+{row.change_units} ({row.change_pct}%)</span></td>
                      <td className="warn-text">{inr(row.additional_investment_inr)}</td>
                      <td className="good-text">−{row.expected_stockout_risk_reduction_pct}%</td>
                      <td className="reason-cell">{row.reason}</td>
                      <td><button className="table-action">✓ Accept</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel vendor-switch">
            <h3>Vendor Switch Recommendation <span className="tag">Hydraulics · CatParts Direct</span></h3>
            <div className="vendor-switch-grid">
              <div className="switch-vendor current">
                <small>CURRENT VENDOR</small><strong>{vendorSwitch.current_vendor_name}</strong>
                <span>On-Time: <b>{vendorSwitch.current_vendor_on_time_pct}%</b></span>
                <span>Avg Lead: <b>{vendorSwitch.current_vendor_lead_time_avg}d</b></span>
                <span className="table-badge high">{vendorSwitch.current_vendor_risk_tier} RISK</span>
              </div>
              <span className="switch-arrow">→</span>
              <div className="switch-vendor recommended">
                <small>RECOMMENDED VENDOR</small><strong>{vendorSwitch.recommended_vendor_name}</strong>
                <span>On-Time: <b>{vendorSwitch.recommended_vendor_on_time_pct}%</b></span>
                <span>Avg Lead: <b>{vendorSwitch.recommended_vendor_lead_time_avg}d</b></span>
                <span className="table-badge low">LOW RISK</span>
              </div>
            </div>
            <p>Parts affected: <b>{vendorSwitch.parts_affected.join(', ')}</b> · branches: <b>{vendorSwitch.branches_affected.map(id => branchNames[id]).join(', ')}</b> · lead-time reduction: <b>{vendorSwitch.lead_time_reduction_days}d</b> · risk reduction: <b>{vendorSwitch.expected_stockout_risk_reduction_pct}%</b></p>
            <button className="table-action">✓ Accept Switch Recommendation</button>
          </div>

          <div className="foot-note">
            <span>model_name: {metadata.model_name} · model_version: {metadata.model_version}</span>
            <span>formula: SS = Z×√(L×σd²+d²×σL²) · service_level: 80%</span>
          </div>
        </div>
      </main>
    </div>
  );
}
