import React from 'react';
import { Line } from 'react-chartjs-2';
import { baseOpts } from './chartSetup';

export default function DemandTrend({ data }) {
  const actual = data.datasets.find(d => d.label === 'Actual');
  const forecast = data.datasets.find(d => d.label === 'Forecast');

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Actual',
        data: actual?.data ?? [],
        borderColor: '#34d6b8',
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.35,
        spanGaps: true,
      },
      {
        label: 'Forecast',
        data: forecast?.data ?? [],
        borderColor: '#f5b400',
        borderWidth: 2,
        borderDash: [4, 4],
        pointRadius: 2,
        tension: 0.35,
      },
    ],
  };

  return <Line data={chartData} options={baseOpts()} />;
}
