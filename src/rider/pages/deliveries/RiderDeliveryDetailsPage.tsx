import React, { useEffect, useState } from "react";
import {
  FiMapPin,
  FiNavigation,
  FiPhone,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import RiderAppLayout from "../../components/RiderAppLayout";
import {
  getOrderItemTotalPrice,
  getRiderDeliveryById,
  markDeliveryDelivered,
  markDeliveryFailed,
  parseOrderItemText,
  toCurrency,
  type RiderDelivery,
} from "../../lib/riderData";

export default function RiderDeliveryDetailsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deliveryId = searchParams.get("id") ?? "";
  const [delivery, setDelivery] = useState<RiderDelivery | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<
    "delivered" | "failed" | null
  >(null);

  useEffect(() => {
    const loadDelivery = async () => {
      setIsLoading(true);
      setError(null);
      if (!deliveryId) {
        setDelivery(null);
        setIsLoading(false);
        return;
      }

      try {
        const data = await getRiderDeliveryById(deliveryId);
        setDelivery(data);
      } catch (err) {
        setError(
          `Failed to load delivery: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDelivery();
  }, [deliveryId]);

  const handleDelivered = async () => {
    if (!deliveryId) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const success = await markDeliveryDelivered(deliveryId);
      if (success) {
        navigate(
          `/rider/deliveries/delivered?id=${encodeURIComponent(deliveryId)}`,
        );
      } else {
        setError("Failed to mark delivery as delivered. Please try again.");
      }
    } catch (err) {
      setError(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setIsSubmitting(false);
      setConfirmModal(null);
    }
  };

  const handleFailed = async () => {
    if (!deliveryId) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const success = await markDeliveryFailed(
        deliveryId,
        "Marked as failed by rider",
      );
      if (success) {
        navigate(`/rider/history/details?id=${encodeURIComponent(deliveryId)}`);
      } else {
        setError("Failed to mark delivery as failed. Please try again.");
      }
    } catch (err) {
      setError(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setIsSubmitting(false);
      setConfirmModal(null);
    }
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

  return (
    <RiderAppLayout showBack backTo="/rider/map" pageTitle="Delivery Details">
      <div className="space-y-3">
        {isLoading ? (
          <p className="m-0 rounded-xl bg-[#f7f7f5] p-3 text-sm text-[#5b645c]">
            Loading delivery...
          </p>
        ) : null}

        {error && (
          <div className="rounded-xl border border-[#f5c2c2] bg-[#ffe4e4] p-3 text-sm font-semibold text-[#d12525]">
            {error}
          </div>
        )}

        <article className="bg-rider-details-card rounded-3xl border border-[#d4e4d5] p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#7d8480] text-xs font-bold">
              #{delivery?.id || "-"}
            </span>
            <span className="inline-flex items-center rounded-full bg-rider-pill-yellow px-3 py-1 text-[0.68rem] font-bold text-rider-pill-yellow-text">
              {delivery?.status || "In Progress"}
            </span>
          </div>

          <div className="mt-3 space-y-3">
            <div>
              <h2 className="m-0 text-3xl font-bold text-[#0c631f] leading-tight">
                {delivery?.customer || "-"}
              </h2>
              <p className="mt-2 text-base text-[#4d564e] flex items-start gap-2">
                <FiMapPin size={18} className="mt-0.5" />
                <span>{delivery?.address || "-"}</span>
              </p>
            </div>

            <p className="mt-2 text-base text-[#4d564e] flex items-start gap-2">
              <FiPhone size={18} className="mt-0.5" />
              <span className="font-semibold text-[#143b1c]">
                {delivery?.contact || "-"}
              </span>
            </p>

            <div className="rounded-2xl bg-[#eef4ec] p-3 text-base text-[#3d453f]">
              <div className="flex items-center gap-2 text-[#4b534d] font-semibold">
                <FiNavigation size={16} />
                Navigation note
              </div>
              <p className="mt-2 leading-6 text-[#3d453f]">
                {delivery?.navigationText || "-"}
              </p>
            </div>
          </div>
        </article>

        <article className="bg-rider-details-card rounded-3xl border border-[#d4e4d5] p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h3 className="m-0 text-base font-bold uppercase tracking-[0.18em] text-[#4b534d]">
              Order Items
            </h3>
            <span className="text-base text-[#4d564e]">
              {delivery?.paymentMethod || "Cash on Delivery"}
            </span>
          </div>
          <ul className="mt-3 space-y-2 pl-4.5 text-base text-[#3d453f]">
            {Array.isArray(delivery?.items) && delivery.items.length > 0 ? (
              delivery.items.map((item, index) => {
                const parsedItem = parseOrderItemText(item);
                const itemTotalPrice = getOrderItemTotalPrice(item);

                return (
                  <li
                    key={`${parsedItem.rawText}-${index}`}
                    className="flex items-center justify-between leading-6"
                  >
                    <span>{parsedItem.rawText}</span>
                    {itemTotalPrice != null && (
                      <span className="font-semibold text-[#143b1c]">
                        {toCurrency(itemTotalPrice)}
                      </span>
                    )}
                  </li>
                );
              })
            ) : (
              <li className="leading-6 text-[#7d8480]">
                No order items found.
              </li>
            )}
          </ul>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-base text-[#4d564e]">Amount</span>
            <strong className="text-[#116220] text-2xl font-bold">
              {delivery ? toCurrency(delivery.amount) : "-"}
            </strong>
          </div>
        </article>

        <article className="bg-rider-details-card rounded-3xl border border-[#d4e4d5] p-4 shadow-sm">
          <h3 className="m-0 mb-3 text-base font-bold uppercase tracking-[0.18em] text-[#4b534d]">
            Payment Options
          </h3>
          <button
            type="button"
            className="w-full rounded-2xl bg-[#96d68f] px-4 py-3 text-base font-black text-[#108426] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() =>
              navigate(
                `/rider/deliveries/payment?id=${encodeURIComponent(deliveryId)}`,
              )
            }
            disabled={isSubmitting}
          >
            Switch to e-Payment (GCash/Maya)
          </button>
        </article>

        <article className="bg-rider-details-card rounded-3xl border border-[#d4e4d5] p-4 shadow-sm">
          <div className="grid gap-3">
            <button
              type="button"
              className="w-full rounded-2xl bg-[#4c4c4c] px-4 py-3 text-base font-bold text-[#f3f3f3] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleOpenInAppMap}
              disabled={!delivery?.address || isSubmitting}
            >
              Open In-App Map
            </button>
            <button
              type="button"
              className="w-full rounded-2xl border border-[#7d7d7d] bg-[#ececec] px-4 py-3 text-base font-bold text-[#3b3b3b] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleOpenGoogleMaps}
              disabled={!delivery?.address || isSubmitting}
            >
              Open in Google Maps
            </button>
          </div>
        </article>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="w-full rounded-2xl bg-[#8fd98d] px-4 py-3 text-base font-black text-[#0c8f2d] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => setConfirmModal("delivered")}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Delivered"}
          </button>
          <button
            type="button"
            className="w-full rounded-2xl bg-[#ef8f8f] px-4 py-3 text-base font-black text-[#f21f1f] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => setConfirmModal("failed")}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Failed"}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-[#e0e0e0]">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full mb-4 mx-auto ${
                confirmModal === "failed" ? "bg-[#ffe4e4]" : "bg-[#d4f5d3]"
              }`}
            >
              {confirmModal === "failed" ? (
                <FiAlertCircle className="text-[#d12525]" size={24} />
              ) : (
                <FiCheck className="text-[#0c8f2d]" size={24} />
              )}
            </div>

            <h2 className="text-center text-xl font-bold text-[#2d322f] mb-2">
              {confirmModal === "failed"
                ? "Mark Delivery as Failed?"
                : "Mark Delivery as Delivered?"}
            </h2>

            <p className="text-center text-base text-[#666] mb-6">
              {confirmModal === "failed"
                ? "Are you sure? This will mark the delivery as failed. This action cannot be undone."
                : "Confirm that you have successfully delivered this order to the customer."}
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
                    await handleDelivered();
                  } else {
                    await handleFailed();
                  }
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
