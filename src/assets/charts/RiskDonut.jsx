import React from 'react';
import { Doughnut } from 'react-chartjs-2';

export default function RiskDonut({ labels, data }) {
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: [
          'rgba(239,90,90,.85)',
          'rgba(245,180,0,.85)',
          'rgba(167,139,250,.8)',
          'rgba(52,214,184,.3)',
        ],
        borderColor: '#171c24',
        borderWidth: 2,
        hoverOffset: 4,
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
        labels: { boxWidth: 9, font: { size: 9.5 }, color: '#8b93a3' },
      },
    },
  };

  return <Doughnut data={chartData} options={options} />;
}
