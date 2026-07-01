import { Scatter } from 'react-chartjs-2';
import { baseOpts, CHART_COLORS } from './chartSetup';

const colors = {
  CRITICAL: CHART_COLORS.danger,
  HIGH: CHART_COLORS.warning,
  MEDIUM: CHART_COLORS.accent,
  LOW: CHART_COLORS.primary,
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
      borderColor: '#FFFFFF',
      borderWidth: 1.5,
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
  options.scales.x.title = { display: true, text: 'Lead Time (days)', color: CHART_COLORS.label, font: { size: 9 } };
  options.scales.y.title = { display: true, text: 'Days Cover', color: CHART_COLORS.label, font: { size: 9 } };

  return <Scatter data={chartData} options={options} />;
}
