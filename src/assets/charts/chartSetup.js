import { Chart as ChartJS, registerables } from 'chart.js';
ChartJS.register(...registerables);

const gridColor = 'rgba(255,255,255,.05)';

export const baseOpts = (extra = {}) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { boxWidth: 10, font: { size: 10.5 }, color: '#8b93a3' } },
  },
  scales: {
    x: { grid: { color: gridColor }, ticks: { color: '#8b93a3', font: { size: 10 } } },
    y: { grid: { color: gridColor }, ticks: { color: '#8b93a3', font: { size: 10 } } },
  },
  ...extra,
});

export default ChartJS;
