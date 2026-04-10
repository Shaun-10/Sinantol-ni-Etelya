import SalesSummaryCards from '../components/sales/SalesSummaryCards';
import OrdersByAreaTable from '../components/sales/OrdersByAreaTable';
import MonthlySalesChart from '../components/sales/MonthlySalesChart';
import SalesFlavorPieCard from '../components/sales/SalesFlavorPieCard';
import SalesPriceListCard from '../components/sales/SalesPriceListCard';

const ordersByAreaData = [
  {
    id: 1,
    clientName: 'Bernie Benitez',
    contactNo: '09123456789',
    location: 'Mandaluyong',
    classic: 1,
    spicy: 2,
    amount: 330,
  },
  {
    id: 2,
    clientName: 'Perline Pescador',
    contactNo: '09176549832',
    location: 'Mandaluyong',
    classic: 1,
    spicy: 2,
    amount: 510,
  },
  {
    id: 3,
    clientName: 'Arlene Intia',
    contactNo: '09181234567',
    location: 'Mandaluyong',
    classic: 1,
    spicy: 1,
    amount: 320,
  },
  {
    id: 4,
    clientName: 'Bege Ribert',
    contactNo: '09192345678',
    location: 'Mandaluyong',
    classic: 9,
    spicy: 3,
    amount: 2040,
  },
  {
    id: 5,
    clientName: 'Nina Valera',
    contactNo: '09173451234',
    location: 'Quezon City',
    classic: 3,
    spicy: 2,
    amount: 890,
  },
  {
    id: 6,
    clientName: 'Jonas Castillo',
    contactNo: '09175678943',
    location: 'Pasig',
    classic: 2,
    spicy: 4,
    amount: 1120,
  },
  {
    id: 7,
    clientName: 'Mika Santos',
    contactNo: '09198765432',
    location: 'Manila',
    classic: 2,
    spicy: 1,
    amount: 620,
  },
];

const monthlySalesData = [
  { month: 'Oct', sales: 1200, orders: 5 },
  { month: 'Nov', sales: 1800, orders: 12 },
  { month: 'Dec', sales: 2600, orders: 18 },
  { month: 'Jan', sales: 3000, orders: 20 },
  { month: 'Feb', sales: 3600, orders: 25 },
  { month: 'Mar', sales: 3300, orders: 22 },
  { month: 'Apr', sales: 2800, orders: 16 },
];

export default function SalesPage() {
  return (
    <section className="sales-main-content">
      <header className="sales-header">
        <h2>Sales</h2>
      </header>

      <div className="sales-layout-grid">
        <div className="sales-left-column">
          <SalesSummaryCards />
          <OrdersByAreaTable orders={ordersByAreaData} />
          <MonthlySalesChart data={monthlySalesData} />
        </div>

        <div className="sales-right-column">
          <SalesFlavorPieCard />
          <SalesPriceListCard />
        </div>
      </div>
    </section>
  );
}
