import { useCallback, useEffect, useState } from 'react';
import { getDashboardData } from '../services/dashboardApi';

/** Fetches one dashboard model and retains the supplied JSON while a request fails. */
export default function useDashboardData(page, fallbackData, days = 30) {
  const [data, setData] = useState(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextData = await getDashboardData(page, { days });
      setData(nextData);
    } catch (requestError) {
      if (requestError.name !== 'CanceledError' && requestError.code !== 'ERR_CANCELED') {
        setError(requestError.message);
      }
    } finally {
      setLoading(false);
    }
  }, [page, days]);

  useEffect(() => {
    let cancelled = false;

    getDashboardData(page, { days })
      .then(nextData => { if (!cancelled) setData(nextData); })
      .catch(requestError => {
        if (!cancelled && requestError.code !== 'ERR_CANCELED') setError(requestError.message);
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [page, days]);

  return { data, loading, error, reload };
}
