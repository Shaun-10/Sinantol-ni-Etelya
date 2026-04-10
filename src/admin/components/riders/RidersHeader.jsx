import { FiPlus, FiTruck } from 'react-icons/fi';

export default function RidersHeader({ onAddRider, activeCount = 7, totalCount = 10 }) {
  return (
    <section className="riders-header">
      <div className="riders-header-top">
        <h2>
          <FiTruck aria-hidden="true" />
          RIDERS
        </h2>
      </div>

      <div className="riders-header-bottom">
        <article className="riders-summary-card" aria-label="Active and total riders summary">
          <div className="riders-summary-icon" aria-hidden="true">
            <FiTruck />
          </div>
          <div>
            <p className="riders-summary-value">{activeCount}/{totalCount}</p>
            <p className="riders-summary-label">Active/Total Riders</p>
          </div>
        </article>

        <button type="button" className="add-rider-btn" onClick={onAddRider}>
          <FiPlus />
          Add Rider
        </button>
      </div>
    </section>
  );
}
