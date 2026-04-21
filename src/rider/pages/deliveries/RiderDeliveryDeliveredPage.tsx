import React, { useEffect, useState } from 'react';
import { FiMapPin, FiNavigation } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import RiderAppLayout from '../../components/RiderAppLayout';
import { formatMetaDateTime, getRiderDeliveryById, toCurrency, type RiderDelivery } from '../../lib/riderData';

export default function RiderDeliveryDeliveredPage() {
  const [searchParams] = useSearchParams();
  const deliveryId = searchParams.get('id') ?? '';
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
      {/* Customer Details Card */}
      <article className="bg-rider-details-card rounded-xl p-3 mb-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[#7d8480] text-xs font-bold">#{delivery?.id || '-'}</span>
          <span className="inline-flex items-center rounded-full px-2 py-1 text-[0.68rem] font-bold bg-rider-pill-yellow text-rider-pill-yellow-text">
            {delivery?.status || 'Delivered'}
          </span>
        </div>
        <h2 className="m-0 mt-1.75 mb-1 text-[#0c631f] text-[2rem] font-bold">{delivery?.customer || '-'}</h2>
        <p className="m-1 text-sm text-[#4d564e] flex items-center gap-1">
          <FiMapPin size={16} />
          {delivery?.address || '-'}
        </p>
        <p className="m-1 text-sm text-[#15a63d] font-black">{delivery?.customerPhone || '-'}</p>
        <div className="mt-2 bg-[#9f9f9f] rounded text-[#dedede] px-2.25 py-1.75 text-sm flex items-center gap-1.25">
          <FiNavigation size={16} />
          {delivery?.navigationText || '-'}
        </div>
      </article>

      {/* Order Items Card */}
      <article className="bg-rider-details-card rounded-xl p-3 mb-3">
        <h3 className="m-0 mb-1.5 text-[#4b534d] text-sm font-bold">ORDER ITEMS</h3>
        <ul className="m-0 pl-4.5">
          {(delivery?.items.length ? delivery.items : ['-']).map((item, index) => (
            <li key={`${item}-${index}`} className="mb-1 text-[#3d453f] text-sm">{item}</li>
          ))}
        </ul>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[#4d564e] text-sm">{delivery?.paymentMethod || 'Cash on Delivery'}</span>
          <strong className="text-[#116220] text-[1.6rem] font-bold">{delivery ? toCurrency(delivery.amount) : '-'}</strong>
        </div>
      </article>

      {/* Success Message Card */}
      <article className="bg-rider-details-card rounded-xl p-3 text-[#0f6f22] text-[1.2rem]">
        Delivered at <strong>{formatMetaDateTime(delivery?.deliveredAt || delivery?.createdAt)}</strong>
      </article>
    </RiderAppLayout>
  );
}
