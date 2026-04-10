import { FiCheck, FiX } from 'react-icons/fi';

const presentDeliveries = [{ id: '0156', status: 'Delivered' }];

const pastDeliveries = [
  { id: '096', status: 'Delivered' },
  { id: '088', status: 'Delivered' },
  { id: '04', status: 'Delivered' },
];

function DeliveryRow({ delivery }) {
  return (
    <article className="delivery-row">
      <div className="delivery-left">
        <span className="delivery-check" aria-hidden="true">
          <FiCheck />
        </span>
        <p>Delivery #{delivery.id}</p>
      </div>
      <p className="delivery-status">{delivery.status}</p>
    </article>
  );
}

export default function RiderDeliveriesModal({ onClose }) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="rider-deliveries-title">
      <div className="riders-modal deliveries-modal">
        <header className="riders-modal-header">
          <h3 id="rider-deliveries-title">Rider Deliveries</h3>
          <button type="button" className="close-modal-btn" aria-label="Close rider deliveries" onClick={onClose}>
            <FiX />
          </button>
        </header>

        <div className="riders-modal-body deliveries-body">
          <section>
            <h4>Present Deliveries</h4>
            {presentDeliveries.map((delivery) => (
              <DeliveryRow key={delivery.id} delivery={delivery} />
            ))}
          </section>

          <section>
            <h4>Past Deliveries</h4>
            {pastDeliveries.map((delivery) => (
              <DeliveryRow key={delivery.id} delivery={delivery} />
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
