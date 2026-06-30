import { Scatter } from 'react-chartjs-2';
import { baseOpts } from './chartSetup';

const colors = {
  CRITICAL: '#ef5a5a',
  HIGH: '#f5b400',
  MEDIUM: '#a78bfa',
  LOW: '#34d6b8',
};

export default function RiskScatter({ data }) {
  const chartData = {
    datasets: Object.keys(colors).map(severity => ({
      label: severity,
      data: data
        .filter(point => point.severity === severity)
        .map(point => ({
          x: point.lead_time_days,
          y: point.days_of_cover,
          part: point.part_number,
          risk: point.risk_pct,
        })),
      backgroundColor: colors[severity],
      pointRadius: data.filter(point => point.severity === severity).map(point => 4 + point.risk_pct / 15),
      pointHoverRadius: 8,
    })),
  };

  const options = baseOpts({
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: context => {
            const point = context.raw;
            return `${point.part}: ${point.risk}% risk · ${point.y}d cover / ${point.x}d lead`;
          },
        },
      },
    },
  });
  options.scales.x.title = { display: true, text: 'Lead Time (days)', color: '#5b6373', font: { size: 9 } };
  options.scales.y.title = { display: true, text: 'Days Cover', color: '#5b6373', font: { size: 9 } };

  return <Scatter data={chartData} options={options} />;
}
