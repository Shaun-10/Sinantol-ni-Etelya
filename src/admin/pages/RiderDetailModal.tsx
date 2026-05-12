import { ChangeEvent, useEffect, useState } from "react";
import { FiEdit2, FiTrash2, FiCalendar } from "react-icons/fi";
import { supabase } from "@lib/supabase";
import {
  Rider,
  RiderFormData,
  RiderFormErrors,
  buildRiderFormData,
} from "./riderModalShared";

function normalizeUpdateValue(value: string): string | null {
  const normalized = value.trim();
  return normalized === "" ? null : normalized;
}

const PRODUCTION_AUTH_REDIRECT_URL = "https://sinantol-ni-etalya.vercel.app";

function getPasswordResetRedirectUrl(): string {
  const configuredUrl = String(import.meta.env.VITE_AUTH_REDIRECT_URL || "")
    .trim()
    .replace(/\/+$/, "");
  const redirectBaseUrl =
    configuredUrl && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(configuredUrl)
      ? configuredUrl
      : PRODUCTION_AUTH_REDIRECT_URL;

  return `${redirectBaseUrl}/reset-password`;
}

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
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);

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

  const handleSendPasswordReset = async (): Promise<void> => {
    if (!form.email.trim()) {
      setFormError("Rider email is missing. Cannot send password reset.");
      return;
    }

    setFormError("");
    setIsSendingResetEmail(true);

    try {
      const redirectTo = getPasswordResetRedirectUrl();

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        form.email.trim(),
        {
          redirectTo,
        },
      );

      if (resetError) {
        throw new Error(resetError.message);
      }

      window.alert(
        `Password reset link has been sent to ${form.email.trim()}. The rider can use it to update their password.`,
      );
    } catch (error: unknown) {
      console.error(error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send password reset email.";
      setFormError(errorMessage);
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  const nameInvalid = errors.name ? "true" : undefined;
  const contactInvalid = errors.contact ? "true" : undefined;

  const validateForm = (): RiderFormErrors => {
    const nextErrors: RiderFormErrors = {};

    if (!form.name.trim()) nextErrors.name = "Name is required.";

    const contact = form.contact.trim();
    if (contact && !/^\d{11}$/.test(contact)) {
      nextErrors.contact = "Contact must be an 11-digit number.";
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

    const isConfirmed = window.confirm(
      "Are you sure you want to save these rider changes?",
    );

    if (!isConfirmed) {
      return;
    }

    setErrors({});
    setFormError("");
    setIsSaving(true);

    try {
      // ✅ UPDATE RIDER DATA IN SUPABASE
      const { error: updateError } = await supabase
        .from("riders")
        .update({
          name: form.name.trim(),
          address: normalizeUpdateValue(form.address),
          area: normalizeUpdateValue(form.area),
          contact: normalizeUpdateValue(form.contact),
          plate_number: normalizeUpdateValue(form.plate_number),
          email: normalizeUpdateValue(form.email),
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
        name: form.name.trim(),
        address: form.address.trim(),
        area: form.area.trim(),
        contact: form.contact.trim(),
        plate_number: form.plate_number.trim(),
        email: form.email.trim(),
      };

      onSaveRider(updatedRider);
      window.alert("Rider details saved successfully.");
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
    const riderName = rider.name || "this rider";
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

            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-gray-700">Name</p>
              {isEditing ? (
                <>
                  <label className="sr-only" htmlFor="detail-name">
                    Name
                  </label>
                  <input
                    id="detail-name"
                    className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.name
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 bg-white"
                    }`}
                    name="name"
                    placeholder="Enter rider name"
                    value={form.name}
                    onChange={handleChange}
                    {...(nameInvalid && {
                      "aria-invalid": nameInvalid,
                    })}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-600 font-semibold">
                      {errors.name}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-700">{rider.name}</p>
              )}
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
              <p className="text-sm font-semibold text-gray-700">Area</p>
              {isEditing ? (
                <>
                  <label className="sr-only" htmlFor="detail-area">
                    Area
                  </label>
                  <input
                    id="detail-area"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    name="area"
                    placeholder="Enter area (City / Area / Barangay)"
                    aria-label="Area"
                    value={form.area}
                    onChange={handleChange}
                  />
                </>
              ) : (
                <p className="text-gray-700">{rider.area}</p>
              )}
            </div>

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
                    {...(contactInvalid && {
                      "aria-invalid": contactInvalid,
                    })}
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
                Send Password Reset Email
              </p>
              <button
                type="button"
                onClick={handleSendPasswordReset}
                disabled={!form.email || isSaving || isSendingResetEmail}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isSendingResetEmail
                  ? "Sending..."
                  : "Send Password Reset Link"}
              </button>
              <p className="text-xs text-gray-500">
                Click to send a password reset email to {form.email || "rider"}.
              </p>
            </div>
          )}
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
