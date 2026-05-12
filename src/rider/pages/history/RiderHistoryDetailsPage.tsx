import React, { useEffect, useState } from "react";
import { FiMapPin } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import RiderAppLayout from "../../components/RiderAppLayout";
import {
  formatMetaDateTime,
  getOrderItemTotalPrice,
  getRiderDeliveryById,
  parseOrderItemText,
  toCurrency,
  type RiderDelivery,
} from "../../lib/riderData";

export default function RiderHistoryDetailsPage() {
  const [searchParams] = useSearchParams();
  const deliveryId = searchParams.get("id") ?? "";
  const [delivery, setDelivery] = useState<RiderDelivery | null>(null);

  useEffect(() => {
    const loadDelivery = async () => {
      if (!deliveryId) {
        setDelivery(null);
        return;
      }

      const data = await getRiderDeliveryById(deliveryId);
      setDelivery(data);
    };

    loadDelivery();
  }, [deliveryId]);

  return (
    <RiderAppLayout showBack backTo="/rider/history">
      <div className="space-y-3">
        {/* Delivery Details Card */}
        <article className="bg-rider-details-card rounded-2xl border border-[#d4e4d5] p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[#7d8480] text-xs font-bold">
              #{delivery?.id || "-"}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-[0.68rem] font-bold ${
                delivery?.status === "Delivered"
                  ? "bg-[#cbf0ce] text-[#14722b]"
                  : "bg-[#ffe4e4] text-[#d12525]"
              }`}
            >
              {delivery?.status || "Failed"}
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
              <li className="text-sm text-[#7d8480]">No items available</li>
            )}
          </ul>
          <div className="mt-4 pt-3 border-t border-[#e0e0e0] flex items-center justify-between">
            <span className="text-sm text-[#4d564e]">
              {delivery?.paymentMethod || "Paid Online"}
            </span>
            <strong className="text-[#116220] text-lg font-bold">
              {delivery ? toCurrency(delivery.amount) : "-"}
            </strong>
          </div>
        </article>

        {/* Status Message Card */}
        <article
          className={`rounded-2xl border-2 p-4 shadow-sm ${
            delivery?.status === "Delivered"
              ? "bg-gradient-to-br from-[#d4f5d3] to-[#e8f9e6] border-[#8fd98d]"
              : "bg-gradient-to-br from-[#ffe4e4] to-[#fef5f5] border-[#f5c2c2]"
          }`}
        >
          <p
            className={`m-0 text-base font-bold ${
              delivery?.status === "Delivered"
                ? "text-[#0c8f2d]"
                : "text-[#d12525]"
            }`}
          >
            {delivery?.status === "Delivered" ? "✓ Delivered" : "✗ Failed"}
          </p>
          <p
            className={`m-0 mt-2 text-sm leading-relaxed ${
              delivery?.status === "Delivered"
                ? "text-[#0c8f2d]"
                : "text-[#d12525]"
            }`}
          >
            {delivery?.status === "Delivered" ? "Delivered at" : "Failed at"}{" "}
            <strong>
              {formatMetaDateTime(
                delivery?.failedAt ||
                  delivery?.deliveredAt ||
                  delivery?.createdAt,
              )}
            </strong>
          </p>
          {delivery?.status !== "Delivered" && delivery?.failedReason && (
            <p className="m-0 mt-2 text-sm text-[#d12525]">
              <strong>Reason:</strong> {delivery.failedReason}
            </p>
          )}
        </article>
      </div>
    </RiderAppLayout>
  );
}
