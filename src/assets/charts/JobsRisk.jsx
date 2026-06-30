import React from 'react';
import { Bar } from 'react-chartjs-2';
import { baseOpts } from './chartSetup';

export default function JobsRisk({ data }) {
  const chartData = {
    labels: data.map(j => j.cat),
    datasets: [
      { label: 'Jobs at Risk', data: data.map(j => j.jobs), backgroundColor: 'rgba(239,90,90,.7)', borderRadius: 4 },
      { label: 'SLA Jobs', data: data.map(j => j.sla), backgroundColor: 'rgba(245,180,0,.8)', borderRadius: 4 },
    ],
  };

  const opts = baseOpts({
    plugins: { legend: { labels: { boxWidth: 9, font: { size: 10.5 }, color: '#8b93a3' } } },
  });

  return <Bar data={chartData} options={opts} />;
}
