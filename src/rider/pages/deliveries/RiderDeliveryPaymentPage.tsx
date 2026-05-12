import React, { useEffect, useState } from "react";
import { FiMapPin, FiNavigation, FiAlertCircle, FiCheck } from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import RiderAppLayout from "../../components/RiderAppLayout";
import {
  getRiderDeliveryById,
  markDeliveryFailed,
  markDeliveryPaid,
  toCurrency,
  uploadPaymentProof,
  parseOrderItemText,
  getOrderItemTotalPrice,
  type RiderDelivery,
} from "../../lib/riderData";

export default function RiderDeliveryPaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deliveryId = searchParams.get("id") ?? "";
  const [delivery, setDelivery] = useState<RiderDelivery | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<
    "delivered" | "failed" | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadDelivery = async () => {
      setIsLoading(true);
      if (!deliveryId) {
        setDelivery(null);
        setIsLoading(false);
        return;
      }

      const data = await getRiderDeliveryById(deliveryId);
      setDelivery(data);
      setIsLoading(false);
    };

    loadDelivery();
  }, [deliveryId]);

  const handleConfirmPayment = async () => {
    if (!deliveryId) {
      return;
    }

    setIsSubmitting(true);
    await markDeliveryPaid(deliveryId);
    setIsSubmitting(false);
    navigate(
      `/rider/deliveries/delivered?id=${encodeURIComponent(deliveryId)}`,
    );
  };

  const handleFailed = async () => {
    if (!deliveryId) {
      return;
    }

    setIsSubmitting(true);
    await markDeliveryFailed(
      deliveryId,
      "Marked as failed by rider during payment",
    );
    setIsSubmitting(false);
    navigate(`/rider/history/details?id=${encodeURIComponent(deliveryId)}`);
  };

  const handleOpenGoogleMaps = () => {
    const destination = String(delivery?.address ?? "").trim();
    if (!destination) {
      return;
    }

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`;
    window.open(mapsUrl, "_blank", "noopener,noreferrer");
  };

  const handleOpenInAppMap = () => {
    if (!deliveryId) {
      return;
    }

    navigate(`/rider/map?id=${encodeURIComponent(deliveryId)}`);
  };

  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !deliveryId) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setUploadSuccess(false);
    setUploadError(null);
    setUploadedImageUrl(null);

    const previewUrl = URL.createObjectURL(file);
    const success = await uploadPaymentProof(deliveryId, file);

    setIsUploading(false);
    if (success) {
      setUploadSuccess(true);
      setUploadedImageUrl(previewUrl);
      setUploadError(null);
    } else {
      setUploadError("Failed to upload payment proof. Please try again.");
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <RiderAppLayout
      showBack
      backTo={
        deliveryId
          ? `/rider/deliveries/details?id=${encodeURIComponent(deliveryId)}`
          : "/rider/deliveries/details"
      }
    >
      <div className="space-y-3">
        {isLoading && (
          <div className="rounded-xl bg-[#f0f8f0] p-3 text-sm text-[#4b7d53] border border-[#d4e4d5]">
            Loading delivery...
          </div>
        )}

        {/* Customer Details Card */}
        <article className="bg-rider-details-card rounded-2xl border border-[#d4e4d5] p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[#7d8480] text-xs font-bold">
              #{delivery?.id || "-"}
            </span>
            <span className="inline-flex items-center rounded-full px-3 py-1 text-[0.68rem] font-bold bg-rider-pill-yellow text-rider-pill-yellow-text">
              {delivery?.status || "In Progress"}
            </span>
          </div>
          <h2 className="m-0 mb-2 text-[#0c631f] text-2xl font-bold">
            {delivery?.customer || "-"}
          </h2>
          <p className="m-0 mb-2 text-base text-[#4d564e] flex items-start gap-2">
            <FiMapPin size={18} className="mt-0.5 flex-shrink-0" />
            <span>{delivery?.address || "-"}</span>
          </p>
          <p className="m-0 text-base text-[#15a63d] font-bold">
            {delivery?.contact || "-"}
          </p>
          <div className="mt-3 rounded-xl bg-[#f5f5f5] p-3 text-base text-[#3d453f] flex items-start gap-2">
            <FiNavigation size={16} className="mt-0.5 flex-shrink-0" />
            <span>{delivery?.navigationText || "-"}</span>
          </div>
        </article>

        {/* Order Items Card */}
        <article className="bg-rider-details-card rounded-2xl border border-[#d4e4d5] p-4 shadow-sm">
          <h3 className="m-0 mb-3 text-[#4b534d] text-base font-bold uppercase tracking-[0.12em]">
            Order Items
          </h3>
          <ul className="m-0 space-y-2 pl-4">
            {Array.isArray(delivery?.items) && delivery.items.length > 0 ? (
              delivery.items.map((item, index) => {
                const parsedItem = parseOrderItemText(item);
                const itemTotalPrice = getOrderItemTotalPrice(item);

                return (
                  <li
                    key={`${parsedItem.rawText}-${index}`}
                    className="flex items-center justify-between text-base text-[#3d453f] leading-6"
                  >
                    <span>{parsedItem.rawText}</span>
                    {itemTotalPrice != null && (
                      <span className="font-semibold text-[#0c8f2d]">
                        {toCurrency(itemTotalPrice)}
                      </span>
                    )}
                  </li>
                );
              })
            ) : (
              <li className="text-base text-[#7d8480]">No items available</li>
            )}
          </ul>
          <div className="mt-4 pt-3 border-t border-[#e0e0e0] flex items-center justify-between">
            <span className="text-base text-[#4d564e]">
              {delivery?.paymentMethod || "Cash on Delivery"}
            </span>
            <strong className="text-[#116220] text-2xl font-bold">
              {delivery ? toCurrency(delivery.amount) : "-"}
            </strong>
          </div>
        </article>

        {/* Payment Options Card */}
        <article className="bg-rider-details-card rounded-2xl border border-[#d4e4d5] p-4 shadow-sm">
          <h3 className="m-0 mb-3 text-[#4b534d] text-base font-bold uppercase tracking-[0.12em]">
            Payment Proof
          </h3>

          {/* QR Code Section */}
          <div className="bg-[#f9f9f9] rounded-xl p-4 mb-4 border border-[#e8e8e8]">
            <img
              src="/images/GCASH.png"
              alt="GCash/Maya QR Code"
              className="w-32 h-32 mx-auto rounded-lg object-contain"
            />
            <p className="mt-3 text-center text-base font-bold text-[#2d322f]">
              {delivery?.customer || "-"}
            </p>
            <p className="m-0 text-center text-sm text-[#616a62] mb-2">
              Scan QR code to pay
            </p>
            <p className="m-0 text-center text-2xl font-black text-[#0d7420]">
              {delivery ? toCurrency(delivery.amount) : "-"}
            </p>
          </div>

          {/* Upload Section */}
          <div className="mb-4">
            <label className="block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUploadProof}
                disabled={isUploading}
              />
              <div
                className={`w-full text-center rounded-lg px-4 py-3 font-bold transition border-2 text-base ${
                  uploadSuccess
                    ? "bg-[#d4f5d3] border-[#8fd98d] text-[#0c8f2d]"
                    : uploadError
                      ? "bg-[#ffe4e4] border-[#f5c2c2] text-[#d12525]"
                      : "bg-[#f0f0f0] border-[#d0d0d0] text-[#666] hover:bg-[#e8e8e8]"
                } ${isUploading ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {isUploading ? (
                  <span>Uploading...</span>
                ) : uploadSuccess ? (
                  <span className="flex items-center justify-center gap-2">
                    <FiCheck size={18} />
                    Proof Uploaded — Tap to replace
                  </span>
                ) : (
                  <span>Upload Payment Proof</span>
                )}
              </div>
            </label>
            {uploadError && (
              <p className="mt-2 text-sm text-[#d12525] flex items-center gap-1">
                <FiAlertCircle size={14} />
                {uploadError}
              </p>
            )}
          </div>

          {/* Image Preview */}
          {uploadedImageUrl && (
            <div className="mb-4 rounded-lg overflow-hidden border-2 border-[#8fd98d] bg-[#f0f8ef]">
              <p className="text-sm text-center text-[#0c8f2d] font-bold bg-[#d4f5d3] py-2 flex items-center justify-center gap-1">
                <FiCheck size={14} />
                Payment proof uploaded
              </p>
              <img
                src={uploadedImageUrl}
                alt="Payment proof"
                className="w-full object-contain max-h-[200px]"
              />
            </div>
          )}

          {/* Confirm Payment Button */}
          <button
            type="button"
            className="w-full rounded-lg bg-[#f0df44] text-[#1a1e10] px-4 py-3.5 font-black text-lg transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => setConfirmModal("delivered")}
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting ? "Confirming..." : "Confirm Payment Received"}
          </button>
        </article>

        {/* Navigation Section */}
        <div className="space-y-2">
          <button
            type="button"
            className="w-full rounded-lg bg-[#4c4c4c] text-[#f3f3f3] px-4 py-3 font-bold text-base transition hover:opacity-90 disabled:opacity-60"
            onClick={handleOpenInAppMap}
            disabled={!delivery?.address || isSubmitting}
          >
            Open In-App Map
          </button>

          <button
            type="button"
            className="w-full rounded-lg border border-[#9d9d9d] bg-[#ececec] text-[#3b3b3b] px-4 py-2.5 font-bold text-base transition hover:opacity-90 disabled:opacity-60"
            onClick={handleOpenGoogleMaps}
            disabled={!delivery?.address || isSubmitting}
          >
            Open in Google Maps
          </button>
        </div>

        {/* Result Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            className="rounded-lg px-4 py-3 font-bold text-base bg-[#8fd98d] text-[#0c8f2d] transition hover:opacity-90 disabled:opacity-60"
            onClick={() => setConfirmModal("delivered")}
            disabled={isSubmitting}
          >
            {isSubmitting ? "..." : "Delivered"}
          </button>
          <button
            type="button"
            className="rounded-lg px-4 py-3 font-bold text-base bg-[#ef8f8f] text-[#f21f1f] transition hover:opacity-90 disabled:opacity-60"
            onClick={() => setConfirmModal("failed")}
            disabled={isSubmitting}
          >
            {isSubmitting ? "..." : "Failed"}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-[#e0e0e0]">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full mb-4 mx-auto ${
                confirmModal === "failed" ? "bg-[#ffe4e4]" : "bg-[#fff3cd]"
              }`}
            >
              {confirmModal === "failed" ? (
                <FiAlertCircle className="text-[#d12525]" size={24} />
              ) : (
                <FiCheck className="text-[#ff9800]" size={24} />
              )}
            </div>

            <h2 className="text-center text-xl font-bold text-[#2d322f] mb-2">
              {confirmModal === "failed"
                ? "Mark as Failed?"
                : "Confirm Payment Received?"}
            </h2>

            <p className="text-center text-base text-[#666] mb-6">
              {confirmModal === "failed"
                ? "Are you sure you want to mark this delivery as failed? This action cannot be undone."
                : "Are you sure the payment has been received? Please ensure you have uploaded the payment proof."}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-lg border border-[#d0d0d0] bg-white text-[#3b3b3b] px-4 py-2.5 font-bold transition hover:bg-[#f5f5f5]"
                onClick={() => setConfirmModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`flex-1 rounded-lg text-white px-4 py-2.5 font-bold transition ${
                  confirmModal === "failed"
                    ? "bg-[#ef8f8f] hover:opacity-90"
                    : "bg-[#8fd98d] hover:opacity-90"
                }`}
                onClick={async () => {
                  if (confirmModal === "delivered") {
                    await handleConfirmPayment();
                  } else {
                    await handleFailed();
                  }
                  setConfirmModal(null);
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </RiderAppLayout>
  );
}
