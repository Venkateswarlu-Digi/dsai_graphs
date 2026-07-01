import { Bar } from 'react-chartjs-2';
import { baseOpts, CHART_COLORS } from './chartSetup';

export default function JobsRisk({ data }) {
  const chartData = {
    labels: data.map(j => j.cat),
    datasets: [
      { label: 'Jobs at Risk', data: data.map(j => j.jobs), backgroundColor: `${CHART_COLORS.danger}D9`, borderRadius: 6, borderSkipped: false },
      { label: 'SLA Jobs', data: data.map(j => j.sla), backgroundColor: `${CHART_COLORS.warning}D9`, borderRadius: 6, borderSkipped: false },
    ],
  };

  const opts = baseOpts({
    plugins: { legend: { labels: { boxWidth: 9, font: { size: 10.5 }, color: CHART_COLORS.label } } },
  });

  return <Bar data={chartData} options={opts} />;
}
