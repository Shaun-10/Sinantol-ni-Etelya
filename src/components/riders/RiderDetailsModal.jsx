import { useEffect, useState } from 'react';
import { FiX, FiCalendar, FiEdit2, FiTrash2 } from 'react-icons/fi';

function toDateInputValue(value) {
  const normalized = (value || '').trim();

  if (!normalized || normalized.toUpperCase() === 'N/A') {
    return '';
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalized;
  }

  const match = normalized.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) {
    return '';
  }

  const [, month, day, year] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function toDisplayDate(value) {
  const normalized = (value || '').trim();

  if (!normalized) {
    return 'N/A';
  }

  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return normalized;
  }

  const [, year, month, day] = match;
  return `${Number(month)}/${Number(day)}/${year}`;
}

function buildFormData(rider) {
  return {
    lastName: rider.lastName || '',
    firstName: rider.firstName || '',
    middleInitial: rider.middleInitial || '',
    address: rider.address || '',
    contact: rider.contact || '',
    birthdate: toDateInputValue(rider.birthdate),
    plateNo: rider.plateNo || '',
    emergencyName: rider.emergencyName || '',
    emergencyContact: rider.emergencyContact || '',
  };
}

export default function RiderDetailsModal({
  rider,
  onClose,
  onOpenDeliveries,
  onSaveRider,
  onDeleteRider,
}) {
  if (!rider) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(buildFormData(rider));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setForm(buildFormData(rider));
    setIsEditing(false);
    setErrors({});
    setFormError('');
  }, [rider]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    if (formError) {
      setFormError('');
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.lastName.trim()) {
      nextErrors.lastName = 'Last name is required.';
    }

    if (!form.firstName.trim()) {
      nextErrors.firstName = 'First name is required.';
    }

    const middleInitial = form.middleInitial.trim();
    if (middleInitial && !/^[A-Za-z]$/.test(middleInitial)) {
      nextErrors.middleInitial = 'Middle initial must be one letter only.';
    }

    const contact = form.contact.trim();
    if (contact && !/^\d{11}$/.test(contact)) {
      nextErrors.contact = 'Contact must be an 11-digit number.';
    }

    const emergencyContact = form.emergencyContact.trim();
    if (emergencyContact && !/^\d{11}$/.test(emergencyContact)) {
      nextErrors.emergencyContact = 'Emergency contact must be an 11-digit number.';
    }

    if (form.birthdate) {
      const selectedDate = new Date(`${form.birthdate}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
        nextErrors.birthdate = 'Birthdate cannot be in the future.';
      }
    }

    return nextErrors;
  };

  const handleSave = () => {
    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFormError('Please fix the highlighted fields before saving.');
      return;
    }

    setErrors({});
    setFormError('');

    const updatedRider = {
      ...rider,
      ...form,
      name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      middleInitial: form.middleInitial.trim(),
      address: form.address.trim() || 'N/A',
      contact: form.contact.trim() || 'N/A',
      birthdate: toDisplayDate(form.birthdate),
      plateNo: form.plateNo.trim() || 'N/A',
      emergencyName: form.emergencyName.trim() || 'N/A',
      emergencyContact: form.emergencyContact.trim() || 'N/A',
    };

    onSaveRider(updatedRider);
    window.alert('Rider details saved successfully.');
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setForm(buildFormData(rider));
    setIsEditing(false);
    setErrors({});
    setFormError('');
  };

  const handleDelete = () => {
    const riderName = `${rider.firstName || ''} ${rider.lastName || ''}`.trim() || rider.name || 'this rider';
    const isConfirmed = window.confirm(`Are you sure you want to delete ${riderName}?`);

    if (!isConfirmed) {
      return;
    }

    onDeleteRider(rider);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="rider-details-title">
      <div className="riders-modal details-modal">
        <header className="riders-modal-header">
          <h3 id="rider-details-title">Rider Details</h3>
          <button type="button" className="close-modal-btn" aria-label="Close rider details" onClick={onClose}>
            <FiX />
          </button>
        </header>

        <div className="riders-modal-body">
          <section>
            <h4>Rider Information</h4>
            {isEditing && formError && <p className="form-error">{formError}</p>}

            <div className="details-grid">
              <div>
                <p className="detail-label">Last Name :</p>
                {isEditing ? (
                  <input
                    className={`detail-input ${errors.lastName ? 'input-error' : ''}`}
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.lastName)}
                  />
                ) : (
                  <p className="detail-value">{rider.lastName}</p>
                )}
                {isEditing && errors.lastName && <p className="field-error">{errors.lastName}</p>}
              </div>
              <div>
                <p className="detail-label">First Name :</p>
                {isEditing ? (
                  <input
                    className={`detail-input ${errors.firstName ? 'input-error' : ''}`}
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.firstName)}
                  />
                ) : (
                  <p className="detail-value">{rider.firstName}</p>
                )}
                {isEditing && errors.firstName && <p className="field-error">{errors.firstName}</p>}
              </div>
              <div>
                <p className="detail-label">Middle Initial :</p>
                {isEditing ? (
                  <input
                    className={`detail-input ${errors.middleInitial ? 'input-error' : ''}`}
                    name="middleInitial"
                    value={form.middleInitial}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.middleInitial)}
                  />
                ) : (
                  <p className="detail-value">{rider.middleInitial}</p>
                )}
                {isEditing && errors.middleInitial && (
                  <p className="field-error">{errors.middleInitial}</p>
                )}
              </div>
            </div>

            <p className="detail-label">Address</p>
            {isEditing ? (
              <input className="detail-input" name="address" value={form.address} onChange={handleChange} />
            ) : (
              <p className="detail-value">{rider.address}</p>
            )}

            <div className="details-grid two-cols">
              <div>
                <p className="detail-label">Contact</p>
                {isEditing ? (
                  <input
                    className={`detail-input ${errors.contact ? 'input-error' : ''}`}
                    name="contact"
                    value={form.contact}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.contact)}
                  />
                ) : (
                  <p className="detail-value">{rider.contact}</p>
                )}
                {isEditing && errors.contact && <p className="field-error">{errors.contact}</p>}
              </div>
              <div>
                <p className="detail-label">Birthdate</p>
                {isEditing ? (
                  <input
                    className={`detail-input ${errors.birthdate ? 'input-error' : ''}`}
                    type="date"
                    name="birthdate"
                    value={form.birthdate}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.birthdate)}
                  />
                ) : (
                  <p className="detail-value">{rider.birthdate}</p>
                )}
                {isEditing && errors.birthdate && <p className="field-error">{errors.birthdate}</p>}
              </div>
            </div>

            <p className="detail-label">Plate No.</p>
            {isEditing ? (
              <input className="detail-input" name="plateNo" value={form.plateNo} onChange={handleChange} />
            ) : (
              <p className="detail-value">{rider.plateNo}</p>
            )}
          </section>

          <section>
            <h4>Emergency Contact</h4>
            <p className="detail-label">Name :</p>
            {isEditing ? (
              <input
                className="detail-input"
                name="emergencyName"
                value={form.emergencyName}
                onChange={handleChange}
              />
            ) : (
              <p className="detail-value">{rider.emergencyName}</p>
            )}
            <p className="detail-label">Contact :</p>
            {isEditing ? (
              <input
                className={`detail-input ${errors.emergencyContact ? 'input-error' : ''}`}
                name="emergencyContact"
                value={form.emergencyContact}
                onChange={handleChange}
                aria-invalid={Boolean(errors.emergencyContact)}
              />
            ) : (
              <p className="detail-value">{rider.emergencyContact}</p>
            )}
            {isEditing && errors.emergencyContact && (
              <p className="field-error">{errors.emergencyContact}</p>
            )}
          </section>

          <div className="modal-actions with-secondary details-actions">
            {isEditing ? (
              <>
                <button type="button" className="secondary-action-btn" onClick={handleCancelEdit}>
                  Cancel
                </button>
                <button type="button" className="primary-action-btn" onClick={handleSave}>
                  Save
                </button>
              </>
            ) : (
              <>
                <button type="button" className="primary-action-btn" onClick={onOpenDeliveries}>
                  <FiCalendar /> Deliveries
                </button>

                <div className="details-actions-right">
                  <button type="button" className="secondary-action-btn" onClick={() => setIsEditing(true)}>
                    <FiEdit2 /> Edit
                  </button>
                  <button type="button" className="danger-action-btn" onClick={handleDelete}>
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
