import { Line } from 'react-chartjs-2';
import { baseOpts, CHART_COLORS } from './chartSetup';

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
        backgroundColor: `${CHART_COLORS.secondary}14`,
        pointRadius: 0,
        fill: '+1',
        tension: 0.35,
      },
      {
        label: 'CI Lower (p10)',
        data: data.map(point => point.confidence_low),
        borderColor: 'transparent',
        backgroundColor: `${CHART_COLORS.secondary}14`,
        pointRadius: 0,
        fill: false,
        tension: 0.35,
      },
      {
        label: 'Actual',
        data: data.map(point => point.actual_units),
        borderColor: CHART_COLORS.primary,
        backgroundColor: `${CHART_COLORS.primary}14`,
        borderWidth: 2.25,
        pointRadius: 3,
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: CHART_COLORS.primary,
        pointBorderWidth: 1.5,
        tension: 0.38,
      },
      {
        label: 'Forecast (p50)',
        data: data.map(point => point.predicted_units),
        borderColor: CHART_COLORS.secondary,
        backgroundColor: `${CHART_COLORS.secondary}14`,
        borderWidth: 2.25,
        borderDash: [4, 4],
        pointRadius: 2,
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: CHART_COLORS.secondary,
        pointBorderWidth: 1.5,
        tension: 0.38,
      },
    ],
  };

  const options = baseOpts({
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: {
        labels: {
          boxWidth: 8,
          color: CHART_COLORS.label,
          font: { size: 9 },
          filter: item => !item.text.startsWith('CI Lower'),
        },
      },
    },
  });

  return <Line data={chartData} options={options} />;
}
