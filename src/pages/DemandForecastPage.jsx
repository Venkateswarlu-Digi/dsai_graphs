import '../styles/dashboard.css';
import { useState } from 'react';
import demandJson from '../data/Demand_Forecast.json';
import useDashboardData from '../hooks/useDashboardData';
import NetworkStatus from '../components/NetworkStatus';
import InfoTooltip from '../components/InfoTooltip';
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
  const [days, setDays] = useState(30);
  const { data, loading, error, reload } = useDashboardData('demand', demandJson.result, days);
  const { metadata, summary, graph_data: graphs, forecast_table: table } = data;
  const predictions = allPredictions(table);
  const topParts = predictions
    .filter(row => row.predicted_qty > 0)
    .sort((first, second) => second.predicted_qty - first.predicted_qty)
    .slice(0, 5);
  const peak = graphs.monsoon_demand_uplift.reduce((best, item) =>
    item.monsoon_uplift_pct > best.monsoon_uplift_pct ? item : best
  );
  const selectedForecastUnits = summary[`total_predicted_units_${days}d`]
    ?? predictions.reduce((total, row) => total + row.predicted_qty, 0);
  const selectedForecastValue = summary[`total_forecast_value_inr_${days}d`];

  const kpis = [
    {
      label: 'Parts Forecasted',
      value: number.format(summary.total_parts_forecasted),
      delta: `${summary.total_branches_covered} branches · daily grain`,
      tooltip: 'How many distinct parts currently have an active forecast, for the selected branches/categories/window.'
    },
    {
      label: `Units Forecast (${days}d)`,
      value: number.format(selectedForecastUnits),
      delta: selectedForecastValue == null ? 'selected forecast horizon' : `₹${compact.format(selectedForecastValue)} procurement est.`,
      deltaDir: 'up',
      tooltip: 'Total predicted consumption, in units, across all forecasted parts over the next 30 days.'
    },
    {
      label: 'Forecast Accuracy',
      value: `${summary.model_accuracy.forecast_accuracy_pct}%`,
      delta: `MAPE ${summary.model_accuracy.wape_overall}% · MAPE Fast ${summary.model_accuracy.mape_fast_movers}%`,
      deltaDir: 'up',
      tooltip: 'How accurate the model has been historically, expressed as 100% minus its error rate (MAPE), based on backtesting against real outcomes.'
    },
    {
      label: 'Peak Demand Uplift',
      value: `+${peak.monsoon_uplift_pct}%`,
      delta: `${peak.category} · monsoon peak`,
      type: 'alert-amb',
      deltaDir: 'warn',
      tooltip: 'The seasonal increase currently being applied to demand forecasts because of the active season (monsoon).'
    }
  ];
  return (
    <div className="shell demand-shell">
      <Sidebar active="demand" onNavigate={onNavigate} />
      <main className="main demand-page">
        <Header
          title="Demand Forecast — Sub-model 4.1"
          subtitle={"This module predicts how many units of each spare part will be consumed at each branch over the next 30, 60, and 90 days."}
          days={days}
          onDaysChange={setDays}
        />

        <div className="demand-content">
          <NetworkStatus loading={loading} error={error} onRetry={reload} />
          <div className="kpis demand-kpis">
            {kpis.map(kpi => (
              <KPICard key={kpi.label} {...kpi} />
            ))}
          </div>

          <div className="demand-grid demand-grid-top">
            <ChartCard
              title="Forecast vs Actual — 90d"
              tag="job_count · weekly · 80% CI"
              height="sm"
              tooltip="A line chart of weekly job/consumption volume over the last several weeks. The solid green line is what actually happened; the dashed blue line is the model's forecast for the upcoming weeks; the shaded band around the forecast is the 80% confidence interval — the range the model expects the true value to fall within 8 times out of 10. A narrow band means high confidence; a wide band means more uncertainty."
            >
              <ForecastTrend data={graphs.demand_trend_line_all_parts} />
            </ChartCard>
            <ChartCard
              title="Demand by Category (30d)"
              tag="predicted_qty"
              height="sm"
              tooltip="A bar chart of total predicted 30-day demand, split out by part category (Engine, Hydraulics, Filters, etc.), showing at a glance where the biggest volume of future demand is concentrated."
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
              tooltip="A gap-analysis bar chart comparing current Stock on Hand (blue bars) against the 30-day Forecast (green bars) for the highest-priority parts. Where the green bar is much taller than the blue bar, current stock won't cover the forecasted demand — an early warning sign that feeds into the Stockout Risk module."
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
              tooltip="A donut chart showing what share of the parts portfolio is Fast, Medium, or Slow moving, based on historical consumption velocity. This classification drives which forecasting method (LightGBM vs Prophet vs kNN) is used for each part, and how much safety stock buffer is appropriate."
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
              <span className="panel-heading-with-tooltip">
                Part-Level Demand Predictions
                <InfoTooltip text="Part-level forecasts by branch. Compare forecast horizons, stock, days cover, and vendor lead time to prioritize replenishment." />
              </span>
              <span className="tag">primary_table · selected horizon</span>
            </h3>
            <div className="data-table-wrap">
              <table className="data-table demand-table">
                <thead>
                  <tr>
                    <th>#</th><th>Part</th><th>Branch</th><th>Category</th>
                    <th>Forecast ({days}d)</th><th>Change</th>
                    <th>Stock on Hand</th><th>Days Cover</th><th>Lead Time</th>
                    <th>Confidence</th><th>Trend</th><th>Movement</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((row, index) => {
                    const confidence = Math.max(0, Math.round(100 - row.stockout_risk_pct));
                    const forecastChange = row.predicted_qty - row.stock_on_hand;
                    return (
                      <tr key={row.prediction_id}>
                        <td>{index + 1}</td>
                        <td><strong>{row.part_number}</strong><small>{row.part_description}</small></td>
                        <td>{row.branch_name.replace(' Branch', '')}</td>
                        <td><span className="category-chip">{row.part_category}</span></td>
                        <td>{row.predicted_qty}</td>
                        <td className={forecastChange > 0 ? 'danger-text' : 'good-text'}>{forecastChange > 0 ? '+' : ''}{Math.round(forecastChange)}</td>
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
