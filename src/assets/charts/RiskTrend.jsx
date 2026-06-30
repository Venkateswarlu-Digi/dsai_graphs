import React from 'react';
import { Bar } from 'react-chartjs-2';
import { baseOpts } from './chartSetup';

export default function RiskTrend({ data }) {
  const chartData = {
    labels: data.map(r => r.d),
    datasets: [
      { label: 'Critical', data: data.map(r => r.cr), backgroundColor: 'rgba(239,90,90,.8)', borderRadius: 3, stack: 's' },
      { label: 'High', data: data.map(r => r.hi), backgroundColor: 'rgba(245,180,0,.8)', borderRadius: 3, stack: 's' },
      { label: 'Medium', data: data.map(r => r.md), backgroundColor: 'rgba(167,139,250,.7)', borderRadius: 3, stack: 's' },
    ],
  };

  const opts = baseOpts({
    plugins: { legend: { labels: { boxWidth: 8, font: { size: 9 }, color: '#8b93a3' } } },
  });
  opts.scales.x.stacked = true;
  opts.scales.y.stacked = true;

  return <Bar data={chartData} options={opts} />;
}
