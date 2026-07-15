const NAV_ITEMS = [
  // { key: 'overview', label: 'Overview' },
  { key: 'demand', label: 'Demand Forecast', count: '4.1', cls: 'cnt-sky' },
  { key: 'stockout', label: 'Stockout Risk', count: '38', cls: 'cnt-red' },
  { key: 'safety', label: 'Safety Stock', count: '4.3', cls: 'cnt-sky' },
  { key: 'anomaly', label: 'Anomaly Detector', count: '12', cls: 'cnt-vio' },
  { key: 'sap', label: 'SAP PR/PO', count: '24', cls: 'cnt-amb' },
];

export default function Sidebar({ active = 'overview', onNavigate }) {
  const handleClick = key => {
    onNavigate && onNavigate(key);
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">GM</div>
        <div className="brand-text">
          <b>GMMCO Limited</b>
          <span>PARTS DEMAND AI</span>
        </div>
      </div>

      <div className="nav-label">Forecast Models</div>
      {NAV_ITEMS.map(item => (
        <div
          key={item.key}
          className={`nav-item ${active === item.key ? 'active' : ''}`}
          onClick={() => handleClick(item.key)}
        >
          <span className="dot" /> {item.label}
          {item.count && <span className={`count ${item.cls}`}>{item.count}</span>}
        </div>
      ))}

      {/* <div className="nav-label">Platform</div>
      <div
        className={`nav-item ${active === 'health' ? 'active' : ''}`}
        onClick={() => handleClick('health')}
      >
        <span className="dot" /> Model Health
      </div> */}

      <div className="sidebar-foot">
        v1.0 · Forecast run
        <br />
        2026-06-24 04:10 IST
        <br />
        <br />
        LightGBM v1.0 · 91.8% acc
        <br />
        8,420 parts · 12 branches
      </div>
    </aside>
  );
}
