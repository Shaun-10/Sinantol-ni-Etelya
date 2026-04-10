import { FiX } from 'react-icons/fi';
import { useState } from 'react';

const defaultFormValues = {
  lastName: '',
  firstName: '',
  middleInitial: '',
  address: '',
  contact: '',
  birthdate: '',
  plateNo: '',
  emergencyName: '',
  emergencyContact: '',
};

function toDisplayDate(value) {
  const normalized = (value || '').trim();

  if (!normalized) {
    return '';
  }

  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return normalized;
  }

  const [, year, month, day] = match;
  return `${Number(month)}/${Number(day)}/${year}`;
}

export default function AddRiderModal({ onClose, onAddRider }) {
  const [form, setForm] = useState(defaultFormValues);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (errorMessage) {
      setErrorMessage('');
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedFirstName = form.firstName.trim();
    const trimmedLastName = form.lastName.trim();
    const contactDigits = form.contact.replace(/\D/g, '');
    const emergencyContactDigits = form.emergencyContact.replace(/\D/g, '');

    if (!trimmedFirstName || !trimmedLastName) {
      setErrorMessage('First name and last name are required.');
      return;
    }

    if (form.contact.trim() && contactDigits.length !== 11) {
      setErrorMessage('Contact number must be exactly 11 digits.');
      return;
    }

    if (form.emergencyContact.trim() && emergencyContactDigits.length !== 11) {
      setErrorMessage('Emergency contact number must be exactly 11 digits.');
      return;
    }

    onAddRider({
      ...form,
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      birthdate: toDisplayDate(form.birthdate),
      contact: form.contact.trim(),
      emergencyContact: form.emergencyContact.trim(),
    });
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="add-rider-title">
      <div className="riders-modal">
        <header className="riders-modal-header">
          <h3 id="add-rider-title">Add Rider</h3>
          <button type="button" className="close-modal-btn" aria-label="Close add rider modal" onClick={onClose}>
            <FiX />
          </button>
        </header>

        <form className="riders-modal-body" onSubmit={handleSubmit}>
          {errorMessage && (
            <p className="form-error" role="alert">
              {errorMessage}
            </p>
          )}

          <section>
            <h4>Rider Information</h4>

            <div className="input-grid three">
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={form.lastName}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={form.firstName}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="middleInitial"
                placeholder="Middle Initial"
                value={form.middleInitial}
                onChange={handleChange}
              />
            </div>

            <input
              type="text"
              name="address"
              placeholder="Address"
              className="full-input"
              value={form.address}
              onChange={handleChange}
            />

            <div className="input-grid two">
              <input
                type="text"
                name="contact"
                placeholder="Contact"
                value={form.contact}
                onChange={handleChange}
                inputMode="numeric"
                maxLength={11}
              />
              <input
                type="date"
                name="birthdate"
                value={form.birthdate}
                onChange={handleChange}
              />
            </div>

            <input
              type="text"
              name="plateNo"
              placeholder="Plate No."
              className="full-input"
              value={form.plateNo}
              onChange={handleChange}
            />
          </section>

          <section>
            <h4>Emergency Contact</h4>
            <input
              type="text"
              name="emergencyName"
              placeholder="Name"
              className="full-input"
              value={form.emergencyName}
              onChange={handleChange}
            />
            <input
              type="text"
              name="emergencyContact"
              placeholder="Contact"
              className="full-input"
              value={form.emergencyContact}
              onChange={handleChange}
              inputMode="numeric"
              maxLength={11}
            />
          </section>

          <div className="modal-actions">
            <button type="submit" className="primary-action-btn">
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
