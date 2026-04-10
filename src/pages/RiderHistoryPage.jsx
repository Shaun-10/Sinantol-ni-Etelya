import { FiChevronRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import RiderAppLayout from '../components/rider/RiderAppLayout';

const historyItems = [
  { id: 'DEL-002', customer: 'Maria Santos', address: '123 Rizal Ave, Brgy. San Jose, Quezon City', amount: 'P450', status: 'Delivered', meta: '01:45 PM • COD' },
  { id: 'DEL-001', customer: 'Juan Dela Cruz', address: '456 Bonifacio St., Poblacion, Makati', amount: 'P370', status: 'Failed', meta: '01:45 PM • Online' },
  { id: 'DEL-003', customer: 'Ana Reyes', address: '789 Mabini Blvd, Brgy. Ermita, Manila', amount: 'P500', status: 'Delivered', meta: '01:57 PM • COD' },
  { id: 'DEL-000', customer: 'Pedro Garcia', address: '321 Roxas Blvd, Brgy. Malate, Manila', amount: 'P220', status: 'Delivered', meta: '02:15 PM • COD' },
  { id: 'DEL-104', customer: 'Rosa Mendoza', address: '654 Taft Ave., Brgy. San Andres, Manila', amount: 'P550', status: 'Delivered', meta: '01:42 PM • COD' },
];

export default function RiderHistoryPage() {
  const navigate = useNavigate();

  return (
    <RiderAppLayout showBack backTo="/rider/home">
      <article className="totals-card">
        <div>
          <p>Total COD Collected</p>
          <strong>P960</strong>
        </div>
        <div className="totals-right">
          <span>Deliveries</span>
          <strong>6</strong>
        </div>
      </article>

      <div className="list-stack">
        {historyItems.map((item) => (
          <button key={item.id} type="button" className="history-row rich" onClick={() => navigate('/rider/history/details')}>
            <div className="history-main">
              <div className="history-topline">
                <h4>{item.customer}</h4>
                <strong className="history-amount">{item.amount}</strong>
              </div>
              <p>{item.address}</p>
              <div className="status-line">
                <span className={`pill-dot ${item.status === 'Delivered' ? 'ok' : 'bad'}`}>{item.status}</span>
                <span>{item.meta}</span>
              </div>
            </div>
            <FiChevronRight />
          </button>
        ))}
      </div>
    </RiderAppLayout>
  );
}
