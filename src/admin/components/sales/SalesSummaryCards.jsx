import { FiCalendar, FiShoppingCart } from 'react-icons/fi';

const summaryCards = [
  {
    id: 'today',
    title: 'Total Sales',
    subtitle: '(Today)',
    amount: '₱ 8,390',
    icon: FiShoppingCart,
  },
  {
    id: 'month',
    title: 'Total Sales',
    subtitle: '(This Month)',
    amount: '₱ 35,390',
    icon: FiCalendar,
  },
];

export default function SalesSummaryCards() {
  return (
    <section className="sales-summary-grid" aria-label="Sales summary cards">
      {summaryCards.map((card) => {
        const CardIcon = card.icon;

        return (
          <article key={card.id} className="sales-summary-card">
            <div className="sales-summary-card-top">
              <span className="sales-summary-icon" aria-hidden="true">
                <CardIcon />
              </span>

              <div>
                <p className="sales-summary-title">{card.title}</p>
                <p className="sales-summary-subtitle">{card.subtitle}</p>
              </div>
            </div>

            <p className="sales-summary-amount">{card.amount}</p>
          </article>
        );
      })}
    </section>
  );
}
