export default function ChartCard({ title, tag, height = 'normal', children }) {
  const heightClass = height === 'tall' ? 'tall' : height === 'sm' ? 'sm' : '';
  return (
    <div className="panel">
      <h3>
        {title} {tag && <span className="tag">{tag}</span>}
      </h3>
      <div className={`chart-wrap ${heightClass}`}>{children}</div>
    </div>
  );
}
