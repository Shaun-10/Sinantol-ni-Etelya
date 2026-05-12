import React, { useEffect, useState } from "react";
import { FiMapPin, FiNavigation } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import RiderAppLayout from "../../components/RiderAppLayout";
import {
  formatMetaDateTime,
  getOrderItemsTotal,
  getOrderItemTotalPrice,
  parseOrderItemText,
  getRiderDeliveryById,
  toCurrency,
  type RiderDelivery,
} from "../../lib/riderData";

export default function RiderDeliveryDeliveredPage() {
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
    <RiderAppLayout showBack backTo="/rider/deliveries/details">
      <div className="space-y-3">
        {/* Customer Details Card */}
        <article className="bg-rider-details-card rounded-2xl border border-[#d4e4d5] p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[#7d8480] text-xs font-bold">
              #{delivery?.id || "-"}
            </span>
            <span className="inline-flex items-center rounded-full px-3 py-1 text-[0.68rem] font-bold bg-[#cbf0ce] text-[#14722b]">
              {delivery?.status || "Delivered"}
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
            {(Array.isArray(delivery?.items) && delivery.items.length > 0
              ? delivery.items
              : ["-"]
            ).map((item, index) => {
              const parsedItem = parseOrderItemText(item);
              const itemTotalPrice = getOrderItemTotalPrice(item);

              return (
                <li
                  key={`${parsedItem.rawText}-${index}`}
                  className="mb-1 text-[#3d453f] text-base flex items-center justify-between"
                >
                  <span>{parsedItem.rawText}</span>
                  {itemTotalPrice != null && (
                    <span className="font-semibold text-[#0c8f2d]">
                      {toCurrency(itemTotalPrice)}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="mt-4 pt-3 border-t border-[#e0e0e0] flex items-center justify-between">
            <span className="text-[#4d564e] text-base">
              {delivery?.paymentMethod || "Cash on Delivery"}
            </span>
            <strong className="text-[#116220] text-2xl font-bold">
              {delivery
                ? toCurrency(
                    getOrderItemsTotal(delivery.items) > 0
                      ? getOrderItemsTotal(delivery.items)
                      : delivery.amount,
                  )
                : "-"}
            </strong>
          </div>
        </article>

        {/* Success Message Card */}
        <article className="bg-gradient-to-br from-[#d4f5d3] to-[#e8f9e6] rounded-2xl border-2 border-[#8fd98d] p-4 shadow-sm text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white mx-auto mb-2 shadow-sm">
            <span className="text-2xl">✓</span>
          </div>
          <p className="m-0 text-[#0c8f2d] text-lg font-bold">
            Delivery Completed
          </p>
          <p className="m-0 mt-2 text-base text-[#0c8f2d] leading-relaxed">
            Delivered at{" "}
            <strong>
              {formatMetaDateTime(delivery?.deliveredAt || delivery?.createdAt)}
            </strong>
          </p>
        </article>
      </div>
    </RiderAppLayout>
  );
}
