import { FiBarChart2, FiCheckSquare, FiDollarSign, FiMapPin, FiPackage, FiTruck } from 'react-icons/fi';
import SummaryCard from '../components/dashboard/SummaryCard';
import DashboardCharts from '../components/dashboard/DashboardCharts';

const summaryItems = [
  {
    icon: FiCheckSquare,
    value: '99/786',
    label: 'Delivered/ Total Orders',
  },
  {
    icon: FiTruck,
    value: '10',
    label: 'Active Riders',
  },
  {
    icon: FiMapPin,
    value: '24',
    label: 'Assigned Deliveries',
  },
];

const salesSummaryItems = [
  {
    icon: FiPackage,
    value: '₱ 12,000',
    label: 'Total Collection',
  },
  {
    icon: FiTruck,
    value: '₱ 2,550',
    label: 'Collected Delivery Fee',
  },
  {
    icon: FiDollarSign,
    value: '₱ 2,550',
    label: "Rider's Fee",
  },
  {
    icon: FiBarChart2,
    value: '₱ 1,250',
    label: 'Total Per Tub Commision',
  },
  {
    icon: FiCheckSquare,
    value: '₱ 8,420',
    label: 'Total Remittance',
  },
];

export default function Dashboard() {
  return (
    <section className="dashboard-overview-content">
      <section className="dashboard-section-block">
        <h3 className="dashboard-section-title">Today&apos;s Summary</h3>
        <div className="summary-grid">
          {summaryItems.map((item) => (
            <SummaryCard key={item.label} icon={item.icon} value={item.value} label={item.label} />
          ))}
        </div>
      </section>

      <section className="dashboard-section-block">
        <h3 className="dashboard-section-title">Sales Summary</h3>
        <div className="dashboard-sales-grid">
          {salesSummaryItems.map((item) => {
            const CardIcon = item.icon;

            return (
              <article className="dashboard-sales-card" key={item.label}>
                <span className="dashboard-sales-icon" aria-hidden="true">
                  <CardIcon />
                </span>
                <div>
                  <p className="dashboard-sales-label">{item.label}</p>
                  <p className="dashboard-sales-value">{item.value}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="dashboard-section-block">
        <h3 className="dashboard-section-title">Monthly Sales</h3>
        <div className="dashboard-monthly-panel">
          <DashboardCharts />
        </div>
      </section>
    </section>
  );
}
