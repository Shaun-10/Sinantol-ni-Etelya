function formatOrderId(value) {
  return String(value).padStart(2, '0');
}

export default function RidersTable({ riders, onViewDetails }) {
  const totalRows = 13;
  const placeholderRows = Math.max(0, totalRows - riders.length);

  return (
    <section className="riders-list-panel">
      <h3>Riders List</h3>

      <div className="riders-table-wrap">
        <table>
          <thead>
            <tr>
              <th>OrderID</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {riders.map((rider) => (
              <tr key={rider.orderId}>
                <td>{formatOrderId(rider.orderId)}</td>
                <td>{rider.name}</td>
                <td>{rider.contact}</td>
                <td>{rider.status}</td>
                <td>
                  <div className="row-actions">
                    <button
                      type="button"
                      className="action-btn details"
                      aria-label={`View details for ${rider.name}`}
                      onClick={() => onViewDetails(rider)}
                    >
                      Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {Array.from({ length: placeholderRows }).map((_, index) => {
              const orderNumber = riders.length + index + 1;

              return (
                <tr key={`placeholder-${orderNumber}`}>
                  <td>{formatOrderId(orderNumber)}</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="riders-list-footer">
        <button type="button" className="next-btn">
          {'Next >'}
        </button>
      </div>
    </section>
  );
}
