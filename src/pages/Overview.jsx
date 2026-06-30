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
            <ChartCard title="Demand Trend" tag={charts.demandTrend.tag} height="sm">
              <DemandTrend data={charts.demandTrend} />
            </ChartCard>
            <ChartCard title="Stockout Risk Split" tag={charts.stockoutRiskDonut.tag} height="sm">
              <RiskDonut labels={charts.stockoutRiskDonut.labels} data={charts.stockoutRiskDonut.data} />
            </ChartCard>
            <ChartCard title="Risk Trend — 6 Weeks" tag={charts.riskTrend.tag} height="sm">
              <RiskTrend data={charts.riskTrend.data} />
            </ChartCard>
          </div>

          <div className="grid2">
            <div className="panel">
              <h3>
                Stockout Risk Heatmap — Branch × Category
                <span className="tag">risk %</span>
              </h3>
              <Heatmaps data={heatmap.data} />
            </div>
            <div className="panel">
              <h3>
                Priority Actions Today
                <span className="tag">top decisions</span>
              </h3>
              <PriorityActions items={priorityActions} />
            </div>
          </div>

          <ChartCard title="Jobs at Risk by Category" tag={charts.jobsAtRisk.tag}>
            <JobsRisk data={charts.jobsAtRisk.data} />
          </ChartCard>

          <ModelInfo meta={meta} />
        </div>
      </main>
    </div>
  );
}
