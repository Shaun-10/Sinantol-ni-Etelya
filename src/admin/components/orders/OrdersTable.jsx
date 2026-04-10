import { useState } from 'react';

function StatusBadge({ status }) {
  const statusClassName = {
    Pending: 'pending',
    Completed: 'completed',
  }[status];

  return <span className={`order-status-badge ${statusClassName}`}>{status}</span>;
}

export default function OrdersTable({
  orders,
  selectedFlavors,
  selectedSizes,
  selectedDate,
  selectedOrderType,
  onFlavorToggle,
  onClearFlavors,
  onSizeToggle,
  onClearSizes,
  onDateChange,
  onOrderTypeChange,
  dateOptions,
  onOpenDetailsModal,
}) {
  const [isFlavorMenuOpen, setIsFlavorMenuOpen] = useState(false);
  const [isSizeMenuOpen, setIsSizeMenuOpen] = useState(false);

  const flavorLabel =
    selectedFlavors.length === 0 ? 'All' : [...selectedFlavors].sort().join(', ');
  const sizeLabel = selectedSizes.length === 0 ? 'All' : [...selectedSizes].sort().join(', ');

  return (
    <section className="orders-list-panel" aria-label="Orders list">
      <div className="orders-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>
                <div className="orders-filter-header">
                  <span>Flavor</span>
                  <div className="orders-flavor-filter">
                    <button
                      type="button"
                      className="orders-header-select orders-header-filter-btn"
                      aria-label="Filter orders by flavor"
                      onClick={() => setIsFlavorMenuOpen((current) => !current)}
                    >
                      {flavorLabel}
                    </button>
                    {isFlavorMenuOpen && (
                      <div className="orders-flavor-menu" role="menu" aria-label="Flavor choices">
                        <label className="orders-flavor-option">
                          <input
                            type="checkbox"
                            checked={selectedFlavors.includes('Spicy')}
                            onChange={() => onFlavorToggle('Spicy')}
                          />
                          <span>Spicy</span>
                        </label>
                        <label className="orders-flavor-option">
                          <input
                            type="checkbox"
                            checked={selectedFlavors.includes('Classic')}
                            onChange={() => onFlavorToggle('Classic')}
                          />
                          <span>Classic</span>
                        </label>
                        <button
                          type="button"
                          className="orders-flavor-clear"
                          onClick={() => {
                            onClearFlavors();
                            setIsFlavorMenuOpen(false);
                          }}
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </th>
              <th>
                <div className="orders-filter-header">
                  <span>Size</span>
                  <div className="orders-size-filter">
                    <button
                      type="button"
                      className="orders-header-select orders-header-filter-btn"
                      aria-label="Filter orders by size"
                      onClick={() => setIsSizeMenuOpen((current) => !current)}
                    >
                      {sizeLabel}
                    </button>
                    {isSizeMenuOpen && (
                      <div className="orders-size-menu" role="menu" aria-label="Size choices">
                        <label className="orders-size-option">
                          <input
                            type="checkbox"
                            checked={selectedSizes.includes('Small')}
                            onChange={() => onSizeToggle('Small')}
                          />
                          <span>Small</span>
                        </label>
                        <label className="orders-size-option">
                          <input
                            type="checkbox"
                            checked={selectedSizes.includes('Large')}
                            onChange={() => onSizeToggle('Large')}
                          />
                          <span>Large</span>
                        </label>
                        <label className="orders-size-option">
                          <input
                            type="checkbox"
                            checked={selectedSizes.includes('Bottled')}
                            onChange={() => onSizeToggle('Bottled')}
                          />
                          <span>Bottled</span>
                        </label>
                        <button
                          type="button"
                          className="orders-size-clear"
                          onClick={() => {
                            onClearSizes();
                            setIsSizeMenuOpen(false);
                          }}
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </th>
              <th>Quantity</th>
              <th>Total</th>
              <th>
                <div className="orders-filter-header">
                  <span>Date</span>
                  <select
                    className="orders-header-select"
                    aria-label="Filter orders by date range"
                    value={selectedDate}
                    onChange={(event) => onDateChange(event.target.value)}
                  >
                    <option value="All">All</option>
                    {dateOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </th>
              <th>
                <div className="orders-filter-header">
                  <span>Order Type</span>
                  <select
                    className="orders-header-select orders-header-select-long"
                    aria-label="Filter orders by order type"
                    value={selectedOrderType}
                    onChange={(event) => onOrderTypeChange(event.target.value)}
                  >
                    <option value="All">All</option>
                    <option value="Delivery">Delivery</option>
                    <option value="Walk-in">Walk-in</option>
                  </select>
                </div>
              </th>
              <th>Details</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.flavor.join(', ')}</td>
                <td>{order.size.join(', ')}</td>
                <td>{order.quantity}</td>
                <td>{order.total}</td>
                <td>{order.date}</td>
                <td>{order.orderType}</td>
                <td>
                  <button
                    type="button"
                    className="orders-details-btn"
                    onClick={() => onOpenDetailsModal(order)}
                  >
                    Details
                  </button>
                </td>
                <td>
                  <StatusBadge status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="orders-list-footer">
        <button type="button" className="orders-next-btn">
          Next &gt;
        </button>
      </div>
    </section>
  );
}
