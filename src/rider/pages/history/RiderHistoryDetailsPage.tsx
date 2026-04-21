import React, { useEffect, useState } from 'react';
import { FiMapPin } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import RiderAppLayout from '../../components/RiderAppLayout';
import { formatMetaDateTime, getRiderDeliveryById, toCurrency, type RiderDelivery } from '../../lib/riderData';

export default function RiderHistoryDetailsPage() {
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
    <RiderAppLayout showBack backTo="/rider/history">
      {/* Delivery Details Card */}
      <article className="bg-rider-details-card rounded-xl p-3 mb-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[#7d8480] text-xs font-bold">#{delivery?.id || '-'}</span>
          <span className={`inline-flex items-center rounded-full px-2 py-1 text-[0.68rem] font-bold ${delivery?.status === 'Delivered' ? 'bg-[#cbf0ce] text-[#14722b]' : 'bg-rider-pill-red text-rider-pill-red-text'}`}>
            {delivery?.status || 'Failed'}
          </span>
        </div>
        <h2 className="m-0 mt-1.75 mb-1 text-[#0c631f] text-[2rem] font-bold">{delivery?.customer || '-'}</h2>
        <p className="m-1 text-sm text-[#4d564e] flex items-center gap-1">
          <FiMapPin size={16} />
          {delivery?.address || '-'}
        </p>
        <p className="m-1 text-sm text-[#15a63d] font-black">{delivery?.customerPhone || '-'}</p>
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
          <span className="text-[#4d564e] text-sm">{delivery?.paymentMethod || 'Paid Online'}</span>
          <strong className="text-[#116220] text-[1.6rem] font-bold">{delivery ? toCurrency(delivery.amount) : '-'}</strong>
        </div>
      </article>

      {/* Failure Message Card */}
      <article className="bg-rider-details-card rounded-xl p-3">
        <p className="m-0 text-[#116020] text-[1.05rem]">
          {delivery?.status === 'Delivered' ? 'Delivered at' : 'Failed at'} <strong>{formatMetaDateTime(delivery?.failedAt || delivery?.deliveredAt || delivery?.createdAt)}</strong>
        </p>
        <strong className={`block mt-1 text-[1.05rem] ${delivery?.status === 'Delivered' ? 'text-[#0f7a23]' : 'text-[#ff0909]'}`}>
          {delivery?.status === 'Delivered' ? 'Status: Completed' : `Reason: ${delivery?.failedReason || '-'}`}
        </strong>
      </article>
    </RiderAppLayout>
  );
}
