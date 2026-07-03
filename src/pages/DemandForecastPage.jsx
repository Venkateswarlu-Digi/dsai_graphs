import '../styles/dashboard.css';
import demandJson from '../data/Demand_Forecast.json';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import DynamicChart from '../assets/charts/DynamicChart';
import ForecastTrend from '../assets/charts/ForecastTrend';
import { CHART_COLORS, CHART_PALETTE } from '../assets/charts/chartSetup';

const compact = new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 });
const number = new Intl.NumberFormat('en-IN');
const COLORS = [...CHART_PALETTE];

function allPredictions(table) {
  return Object.values(table).flat();
}

function formatDays(value) {
  return value == null ? '—' : `${value}d`;
}

function confidenceClass(value) {
  if (value >= 70) return 'good';
  if (value >= 45) return 'medium';
  return 'low';
}

export default function DemandForecastPage({ onNavigate }) {
  const { metadata, summary, graph_data: graphs, forecast_table: table } = demandJson.result;
  const predictions = allPredictions(table);
  const topParts = predictions.filter(row => row.predicted_qty > 0);
  const peak = graphs.monsoon_demand_uplift.reduce((best, item) =>
    item.monsoon_uplift_pct > best.monsoon_uplift_pct ? item : best
  );
  const horizon60Ratio = summary.total_predicted_units_60d / summary.total_predicted_units_30d;
  const horizon90Ratio = summary.total_predicted_units_90d / summary.total_predicted_units_30d;

  const kpis = [
    { label: 'Parts Forecasted', value: number.format(summary.total_parts_forecasted), delta: `${summary.total_branches_covered} branches · daily grain` },
    { label: 'Units Forecast (30d)', value: number.format(summary.total_predicted_units_30d), delta: `₹${compact.format(summary.total_forecast_value_inr_30d)} procurement est.`, deltaDir: 'up' },
    { label: 'Forecast Accuracy', value: `${summary.model_accuracy.forecast_accuracy_pct}%`, delta: `MAPE ${summary.model_accuracy.wape_overall}% · MAPE Fast ${summary.model_accuracy.mape_fast_movers}%`, deltaDir: 'up' },
    { label: 'Peak Demand Uplift', value: `+${peak.monsoon_uplift_pct}%`, delta: `${peak.category} · monsoon peak`, type: 'alert-amb', deltaDir: 'warn' },
  ];

  return (
    <div className="shell demand-shell">
      <Sidebar active="demand" onNavigate={onNavigate} />
      <main className="main demand-page">
        <Header
          title="Demand Forecast — Sub-model 4.1"
          subtitle={`Part-level forecasting · LightGBM + Prophet + kNN · ${metadata.confidence_level} confidence`}
        />

        <div className="demand-content">
          <div className="kpis demand-kpis">
            {kpis.map(kpi => <KPICard key={kpi.label} {...kpi} />)}
          </div>

          <div className="demand-grid demand-grid-top">
            <ChartCard
              title="Forecast vs Actual — 90d"
              tag="job_count · weekly · 80% CI"
              height="sm"
              tooltip="Compares forecasted demand with actual demand over the last 90 days. The shaded 80% confidence interval represents the expected forecast range and helps identify deviations between predicted and actual demand."
            >
              <ForecastTrend data={graphs.demand_trend_line_all_parts} />
            </ChartCard>
            <ChartCard
              title="Demand by Category (30d)"
              tag="predicted_qty"
              height="sm"
              tooltip="Displays the predicted demand for each inventory category over the next 30 days. Higher bars indicate categories expected to require more units, helping prioritize inventory planning and replenishment."
            >
              <DynamicChart
                labels={graphs.demand_by_category_bar.slice(0, 6).map(item => item.category)}
                datasets={[
                  {
                    label: "Predicted Units",
                    data: graphs.demand_by_category_bar
                      .slice(0, 6)
                      .map(item => item.predicted_units_30d),
                    backgroundColor: COLORS,
                  },
                ]}
              />
            </ChartCard>
          </div>

          <div className="demand-grid demand-grid-bottom">
  <ChartCard
    title="Top Parts — Stock vs Forecast"
    tag="gap analysis"
    height="sm"
    tooltip="Compares current inventory with the projected 30-day demand for the highest-priority parts. Large gaps between stock on hand and forecasted demand highlight parts that may require replenishment to prevent stock shortages."
  >
    <DynamicChart
      labels={topParts.map(item => item.part_number)}
      datasets={[
        {
          label: "Stock on Hand",
          data: topParts.map(item => item.stock_on_hand),
          backgroundColor: `${CHART_COLORS.secondary}B8`,
        },
        {
          label: "30d Forecast",
          data: topParts.map(item => item.predicted_qty),
          backgroundColor: `${CHART_COLORS.primary}D9`,
        },
      ]}
    />
  </ChartCard>

  <ChartCard
    title="Movement Classification"
    tag="portfolio split"
    height="sm"
    tooltip="Shows the distribution of inventory based on movement categories such as fast-, medium-, and slow-moving items. This helps identify stock turnover patterns and supports inventory optimization."
  >
    <DynamicChart
      type="doughnut"
      labels={graphs.movement_class_donut.map(item => item.label)}
      datasets={[
        {
          data: graphs.movement_class_donut.map(item => item.value),
        },
      ]}
    />
  </ChartCard>
</div>
          <div className="panel demand-predictions">
            <h3>
              Part-Level Demand Predictions
              <span className="tag">primary_table · sortable</span>
            </h3>
            <div className="data-table-wrap">
              <table className="data-table demand-table">
                <thead>
                  <tr>
                    <th>#</th><th>Part</th><th>Branch</th><th>Category</th>
                    <th>30d Forecast</th><th>60d Forecast</th><th>90d Forecast</th>
                    <th>Stock on Hand</th><th>Days Cover</th><th>Lead Time</th>
                    <th>Confidence</th><th>Trend</th><th>Movement</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((row, index) => {
                    const confidence = Math.max(0, Math.round(100 - row.stockout_risk_pct));
                    return (
                      <tr key={row.prediction_id}>
                        <td>{index + 1}</td>
                        <td><strong>{row.part_number}</strong><small>{row.part_description}</small></td>
                        <td>{row.branch_name.replace(' Branch', '')}</td>
                        <td><span className="category-chip">{row.part_category}</span></td>
                        <td>{row.predicted_qty}</td>
                        <td>{Math.round(row.predicted_qty * horizon60Ratio)}</td>
                        <td>{Math.round(row.predicted_qty * horizon90Ratio)}</td>
                        <td>{row.stock_on_hand}</td>
                        <td className={row.days_of_cover < row.vendor_lead_time_days ? 'danger-text' : 'good-text'}>{formatDays(row.days_of_cover)}</td>
                        <td>{formatDays(row.vendor_lead_time_days)}</td>
                        <td>
                          <div className="confidence-cell">
                            <span className={`confidence-bar ${confidenceClass(confidence)}`} style={{ '--confidence': `${confidence}%` }} />
                            {confidence}%
                          </div>
                        </td>
                        <td><span className={`trend-line ${row.consumption_trend_direction.toLowerCase()}`} /></td>
                        <td><span className={`movement-chip ${row.movement_class.toLowerCase()}`}>{row.movement_class}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="foot-note">
            <span>model_name: {metadata.model_name} · model_version: {metadata.model_version}</span>
            <span>MAPE fast_movers: {summary.model_accuracy.mape_fast_movers}% · WAPE: {summary.model_accuracy.wape_overall}% · confidence: {metadata.confidence_level}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
