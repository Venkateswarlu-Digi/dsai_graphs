import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { baseOpts, CHART_COLORS, CHART_PALETTE } from './chartSetup';

export default function DynamicChart({ type = 'bar', labels, datasets, stacked = false }) {
  const data = {
    labels,
    datasets: datasets.map((set, index) => ({
      borderColor: CHART_PALETTE[index % CHART_PALETTE.length],
      backgroundColor: type === 'line'
        ? `${CHART_PALETTE[index % CHART_PALETTE.length]}14`
        : `${CHART_PALETTE[index % CHART_PALETTE.length]}D9`,
      borderWidth: type === 'line' ? 2.25 : 0,
      borderRadius: type === 'bar' ? 6 : 0,
      borderSkipped: false,
      tension: 0.38,
      pointRadius: type === 'line' ? 2.5 : 0,
      pointHoverRadius: type === 'line' ? 5 : 0,
      pointBackgroundColor: '#FFFFFF',
      pointBorderColor: CHART_PALETTE[index % CHART_PALETTE.length],
      pointBorderWidth: type === 'line' ? 1.5 : 0,
      fill: type === 'line',
      ...set,
    })),
  };

  if (type === 'doughnut') {
    data.datasets[0].backgroundColor = CHART_PALETTE.map(color => `${color}E6`);
    data.datasets[0].borderColor = '#FFFFFF';
    data.datasets[0].borderWidth = 3;
    data.datasets[0].hoverOffset = 5;
    return (
      <Doughnut
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          cutout: '62%',
          plugins: {
            legend: {
              position: 'right',
              labels: {
                boxWidth: 9,
                usePointStyle: true,
                pointStyle: 'circle',
                color: CHART_COLORS.label,
                font: { size: 9.5, family: 'Inter, sans-serif' },
              },
            },
            tooltip: baseOpts().plugins.tooltip,
          },
        }}
      />
    );
  }

  const options = baseOpts({
    plugins: {
      legend: {
        display: datasets.length > 1,
        labels: { boxWidth: 9, color: CHART_COLORS.label, font: { size: 10 } },
      },
    },
  });
  options.scales.x.stacked = stacked;
  options.scales.y.stacked = stacked;

  return type === 'line' ? <Line data={data} options={options} /> : <Bar data={data} options={options} />;
}
