import apiClient from './apiClient';

export const dashboardEndpoints = {
  demand: import.meta.env.VITE_DEMAND_FORECAST_ENDPOINT ?? '/demand_forecast',
  anomaly: import.meta.env.VITE_ANOMALY_DETECTOR_ENDPOINT ?? '/anomaly_detector',
  safety: import.meta.env.VITE_SAFETY_STOCK_ENDPOINT ?? '/safety_stock',
  sap: import.meta.env.VITE_SAP_PR_PO_ENDPOINT ?? '/sap_pr_po',
  stockout: import.meta.env.VITE_STOCKOUT_RISK_ENDPOINT ?? '/stockout_risk',
};

const movementClasses = {
  0: 'FAST',
  1: 'MEDIUM',
  2: 'SLOW',
  3: 'DEAD',
  FAST: 'FAST',
  MEDIUM: 'MEDIUM',
  SLOW: 'SLOW',
  DEAD: 'DEAD',
};

const normalizeMovementClass = value => movementClasses[String(value).toUpperCase()] ?? String(value);

// The live demand API encodes movement classes as 0–3, while the existing UI
// renders named classes (FAST, MEDIUM, SLOW, DEAD) for its labels and styles.
function normalizeDemandForecast(data) {
  if (!data?.forecast_table || !data?.graph_data) return data;

  const forecast_table = Object.fromEntries(
    Object.entries(data.forecast_table).map(([risk, rows]) => [
      risk,
      Array.isArray(rows)
        ? rows.map(row => ({ ...row, movement_class: normalizeMovementClass(row.movement_class) }))
        : rows,
    ]),
  );

  const movement_class_donut = (data.graph_data.movement_class_donut ?? []).map(item => ({
    ...item,
    label: normalizeMovementClass(item.label),
  }));

  return {
    ...data,
    forecast_table,
    graph_data: { ...data.graph_data, movement_class_donut },
  };
}

// Supports both { result: ... } and { data: { result: ... } } backend responses.
function unwrapDashboardPayload(payload) {
  return payload?.result ?? payload?.data?.result ?? payload?.data ?? payload;
}

export async function getDashboardData(page, options = {}) {
  const response = await apiClient.get(dashboardEndpoints[page], options);
  const payload = unwrapDashboardPayload(response.data);
  return page === 'demand' ? normalizeDemandForecast(payload) : payload;
}
