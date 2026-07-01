import { Doughnut } from 'react-chartjs-2';
import { baseOpts, CHART_COLORS } from './chartSetup';

export default function RiskDonut({ labels, data }) {
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: [
          `${CHART_COLORS.danger}E6`,
          `${CHART_COLORS.warning}E6`,
          `${CHART_COLORS.accent}E6`,
          `${CHART_COLORS.primary}B8`,
        ],
        borderColor: '#FFFFFF',
        borderWidth: 3,
        hoverOffset: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 9,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 9.5, family: 'Inter, sans-serif' },
          color: CHART_COLORS.label,
        },
      },
      tooltip: baseOpts().plugins.tooltip,
    },
  };

  return <Doughnut data={chartData} options={options} />;
}
