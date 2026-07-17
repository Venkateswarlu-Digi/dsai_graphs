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
  const horizon60Ratio = summary.total_predicted_units_60d / summary.total_predicted_units_30d;
  const horizon90Ratio = summary.total_predicted_units_90d / summary.total_predicted_units_30d;

  const kpis = [
    {
      label: 'Parts Forecasted',
      value: number.format(summary.total_parts_forecasted),
      delta: `${summary.total_branches_covered} branches · daily grain`,
      tooltip: 'Total number of spare parts for which the AI model generated demand forecasts across all branches.'
    },
    {
      label: 'Units Forecast (30d)',
      value: number.format(summary.total_predicted_units_30d),
      delta: `₹${compact.format(summary.total_forecast_value_inr_30d)} procurement est.`,
      deltaDir: 'up',
      tooltip: 'Expected demand for the next 30 days. Procurement estimate is based on forecasted quantity.'
    },
    {
      label: 'Forecast Accuracy',
      value: `${summary.model_accuracy.forecast_accuracy_pct}%`,
      delta: `MAPE ${summary.model_accuracy.wape_overall}% · MAPE Fast ${summary.model_accuracy.mape_fast_movers}%`,
      deltaDir: 'up',
      tooltip: 'Overall prediction accuracy. Lower MAPE indicates better forecasting performance.'
    },
    {
      label: 'Peak Demand Uplift',
      value: `+${peak.monsoon_uplift_pct}%`,
      delta: `${peak.category} · monsoon peak`,
      type: 'alert-amb',
      deltaDir: 'warn',
      tooltip: 'Increase in expected demand during seasonal peaks such as the monsoon.'
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
              tooltip="Detailed line chart plotting actual job-count demand against the model's p50 forecast, with a shaded p10–p90 confidence band, over a 90-day weekly view."
            >
              <ForecastTrend data={graphs.demand_trend_line_all_parts} />
            </ChartCard>
            <ChartCard
              title="Demand by Category (30d)"
              tag="predicted_qty"
              height="sm"
              tooltip="Bar chart showing the total predicted parts demand for the next 30 days, broken down by category, to prioritize which categories need attention."
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
              tooltip="Bar chart comparing current stock on hand against 30-day forecasted demand for the top 5 highest-demand parts, exposing potential supply gaps."
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
              tooltip="Donut chart splitting the parts portfolio into Fast, Medium, Slow, and Dead movers based on consumption velocity, useful for inventory strategy decisions."
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
``              <span className="tag">primary_table · sortable</span>
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
                        <td>{row.predicted_qty_60d ?? Math.round(row.predicted_qty * horizon60Ratio)}</td>
                        <td>{row.predicted_qty_90d ?? Math.round(row.predicted_qty * horizon90Ratio)}</td>
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
