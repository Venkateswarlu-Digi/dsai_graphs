import { Chart as ChartJS, registerables } from 'chart.js';
ChartJS.register(...registerables);

export const CHART_COLORS = Object.freeze({
  primary: '#12BE83',
  secondary: '#5B8FF9',
  accent: '#8B5CF6',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
  neutral: '#94A3B8',
  light: '#E5E7EB',
  label: '#374151',
  axis: '#D1D5DB',
});

export const CHART_PALETTE = Object.freeze([
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.accent,
  CHART_COLORS.warning,
  CHART_COLORS.info,
  CHART_COLORS.danger,
  CHART_COLORS.neutral,
]);

const baseLegend = {
  labels: {
    boxWidth: 9,
    boxHeight: 9,
    usePointStyle: true,
    pointStyle: 'circle',
    padding: 14,
    color: CHART_COLORS.label,
    font: { size: 10.5, family: 'Inter, sans-serif', weight: 500 },
  },
};

const baseTooltip = {
  backgroundColor: '#FFFFFF',
  titleColor: '#111827',
  bodyColor: CHART_COLORS.label,
  borderColor: CHART_COLORS.light,
  borderWidth: 1,
  cornerRadius: 8,
  padding: 10,
  boxPadding: 4,
  usePointStyle: true,
  titleFont: { family: 'Inter, sans-serif', size: 11, weight: 600 },
  bodyFont: { family: 'Inter, sans-serif', size: 10.5 },
};

const axis = {
  border: { color: CHART_COLORS.axis },
  grid: { color: CHART_COLORS.light, drawTicks: false },
  ticks: {
    color: CHART_COLORS.label,
    padding: 8,
    font: { size: 10, family: 'Inter, sans-serif' },
  },
};

export const baseOpts = (extra = {}) => {
  const extraPlugins = extra.plugins ?? {};
  const extraScales = extra.scales ?? {};

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'nearest' },
    ...extra,
    plugins: {
      legend: {
        ...baseLegend,
        ...extraPlugins.legend,
        labels: {
          ...baseLegend.labels,
          ...extraPlugins.legend?.labels,
        },
      },
      tooltip: {
        ...baseTooltip,
        ...extraPlugins.tooltip,
      },
      ...extraPlugins,
    },
    scales: {
      x: {
        ...axis,
        ...extraScales.x,
        border: { ...axis.border, ...extraScales.x?.border },
        grid: { ...axis.grid, ...extraScales.x?.grid },
        ticks: { ...axis.ticks, ...extraScales.x?.ticks },
      },
      y: {
        ...axis,
        ...extraScales.y,
        border: { ...axis.border, ...extraScales.y?.border },
        grid: { ...axis.grid, ...extraScales.y?.grid },
        ticks: { ...axis.ticks, ...extraScales.y?.ticks },
      },
      ...extraScales,
    },
  };
};

export default ChartJS;
