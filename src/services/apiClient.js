import axios from 'axios';

const apiClient = axios.create({
  // Demand Forecast default: http://localhost:9090/api/v1/pdp/demand_forecast
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:9090/api/v1/pdp',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 15000),
  headers: { Accept: 'application/json' },
});

apiClient.interceptors.request.use(config => {
  const token = import.meta.env.VITE_API_TOKEN;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    const message = error.response?.data?.message
      ?? error.response?.data?.detail
      ?? (status ? `Request failed (${status})` : 'Unable to reach the API.');
    return Promise.reject(new Error(message, { cause: error }));
  },
);

export default apiClient;
