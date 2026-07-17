import InfoTooltip from './InfoTooltip';

export default function SectionTitle({ children, tag, tooltip }) {
  return (
    <h3>
      <span className="panel-heading-with-tooltip">
        {children}
        <InfoTooltip text={tooltip} />
      </span>
      {tag && <span className="tag">{tag}</span>}
    </h3>
  );
}
