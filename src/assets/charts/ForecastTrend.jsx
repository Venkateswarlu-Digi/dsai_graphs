import { Line } from 'react-chartjs-2';
import { baseOpts } from './chartSetup';

export default function ForecastTrend({ data }) {
  const labels = data.map(point =>
    new Date(`${point.period_date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: 'CI Upper (p90)',
        data: data.map(point => point.confidence_high),
        borderColor: 'transparent',
        backgroundColor: 'rgba(245,180,0,.09)',
        pointRadius: 0,
        fill: '+1',
        tension: 0.35,
      },
      {
        label: 'CI Lower (p10)',
        data: data.map(point => point.confidence_low),
        borderColor: 'transparent',
        backgroundColor: 'rgba(245,180,0,.09)',
        pointRadius: 0,
        fill: false,
        tension: 0.35,
      },
      {
        label: 'Actual',
        data: data.map(point => point.actual_units),
        borderColor: '#34d6b8',
        backgroundColor: '#34d6b8',
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.35,
      },
      {
        label: 'Forecast (p50)',
        data: data.map(point => point.predicted_units),
        borderColor: '#f5b400',
        backgroundColor: '#f5b400',
        borderWidth: 2,
        borderDash: [4, 4],
        pointRadius: 2,
        tension: 0.35,
      },
    ],
  };

  const options = baseOpts({
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: {
        labels: {
          boxWidth: 8,
          color: '#8b93a3',
          font: { size: 9 },
          filter: item => !item.text.startsWith('CI Lower'),
        },
      },
    },
  });

  return <Line data={chartData} options={options} />;
}
