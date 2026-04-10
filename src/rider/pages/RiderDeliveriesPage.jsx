import { FiChevronRight, FiNavigation, FiPhone } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import RiderAppLayout from '../components/RiderAppLayout';

const activeDelivery = {
  id: 'DEL-003',
  customer: 'Ana Reyes',
  address: '789 Mabini Blvd, Brgy. Ermita, Manila',
  distance: '0.8 km',
  eta: 'ETA 3 min',
  amount: 'COD P290',
};

const completedDeliveries = [
  { id: 'DEL-002', customer: 'Maria Santos', status: 'Delivered', time: '01:45 PM' },
  { id: 'DEL-001', customer: 'Juan Dela Cruz', status: 'Failed', time: '01:45 AM' },
  { id: 'DEL-000', customer: 'Pedro Garcia', status: 'Delivered', time: '02:15 PM' },
  { id: 'DEL-104', customer: 'Rosa Mendoza', status: 'Delivered', time: '01:42 PM' },
  { id: 'DEL-103', customer: 'Carlo Tan', status: 'Failed', time: '12:30 PM' },
];

export default function RiderDeliveriesPage() {
  const navigate = useNavigate();

  return (
    <RiderAppLayout>
      <section className="rider-block">
        <h2>Deliveries</h2>

        <article className="next-stop-card" role="button" tabIndex={0} onClick={() => navigate('/rider/deliveries/details')}>
          <p className="next-stop-label">NEXT BEST STOP - {activeDelivery.distance}</p>
          <h3>{activeDelivery.customer}</h3>
          <p>{activeDelivery.address}</p>
          <div className="pill-row">
            <span className="pill yellow">In Progress</span>
            <span className="pill green">{activeDelivery.amount}</span>
            <span className="muted-inline">{activeDelivery.eta}</span>
          </div>
        </article>

        <div className="section-title">ACTIVE (1)</div>
        <article className="compact-order-card">
          <div>
            <h4>{activeDelivery.customer}</h4>
            <p>2</p>
            <p>{activeDelivery.address}</p>
            <div className="pill-row">
              <span className="pill yellow">In Progress</span>
              <span className="pill green">{activeDelivery.amount}</span>
            </div>
          </div>
          <div className="order-actions-side">
            <span className="muted-inline">{activeDelivery.distance}</span>
            <button type="button" className="icon-circle-btn" onClick={() => navigate('/rider/deliveries/details')}>
              <FiPhone />
            </button>
          </div>
        </article>

        <div className="section-title">COMPLETED (5)</div>
        <div className="list-stack">
          {completedDeliveries.map((item) => (
            <button key={item.id} type="button" className="history-row" onClick={() => navigate('/rider/history/details')}>
              <div className="history-main">
                <h4>{item.customer}</h4>
                <div className="status-line">
                  <span className={`pill-dot ${item.status === 'Delivered' ? 'ok' : 'bad'}`}>{item.status}</span>
                  <span>{item.time}</span>
                </div>
              </div>
              <FiChevronRight />
            </button>
          ))}
        </div>
      </section>
    </RiderAppLayout>
  );
}

