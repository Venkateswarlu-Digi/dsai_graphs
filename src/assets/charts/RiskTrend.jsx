import { Bar } from 'react-chartjs-2';
import { baseOpts, CHART_COLORS } from './chartSetup';

export default function RiskTrend({ data }) {
  const chartData = {
    labels: data.map(r => r.d),
    datasets: [
      { label: 'Critical', data: data.map(r => r.cr), backgroundColor: `${CHART_COLORS.danger}D9`, borderRadius: 5, borderSkipped: false, stack: 's' },
      { label: 'High', data: data.map(r => r.hi), backgroundColor: `${CHART_COLORS.warning}D9`, borderRadius: 5, borderSkipped: false, stack: 's' },
      { label: 'Medium', data: data.map(r => r.md), backgroundColor: `${CHART_COLORS.accent}CC`, borderRadius: 5, borderSkipped: false, stack: 's' },
    ],
  };

  const opts = baseOpts({
    plugins: { legend: { labels: { boxWidth: 8, font: { size: 9 }, color: CHART_COLORS.label } } },
  });
  opts.scales.x.stacked = true;
  opts.scales.y.stacked = true;

  return <Bar data={chartData} options={opts} />;
}
