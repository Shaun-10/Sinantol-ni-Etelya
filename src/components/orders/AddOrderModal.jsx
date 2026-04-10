import { useState } from 'react';

export default function AddOrderModal({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleInitial: '',
    address: '',
    contact: '',
    assignedRider: '',
    flavor: [],
    size: [],
    orderType: 'Delivery',
    quantity: 1,
    total: 150,
  });

  const [errors, setErrors] = useState({});

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleFlavorChange = (flavor) => {
    setFormData((prev) => ({
      ...prev,
      flavor: prev.flavor.includes(flavor)
        ? prev.flavor.filter((f) => f !== flavor)
        : [...prev.flavor, flavor],
    }));
  };

  const handleSizeChange = (size) => {
    setFormData((prev) => ({
      ...prev,
      size: prev.size.includes(size)
        ? prev.size.filter((s) => s !== size)
        : [...prev.size, size],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.contact.trim()) newErrors.contact = 'Contact is required';
    if (!formData.assignedRider.trim()) newErrors.assignedRider = 'Assigned rider is required';
    if (formData.flavor.length === 0) newErrors.flavor = 'Select at least one flavor';
    if (formData.size.length === 0) newErrors.size = 'Select at least one size';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newOrder = {
      id: `#${String(Math.floor(Math.random() * 10000)).padStart(3, '0')}`,
      customer: `${formData.firstName} ${formData.lastName}`,
      firstName: formData.firstName,
      middleInitial: formData.middleInitial,
      lastName: formData.lastName,
      address: formData.address,
      contact: formData.contact,
      assignedRider: formData.assignedRider,
      flavor: formData.flavor,
      size: formData.size,
      quantity: formData.quantity,
      total: formData.total,
      daysAgo: 0,
      orderType: formData.orderType,
      status: 'Pending',
      date: new Date().toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      }),
      dateRange: 'Today',
      orderItems: formData.flavor.flatMap((flavor) =>
        formData.size.map((size) => ({
          flavor,
          size,
          quantity: formData.quantity,
        }))
      ),
    };

    onAdd(newOrder);
  };

  return (
    <div className="order-add-modal-backdrop" onClick={handleBackdropClick}>
      <div className="order-add-modal">
        <div className="order-add-modal-header">
          <h2>Add New Order</h2>
          <button
            type="button"
            className="order-add-modal-close"
            aria-label="Close modal"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="order-add-modal-form">
          <div className="order-add-modal-content">
            <section className="add-order-section">
              <h3>Customer Information</h3>

              <div className="add-order-form-row">
                <div className="add-order-form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`add-order-input ${errors.firstName ? 'error' : ''}`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && <span className="add-order-error">{errors.firstName}</span>}
                </div>

                <div className="add-order-form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`add-order-input ${errors.lastName ? 'error' : ''}`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && <span className="add-order-error">{errors.lastName}</span>}
                </div>

                <div className="add-order-form-group">
                  <label htmlFor="middleInitial">Middle Initial</label>
                  <input
                    type="text"
                    id="middleInitial"
                    name="middleInitial"
                    value={formData.middleInitial}
                    onChange={handleInputChange}
                    className="add-order-input add-order-input-small"
                    placeholder="M.I."
                    maxLength="2"
                  />
                </div>
              </div>

              <div className="add-order-form-group">
                <label htmlFor="address">Address *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`add-order-input ${errors.address ? 'error' : ''}`}
                  placeholder="Enter address"
                />
                {errors.address && <span className="add-order-error">{errors.address}</span>}
              </div>

              <div className="add-order-form-row">
                <div className="add-order-form-group">
                  <label htmlFor="contact">Contact *</label>
                  <input
                    type="text"
                    id="contact"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    className={`add-order-input ${errors.contact ? 'error' : ''}`}
                    placeholder="Enter phone number"
                  />
                  {errors.contact && <span className="add-order-error">{errors.contact}</span>}
                </div>

                <div className="add-order-form-group">
                  <label htmlFor="assignedRider">Assigned Rider *</label>
                  <input
                    type="text"
                    id="assignedRider"
                    name="assignedRider"
                    value={formData.assignedRider}
                    onChange={handleInputChange}
                    className={`add-order-input ${errors.assignedRider ? 'error' : ''}`}
                    placeholder="Enter rider name"
                  />
                  {errors.assignedRider && (
                    <span className="add-order-error">{errors.assignedRider}</span>
                  )}
                </div>
              </div>
            </section>

            <section className="add-order-section">
              <h3>Order Details</h3>

              <div className="add-order-form-group">
                <label>Flavor *</label>
                <div className="add-order-checkbox-group">
                  {['Classic', 'Spicy'].map((flavor) => (
                    <label key={flavor} className="add-order-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.flavor.includes(flavor)}
                        onChange={() => handleFlavorChange(flavor)}
                      />
                      {flavor}
                    </label>
                  ))}
                </div>
                {errors.flavor && <span className="add-order-error">{errors.flavor}</span>}
              </div>

              <div className="add-order-form-group">
                <label>Size *</label>
                <div className="add-order-checkbox-group">
                  {['Small', 'Large', 'Bottled'].map((size) => (
                    <label key={size} className="add-order-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.size.includes(size)}
                        onChange={() => handleSizeChange(size)}
                      />
                      {size}
                    </label>
                  ))}
                </div>
                {errors.size && <span className="add-order-error">{errors.size}</span>}
              </div>

              <div className="add-order-form-row">
                <div className="add-order-form-group">
                  <label htmlFor="orderType">Order Type</label>
                  <select
                    id="orderType"
                    name="orderType"
                    value={formData.orderType}
                    onChange={handleInputChange}
                    className="add-order-input"
                  >
                    <option value="Delivery">Delivery</option>
                    <option value="Walk-in">Walk-in</option>
                  </select>
                </div>

                <div className="add-order-form-group">
                  <label htmlFor="quantity">Quantity</label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="add-order-input"
                    min="1"
                  />
                </div>

                <div className="add-order-form-group">
                  <label htmlFor="total">Total</label>
                  <input
                    type="number"
                    id="total"
                    name="total"
                    value={formData.total}
                    onChange={handleInputChange}
                    className="add-order-input"
                    min="0"
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="order-add-modal-footer">
            <button type="button" className="order-add-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="order-add-btn-submit">
              Add Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
