import { useState } from 'react';

function groupOrderItems(items) {
  const grouped = {};

  items.forEach((item) => {
    if (!grouped[item.flavor]) {
      grouped[item.flavor] = [];
    }
    grouped[item.flavor].push(item);
  });

  return grouped;
}

export default function OrderDetailsModal({ order, onClose, onEdit, onDelete }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: order.firstName,
    lastName: order.lastName,
    middleInitial: order.middleInitial,
    address: order.address,
    contact: order.contact,
    assignedRider: order.assignedRider,
  });

  const groupedItems = groupOrderItems(order.orderItems);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      if (!isEditMode) {
        onClose();
      }
    }
  };

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleSaveClick = () => {
    if (onEdit) {
      onEdit({
        ...order,
        ...formData,
      });
    }
    setIsEditMode(false);
  };

  const handleCancelClick = () => {
    setFormData({
      firstName: order.firstName,
      lastName: order.lastName,
      middleInitial: order.middleInitial,
      address: order.address,
      contact: order.contact,
      assignedRider: order.assignedRider,
    });
    setIsEditMode(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeleteClick = () => {
    if (onDelete) {
      const confirmed = window.confirm(`Are you sure you want to delete order ${order.id}?`);
      if (confirmed) {
        onDelete(order.id);
        onClose();
      }
    } else {
      console.log('Delete clicked for order:', order.id);
    }
  };

  return (
    <div className="order-details-modal-backdrop" onClick={handleBackdropClick}>
      <div className="order-details-modal">
        <div className="order-details-modal-header">
          <h2>{isEditMode ? 'Edit Customer Details' : 'Customer Details'}</h2>
          <button
            type="button"
            className="order-details-modal-close"
            aria-label="Close modal"
            onClick={onClose}
            disabled={isEditMode}
          >
            ✕
          </button>
        </div>

        <div className="order-details-modal-content">
          <section className="order-customer-info">
            <div className="order-info-row">
              <label>Full Name :</label>
              {isEditMode ? (
                <div className="order-edit-flex">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                    className="order-edit-input"
                  />
                  <span className="order-edit-separator">,</span>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    className="order-edit-input"
                  />
                  <input
                    type="text"
                    name="middleInitial"
                    value={formData.middleInitial}
                    onChange={handleInputChange}
                    placeholder="M.I."
                    className="order-edit-input order-edit-input-small"
                  />
                </div>
              ) : (
                <span className="order-info-value">
                  {formData.lastName}, {formData.firstName} {formData.middleInitial}
                </span>
              )}
            </div>
            <div className="order-info-row">
              <label>Address :</label>
              {isEditMode ? (
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="order-edit-input"
                />
              ) : (
                <span className="order-info-value">{formData.address}</span>
              )}
            </div>
            <div className="order-info-row">
              <label>Contact :</label>
              {isEditMode ? (
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  className="order-edit-input"
                />
              ) : (
                <span className="order-info-value">{formData.contact}</span>
              )}
            </div>
            <div className="order-info-row">
              <label>Assigned Rider :</label>
              {isEditMode ? (
                <input
                  type="text"
                  name="assignedRider"
                  value={formData.assignedRider}
                  onChange={handleInputChange}
                  className="order-edit-input"
                />
              ) : (
                <span className="order-info-value">{formData.assignedRider}</span>
              )}
            </div>
          </section>

          <section className="order-order-details">
            <h3>Order Details</h3>
            <table className="order-details-table">
              <thead>
                <tr>
                  <th>Flavor</th>
                  <th>Size</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedItems).map(([flavor, items]) =>
                  items.map((item, index) => (
                    <tr key={`${flavor}-${index}`}>
                      {index === 0 && (
                        <td className="order-details-flavor-cell" rowSpan={items.length}>
                          {flavor}
                        </td>
                      )}
                      <td>{item.size}</td>
                      <td>{item.quantity}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>

          <div className="order-total-section">
            <span className="order-total-label">Total:</span>
            <span className="order-total-amount">{order.total}</span>
          </div>
        </div>

        <div className="order-details-modal-footer">
          {isEditMode ? (
            <>
              <button
                type="button"
                className="order-details-btn-edit"
                onClick={handleSaveClick}
              >
                Save
              </button>
              <button
                type="button"
                className="order-details-btn-cancel"
                onClick={handleCancelClick}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="order-details-btn-edit"
                onClick={handleEditClick}
              >
                Edit
              </button>
              <button
                type="button"
                className="order-details-btn-delete"
                onClick={handleDeleteClick}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
