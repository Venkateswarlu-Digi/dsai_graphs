import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { baseOpts } from './chartSetup';

const palette = ['#34d6b8', '#f5b400', '#ef5a5a', '#a78bfa', '#38bdf8', '#fb923c'];

export default function DynamicChart({ type = 'bar', labels, datasets, stacked = false }) {
  const data = {
    labels,
    datasets: datasets.map((set, index) => ({
      borderColor: palette[index],
      backgroundColor: type === 'line' ? `${palette[index]}22` : `${palette[index]}bf`,
      borderWidth: type === 'line' ? 2 : 0,
      borderRadius: type === 'bar' ? 4 : 0,
      tension: 0.32,
      pointRadius: type === 'line' ? 2.5 : 0,
      fill: false,
      ...set,
    })),
  };

  if (type === 'doughnut') {
    data.datasets[0].backgroundColor = palette.map(color => `${color}cc`);
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
              labels: { boxWidth: 9, color: '#8b93a3', font: { size: 9.5 } },
            },
          },
        }}
      />
    );
  }

  const options = baseOpts({
    plugins: {
      legend: {
        display: datasets.length > 1,
        labels: { boxWidth: 9, color: '#8b93a3', font: { size: 10 } },
      },
    },
  });
  options.scales.x.stacked = stacked;
  options.scales.y.stacked = stacked;

  return type === 'line' ? <Line data={data} options={options} /> : <Bar data={data} options={options} />;
}
