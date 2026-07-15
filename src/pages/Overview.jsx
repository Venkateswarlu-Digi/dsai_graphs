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
              tooltip="Line chart comparing actual parts demand against the forecasted demand over the last 90 days, so you can spot where predictions are drifting from reality."
              tag={charts.demandTrend.tag}
              height="sm"
            >
              <DemandTrend data={charts.demandTrend} />
            </ChartCard>

            <ChartCard
              title="Risk Trend — 6 Weeks"
              tooltip="Stacked bar chart tracking how many parts fell into Critical, High, and Medium risk each week over the past 6 weeks, showing whether risk is improving or worsening."
              tag={charts.riskTrend.tag}
              height="sm"
            >
              <RiskTrend data={charts.riskTrend.data} />
            </ChartCard>

            <ChartCard
              title="Jobs at Risk by Category"
              tooltip="Bar chart showing the number of jobs at stockout risk and the subset of those at SLA breach risk, broken down by part category."
              tag={charts.jobsAtRisk.tag}
            >
              <JobsRisk data={charts.jobsAtRisk.data} />
            </ChartCard>
          </div>

          <div className="grid2">
            <ChartCard
              title="Stockout Risk Heatmap — Branch × Category"
              tooltip="Color-coded grid showing stockout risk percentage for every branch and part category combination, making it easy to spot hotspots at a glance."
              tag="risk %"
            >
              <Heatmaps data={heatmap.data} />
            </ChartCard>
            <ChartCard
              title="Priority Actions Today"
              tooltip="Line chart tracking daily counts of purchase requisitions raised, purchase orders raised, and job-triggered events over the last 7 days, showing procurement activity momentum."
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
