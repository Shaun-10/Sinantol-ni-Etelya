import { FiBell, FiClock, FiMapPin, FiPackage, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import RiderBottomNav from '../components/RiderBottomNav';

const stats = [
  { icon: FiPackage, value: 25, label: 'Total Today' },
  { icon: FiClock, value: 5, label: 'Pending' },
  { icon: FiUser, value: 100, label: 'Completed' },
  { icon: FiMapPin, value: 26, label: 'COD Collected' },
];

const activeOrders = [
  { id: '#1', customer: 'Ali Mae', address: '21 Malboni St. Fairview, Quezon City', amount: 'COD  P290' },
  { id: '#2', customer: 'Raiza Mae', address: '21 Malboni St. Fairview, Quezon City', amount: 'COD  P290' },
  { id: '#3', customer: 'Hanna Mae', address: '21 Malboni St. Fairview, Quezon City', amount: 'COD  P200' },
];

export default function RiderHomePage() {
  const navigate = useNavigate();

  return (
    <div className="rider-inside-page">
      <div className="rider-mobile-shell">
        <header className="rider-dashboard-head">
          <div className="dashboard-toolbar">
            <img src="/images/logo_delivery.png" alt="Sinantol ni Etelya Riders" className="mini-logo" />
            <div className="toolbar-right">
              <button type="button" className="ghost-icon-btn"><FiBell /></button>
              <div className="rider-mini-chip"><FiUser /> Rider</div>
            </div>
          </div>
        </header>

        <main className="rider-page-content">
          <p className="morning-text">Good day,</p>
          <h2 className="rider-name-main">Rider John</h2>

          <section className="stats-grid">
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.label} className="stats-card">
                  <Icon aria-hidden="true" />
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </article>
              );
            })}
          </section>

          <button type="button" className="route-btn" onClick={() => navigate('/rider/deliveries')}>
            Start Route - 1 stops
          </button>

          <section className="deliveries-home-block">
            <div className="section-head-line">
              <h3>Active Deliveries</h3>
              <button type="button" onClick={() => navigate('/rider/deliveries')}>View all</button>
            </div>

            <div className="list-stack">
              {activeOrders.map((order) => (
                <button key={order.id} type="button" className="delivery-item-home" onClick={() => navigate('/rider/deliveries/details')}>
                  <span className="order-badge">{order.id}</span>
                  <div className="order-home-main">
                    <h4>{order.customer}</h4>
                    <p><FiMapPin /> {order.address}</p>
                  </div>
                  <div className="order-home-pills">
                    <span className="pill yellow">In Progress</span>
                    <span className="pill green">{order.amount}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </main>

        <RiderBottomNav />
      </div>
    </div>
  );
}
