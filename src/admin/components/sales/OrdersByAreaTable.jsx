import { useMemo, useState } from 'react';

const areaOptions = ['All Areas', 'Mandaluyong', 'Quezon City', 'Pasig', 'Manila'];

const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export default function OrdersByAreaTable({ orders }) {
  const [selectedArea, setSelectedArea] = useState('All Areas');

  const filteredOrders = useMemo(() => {
    if (selectedArea === 'All Areas') {
      return orders;
    }

    return orders.filter((order) => order.location === selectedArea);
  }, [orders, selectedArea]);

  return (
    <section className="sales-panel" aria-label="Orders by area">
      <div className="sales-panel-header">
        <h3>Orders by Area</h3>

        <label className="sales-area-filter" htmlFor="sales-area-select">
          <span>Filter by:</span>
          <select
            id="sales-area-select"
            value={selectedArea}
            onChange={(event) => setSelectedArea(event.target.value)}
          >
            {areaOptions.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="sales-table-wrap">
        <table className="sales-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Client Name</th>
              <th>Contact No.</th>
              <th>Location</th>
              <th>Classic</th>
              <th>Spicy</th>
              <th>Amount</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.clientName}</td>
                <td>{order.contactNo}</td>
                <td>{order.location}</td>
                <td>{order.classic}</td>
                <td>{order.spicy}</td>
                <td>{pesoFormatter.format(order.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
