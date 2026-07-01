export default function PriorityActions({ items = [] }) {
  return (
    <div>
      {items.map((a, i) => (
        <div className="alert-row" key={i}>
          <div className={`al-sev ${a.sev}`} />
          <div className="al-body">
            <div className="al-title">{a.title}</div>
            <div className="al-sub">{a.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
