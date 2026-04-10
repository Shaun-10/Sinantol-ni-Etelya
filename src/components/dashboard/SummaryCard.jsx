export default function SummaryCard({ icon: Icon, value, label }) {
  return (
    <article className="summary-card">
      <div className="summary-icon-wrap" aria-hidden="true">
        <Icon />
      </div>
      <div>
        <p className="summary-value">{value}</p>
        <p className="summary-label">{label}</p>
      </div>
    </article>
  );
}
