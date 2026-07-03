import overviewData from '../data/overview.json';
import '../styles/dashboard.css';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Banner from '../components/Banner';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import Heatmaps from '../components/Heatmaps';
import PriorityActions from '../components/PriorityActions';
import ModelInfo from '../components/ModelInfo';

import DemandTrend from '../assets/charts/DemandTrend';
import RiskDonut from '../assets/charts/RiskDonut';
import RiskTrend from '../assets/charts/RiskTrend';
import JobsRisk from '../assets/charts/JobsRisk';

export default function Overview({ active = 'overview', onNavigate }) {
  const { meta, banner, kpis, charts, heatmap, priorityActions } = overviewData.overview;

  return (
    <div className="shell">
      <Sidebar active={active} onNavigate={onNavigate} />

      <main className="main">
        <Header
          title={meta.title}
          subtitle="All branches · Sub-models 4.1–4.5 · Parts Demand Prediction Engine"
        />

        <div className="content">
          <div className="view-head">
            <div>
              <h2>{meta.title}</h2>
              <div className="desc">{meta.description}</div>
            </div>
            <span className="method-badge ml"><i /> 5 sub-models active</span>
          </div>

          <Banner banner={banner} />

          <div className="kpis kpis-8">
            {kpis.map((kpi) => <KPICard key={kpi.label} {...kpi} />)}
          </div>

          <div className="overview-chart-grid">
            <ChartCard
              title="Demand Trend"
              tooltip="Displays the predicted demand trend for selected products over time. Peaks indicate higher forecasted demand."
              tag={charts.demandTrend.tag}
              height="sm"
            >
              <DemandTrend data={charts.demandTrend} />
            </ChartCard>

            <ChartCard
              title="Stockout Risk Split"
              tooltip="Shows the percentage of products grouped by Low, Medium and High stockout risk."
              tag={charts.stockoutRiskDonut.tag}
              height="sm"
            >
              <RiskDonut
                labels={charts.stockoutRiskDonut.labels}
                data={charts.stockoutRiskDonut.data}
              />
            </ChartCard>

            <ChartCard
              title="Risk Trend — 6 Weeks"
              tooltip="Illustrates how stockout risk has changed during the last six weeks."
              tag={charts.riskTrend.tag}
              height="sm"
            >
              <RiskTrend data={charts.riskTrend.data} />
            </ChartCard>

            <ChartCard
              title="Jobs at Risk by Category"
              tooltip="Shows the number of work orders likely to be delayed due to inventory shortages across categories."
              tag={charts.jobsAtRisk.tag}
            >
              <JobsRisk data={charts.jobsAtRisk.data} />
            </ChartCard>
          </div>

          <div className="grid2">
            <ChartCard
              title="Stockout Risk Heatmap — Branch × Category"
              tooltip="Displays the stockout risk percentage across branches and product categories. Darker cells indicate higher stockout risk, helping identify inventory shortages by location and category."
              tag="risk %"
            >
              <Heatmaps data={heatmap.data} />
            </ChartCard>
            <ChartCard
              title="Priority Actions Today"
              tooltip="Highlights the highest-priority inventory actions that require immediate attention, such as critical stock shortages, urgent transfers, or replenishment recommendations."
              tag="top decisions"
            >
              <PriorityActions items={priorityActions} />
            </ChartCard>
          </div>


          <ModelInfo meta={meta} />
        </div>
      </main>
    </div>
  );
}
