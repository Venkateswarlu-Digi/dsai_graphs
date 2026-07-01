import { Chart } from 'react-chartjs-2';
import { baseOpts, CHART_COLORS } from './chartSetup';

export default function SapActivityChart({ data }) {
  const chartData = {
    labels: data.map(item => new Date(`${item.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      { type: 'bar', label: 'Auto PRs', data: data.map(item => item.prs_auto_raised), backgroundColor: `${CHART_COLORS.primary}D9`, borderRadius: 6, borderSkipped: false },
      { type: 'bar', label: 'POs Raised', data: data.map(item => item.pos_raised), backgroundColor: `${CHART_COLORS.secondary}D9`, borderRadius: 6, borderSkipped: false },
      { type: 'line', label: 'Job Triggers', data: data.map(item => item.parts_readiness_triggers), borderColor: CHART_COLORS.accent, backgroundColor: `${CHART_COLORS.accent}14`, borderWidth: 2.25, pointRadius: 2.5, pointBackgroundColor: '#FFFFFF', pointBorderColor: CHART_COLORS.accent, pointBorderWidth: 1.5, tension: 0.38 },
    ],
  };

  return <Chart type="bar" data={chartData} options={baseOpts()} />;
}
