export default function NetworkStatus({ loading, error, onRetry }) {
  if (loading && !error) return <div className="api-status">Refreshing dashboard data…</div>;
  if (!error) return null;

  return (
    <div className="api-status api-status-error" role="alert">
      API unavailable: {error} Showing the bundled dashboard data.
      <button type="button" className="table-action muted" onClick={onRetry}>Retry</button>
    </div>
  );
}
