import { Chart } from 'react-chartjs-2';
import { baseOpts } from './chartSetup';

export default function SapActivityChart({ data }) {
  const chartData = {
    labels: data.map(item => new Date(`${item.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      { type: 'bar', label: 'Auto PRs', data: data.map(item => item.prs_auto_raised), backgroundColor: '#34d6b8cc', borderRadius: 3 },
      { type: 'bar', label: 'POs Raised', data: data.map(item => item.pos_raised), backgroundColor: '#f5b400cc', borderRadius: 3 },
      { type: 'line', label: 'Job Triggers', data: data.map(item => item.parts_readiness_triggers), borderColor: '#a78bfa', backgroundColor: '#a78bfa', borderWidth: 2, pointRadius: 2, tension: 0.3 },
    ],
  };

  return <Chart type="bar" data={chartData} options={baseOpts()} />;
}
