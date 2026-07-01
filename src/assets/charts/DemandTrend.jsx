import { Line } from 'react-chartjs-2';
import { baseOpts, CHART_COLORS } from './chartSetup';

export default function DemandTrend({ data }) {
  const actual = data.datasets.find(d => d.label === 'Actual');
  const forecast = data.datasets.find(d => d.label === 'Forecast');

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Actual',
        data: actual?.data ?? [],
        borderColor: CHART_COLORS.primary,
        backgroundColor: `${CHART_COLORS.primary}14`,
        borderWidth: 2.25,
        pointRadius: 3,
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: CHART_COLORS.primary,
        pointBorderWidth: 2,
        fill: true,
        tension: 0.38,
        spanGaps: true,
      },
      {
        label: 'Forecast',
        data: forecast?.data ?? [],
        borderColor: CHART_COLORS.secondary,
        backgroundColor: `${CHART_COLORS.secondary}0F`,
        borderWidth: 2.25,
        borderDash: [4, 4],
        pointRadius: 2,
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: CHART_COLORS.secondary,
        pointBorderWidth: 1.5,
        fill: true,
        tension: 0.38,
      },
    ],
  };

  return <Line data={chartData} options={baseOpts()} />;
}
