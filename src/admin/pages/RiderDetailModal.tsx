import { ChangeEvent, useEffect, useState } from "react";
import { FiCalendar, FiEdit2, FiTrash2 } from "react-icons/fi";
import { supabase } from "@lib/supabase";
import {
  Rider,
  RiderFormData,
  RiderFormErrors,
  buildRiderFormData,
  toDisplayDate,
} from "./riderModalShared";

function normalizeUpdateValue(value: string): string | null {
  const normalized = value.trim();
  return normalized === "" ? null : normalized;
}

const adminApiUrl =
  import.meta.env.VITE_ADMIN_API_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

interface RiderDetailModalProps {
  rider: Rider;
  onClose: () => void;
  onOpenDeliveries: () => void;
  onSaveRider: (rider: Rider) => void;
  onDeleteRider: (rider: Rider) => void;
}

export default function RiderDetailModal({
  rider,
  onClose,
  onOpenDeliveries,
  onSaveRider,
  onDeleteRider,
}: RiderDetailModalProps): JSX.Element | null {
  if (!rider) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<RiderFormData>(buildRiderFormData(rider));
  const [errors, setErrors] = useState<RiderFormErrors>({});
  const [formError, setFormError] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setForm(buildRiderFormData(rider));
    setIsEditing(false);
    setErrors({});
    setFormError("");
  }, [rider]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (formError) {
      setFormError("");
    }
  };

  const lastNameInvalid = errors.lastName ? "true" : undefined;
  const firstNameInvalid = errors.firstName ? "true" : undefined;
  const middleInitialInvalid = errors.middleInitial ? "true" : undefined;
  const contactInvalid = errors.contact ? "true" : undefined;
  const birthdateInvalid = errors.birthdate ? "true" : undefined;
  const emergencyContactInvalid = errors.emergencyContact ? "true" : undefined;

  const validateForm = (): RiderFormErrors => {
    const nextErrors: RiderFormErrors = {};

    if (!form.lastName.trim()) nextErrors.lastName = "Last name is required.";
    if (!form.firstName.trim()) {
      nextErrors.firstName = "First name is required.";
    }

    const middleInitial = form.middleInitial.trim();
    if (middleInitial && !/^[A-Za-z]$/.test(middleInitial)) {
      nextErrors.middleInitial = "Middle initial must be one letter only.";
    }

    const contact = form.contact.trim();
    if (contact && !/^\d{11}$/.test(contact)) {
      nextErrors.contact = "Contact must be an 11-digit number.";
    }

    const emergencyContact = form.emergencyContact.trim();
    if (emergencyContact && !/^\d{11}$/.test(emergencyContact)) {
      nextErrors.emergencyContact =
        "Emergency contact must be an 11-digit number.";
    }

    if (form.birthdate) {
      const selectedDate = new Date(`${form.birthdate}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
        nextErrors.birthdate = "Birthdate cannot be in the future.";
      }
    }

    if (newPassword.trim() && newPassword.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    return nextErrors;
  };

  const handleSave = async (): Promise<void> => {
    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFormError("Please fix the highlighted fields before saving.");
      return;
    }

    setErrors({});
    setFormError("");
    setIsSaving(true);

    try {
      // ✅ PART 3: UPDATE PASSWORD IN SUPABASE (ADMIN)
      if (newPassword.trim()) {
        if (!rider.userid) {
          setFormError("Unable to update password: rider user ID is missing.");
          setIsSaving(false);
          return;
        }

        try {
          const response = await fetch(
            `${adminApiUrl}/admin/update-rider-password`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: rider.userid,
                newPassword: newPassword.trim(),
              }),
            },
          );

          const data = await response.json();

          if (!response.ok) {
            const message =
              data?.error || `Failed to update password (${response.status})`;
            throw new Error(message);
          }
        } catch (error: unknown) {
          console.error(error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to update password.";
          setFormError(errorMessage);
          setIsSaving(false);
          return;
        }
      }

      // ✅ UPDATE RIDER DATA IN SUPABASE
      const { error: updateError } = await supabase
        .from("riders")
        .update({
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          middle_initial: form.middleInitial.trim() || null,
          address: normalizeUpdateValue(form.address),
          location: normalizeUpdateValue(form.location),
          contact: normalizeUpdateValue(form.contact),
          birthdate: form.birthdate || null,
          plate_number: normalizeUpdateValue(form.plate_number),
          email: normalizeUpdateValue(form.email),
          emergency_name: normalizeUpdateValue(form.emergencyName),
          emergency_contact: normalizeUpdateValue(form.emergencyContact),
        })
        .eq("id", rider.id);

      if (updateError) {
        console.error("Error updating rider in Supabase:", updateError);
        setFormError("Failed to save rider changes to database.");
        setIsSaving(false);
        return;
      }

      const updatedRider: Rider = {
        ...rider,
        ...form,
        name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        middleInitial: form.middleInitial.trim(),
        address: form.address.trim(),
        location: form.location.trim(),
        contact: form.contact.trim(),
        birthdate: toDisplayDate(form.birthdate),
        plate_number: form.plate_number.trim(),
        emergencyName: form.emergencyName.trim(),
        emergencyContact: form.emergencyContact.trim(),
      };

      onSaveRider(updatedRider);
      window.alert("Rider details saved successfully.");
      setNewPassword("");
      setIsEditing(false);
    } catch (error: unknown) {
      console.error("Unexpected error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";
      setFormError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    const riderName =
      `${rider.firstName || ""} ${rider.lastName || ""}`.trim() ||
      rider.name ||
      "this rider";
    const isConfirmed = window.confirm(
      `Are you sure you want to delete ${riderName}?`,
    );

    if (isConfirmed) {
      setIsDeleting(true);
      try {
        // ✅ DELETE FROM SUPABASE
        const { error } = await supabase
          .from("riders")
          .delete()
          .eq("id", rider.id);

        if (error) {
          console.error("Error deleting rider from Supabase:", error);
          alert("Failed to delete rider from database.");
          setIsDeleting(false);
          return;
        }

        onDeleteRider(rider);
        window.alert("Rider deleted successfully.");
        setIsDeleting(false);
      } catch (err) {
        console.error("Unexpected error:", err);
        alert("Unexpected error while deleting rider.");
        setIsDeleting(false);
      }
    }
  };

  const resetToViewMode = (): void => {
    setForm(buildRiderFormData(rider));
    setIsEditing(false);
    setErrors({});
    setFormError("");
  };

  const handleClose = (): void => {
    resetToViewMode();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rider-details-title"
    >
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-11/12 max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <header className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3
            id="rider-details-title"
            className="text-xl font-bold text-gray-900"
          >
            Rider Details
          </h3>
          <button
            type="button"
            className="text-2xl text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center"
            aria-label="Close rider details"
            onClick={handleClose}
          >
            ×
          </button>
        </header>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <section className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">
              Rider Information
            </h4>
            {isEditing && formError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm font-semibold">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-gray-700">
                  Last Name:
                </p>
                {isEditing ? (
                  <>
                    <input
                      className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.lastName
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 bg-white"
                      }`}
                      name="lastName"
                      placeholder="Enter last name"
                      value={form.lastName}
                      onChange={handleChange}
                      aria-invalid={lastNameInvalid}
                    />
                    {errors.lastName && (
                      <p className="text-xs text-red-600 font-semibold">
                        {errors.lastName}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-700">{rider.lastName}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-gray-700">
                  First Name:
                </p>
                {isEditing ? (
                  <>
                    <input
                      className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.firstName
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 bg-white"
                      }`}
                      name="firstName"
                      placeholder="Enter first name"
                      value={form.firstName}
                      onChange={handleChange}
                      aria-invalid={firstNameInvalid}
                    />
                    {errors.firstName && (
                      <p className="text-xs text-red-600 font-semibold">
                        {errors.firstName}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-700">{rider.firstName}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-gray-700">
                  Middle Initial:
                </p>
                {isEditing ? (
                  <>
                    <input
                      className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.middleInitial
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 bg-white"
                      }`}
                      name="middleInitial"
                      placeholder="Enter middle initial"
                      value={form.middleInitial}
                      onChange={handleChange}
                      aria-invalid={middleInitialInvalid}
                    />
                    {errors.middleInitial && (
                      <p className="text-xs text-red-600 font-semibold">
                        {errors.middleInitial}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-700">{rider.middleInitial}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-gray-700">Address</p>
              {isEditing ? (
                <>
                  <label className="sr-only" htmlFor="detail-address">
                    Address
                  </label>
                  <input
                    id="detail-address"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    name="address"
                    placeholder="Enter address"
                    aria-label="Address"
                    value={form.address}
                    onChange={handleChange}
                  />
                </>
              ) : (
                <p className="text-gray-700">{rider.address}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-gray-700">Location</p>
              {isEditing ? (
                <>
                  <label className="sr-only" htmlFor="detail-location">
                    Location
                  </label>
                  <input
                    id="detail-location"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    name="location"
                    placeholder="Enter location (City / Area / Barangay)"
                    aria-label="Location"
                    value={form.location}
                    onChange={handleChange}
                  />
                </>
              ) : (
                <p className="text-gray-700">{rider.location}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-gray-700">Contact</p>
                {isEditing ? (
                  <>
                    <label className="sr-only" htmlFor="detail-contact">
                      Contact
                    </label>
                    <input
                      id="detail-contact"
                      className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.contact
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 bg-white"
                      }`}
                      name="contact"
                      placeholder="Enter contact number"
                      aria-label="Contact number"
                      value={form.contact}
                      onChange={handleChange}
                      aria-invalid={contactInvalid}
                    />
                    {errors.contact && (
                      <p className="text-xs text-red-600 font-semibold">
                        {errors.contact}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-700">{rider.contact}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-gray-700">Birthdate</p>
                {isEditing ? (
                  <>
                    <>
                      <label className="sr-only" htmlFor="detail-birthdate">
                        Birthdate
                      </label>
                      <input
                        id="detail-birthdate"
                        className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          errors.birthdate
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-white"
                        }`}
                        type="date"
                        name="birthdate"
                        value={form.birthdate}
                        onChange={handleChange}
                        aria-invalid={birthdateInvalid}
                      />
                    </>
                    {errors.birthdate && (
                      <p className="text-xs text-red-600 font-semibold">
                        {errors.birthdate}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-700">{rider.birthdate}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-gray-700">Plate No.</p>
              {isEditing ? (
                <>
                  <label className="sr-only" htmlFor="detail-plate_number">
                    Plate Number
                  </label>
                  <input
                    id="detail-plate_number"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    name="plate_number"
                    placeholder="Enter plate number"
                    aria-label="Plate Number"
                    value={form.plate_number}
                    onChange={handleChange}
                  />
                </>
              ) : (
                <p className="text-gray-700">{rider.plate_number}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-gray-700">Email</p>
              {isEditing ? (
                <>
                  <label className="sr-only" htmlFor="detail-email">
                    Email
                  </label>
                  <input
                    id="detail-email"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    type="email"
                    name="email"
                    placeholder="Enter email address"
                    aria-label="Email"
                    value={form.email}
                    onChange={handleChange}
                  />
                </>
              ) : (
                <p className="text-gray-700">{rider.email}</p>
              )}
            </div>
          </section>

          {isEditing && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-gray-700">
                New Password
              </p>
              <input
                type="password"
                placeholder="Leave blank to keep current password"
                value={newPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNewPassword(e.target.value)
                }
                className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.password
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-white"
                }`}
              />
              {errors.password ? (
                <p className="text-xs text-red-600 font-semibold">
                  {errors.password}
                </p>
              ) : (
                <p className="text-xs text-gray-500">
                  Must be at least 8 characters
                </p>
              )}
            </div>
          )}

          <section className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">
              Emergency Contact
            </h4>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-gray-700">Name:</p>
              {isEditing ? (
                <>
                  <label className="sr-only" htmlFor="detail-emergencyName">
                    Emergency Contact Name
                  </label>
                  <input
                    id="detail-emergencyName"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    name="emergencyName"
                    placeholder="Enter emergency contact name"
                    aria-label="Emergency contact name"
                    value={form.emergencyName}
                    onChange={handleChange}
                  />
                </>
              ) : (
                <p className="text-gray-700">{rider.emergencyName}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-gray-700">Contact:</p>
              {isEditing ? (
                <>
                  <input
                    className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.emergencyContact
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 bg-white"
                    }`}
                    name="emergencyContact"
                    placeholder="Enter emergency contact number"
                    value={form.emergencyContact}
                    onChange={handleChange}
                    aria-invalid={emergencyContactInvalid}
                  />
                  {errors.emergencyContact && (
                    <p className="text-xs text-red-600 font-semibold">
                      {errors.emergencyContact}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-700">{rider.emergencyContact}</p>
              )}
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-gray-200 flex gap-3 justify-end">
          {isEditing ? (
            <>
              <button
                type="button"
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={resetToViewMode}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onOpenDeliveries}
                disabled={isDeleting}
              >
                <FiCalendar className="w-4 h-4" /> Deliveries
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-semibold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setIsEditing(true)}
                  disabled={isDeleting}
                >
                  <FiEdit2 className="w-4 h-4" /> Edit
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <FiTrash2 className="w-4 h-4" />{" "}
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
