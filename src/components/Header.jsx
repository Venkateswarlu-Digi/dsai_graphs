export default function Header({ title, subtitle, onTitleClick }) {
  return (
    <div className="topbar">
      <div
        className={onTitleClick ? 'title-link' : ''}
        onClick={onTitleClick}
        title={onTitleClick ? 'Back to overview' : undefined}
      >
        <h1>{title}</h1>
        <div className="sub">{subtitle}</div>
      </div>
      <div className="right">
        <select className="filter" defaultValue="60">
          <option value="30">Next 30 days</option>
          <option value="60">Next 60 days</option>
          <option value="90">Next 90 days</option>
        </select>
        <select className="filter" defaultValue="ALL">
          <option value="ALL">All branches</option>
          <option>Bangalore</option>
          <option>Hyderabad</option>
          <option>Chennai</option>
          <option>Delhi</option>
          <option>Mumbai</option>
        </select>
        <select className="filter" defaultValue="ALL">
          <option value="ALL">All categories</option>
          <option>Undercarriage</option>
          <option>Hydraulics</option>
          <option>Engine</option>
          <option>Filters</option>
          <option>Transmission</option>
          <option>Brakes</option>
        </select>
        <div className="pill warn">🌧 Monsoon +30%</div>
        <div className="pill live">Live · run_2026-06-24</div>
      </div>
    </div>
  );
}
