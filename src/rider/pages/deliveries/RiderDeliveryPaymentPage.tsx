import React, { useEffect, useState } from 'react';
import { FiMapPin, FiNavigation } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RiderAppLayout from '../../components/RiderAppLayout';
import { getRiderDeliveryById, markDeliveryFailed, markDeliveryPaid, toCurrency, type RiderDelivery } from '../../lib/riderData';

export default function RiderDeliveryPaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deliveryId = searchParams.get('id') ?? '';
  const [delivery, setDelivery] = useState<RiderDelivery | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

    await markDeliveryPaid(deliveryId);
    navigate(`/rider/deliveries/delivered?id=${encodeURIComponent(deliveryId)}`);
  };

  const handleFailed = async () => {
    if (!deliveryId) {
      return;
    }

    await markDeliveryFailed(deliveryId, 'Marked as failed by rider during payment');
    navigate(`/rider/history/details?id=${encodeURIComponent(deliveryId)}`);
  };

  const handleOpenGoogleMaps = () => {
    const destination = String(delivery?.address ?? '').trim();
    if (!destination) {
      return;
    }

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenInAppMap = () => {
    if (!deliveryId) {
      return;
    }

    navigate(`/rider/map?id=${encodeURIComponent(deliveryId)}`);
  };

  return (
    <RiderAppLayout showBack backTo={deliveryId ? `/rider/deliveries/details?id=${encodeURIComponent(deliveryId)}` : '/rider/deliveries/details'}>
      {isLoading ? <p className="m-0 mb-3 text-sm text-[#5b645c]">Loading delivery...</p> : null}

      {/* Customer Details Card */}
      <article className="bg-rider-details-card rounded-xl p-3 mb-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[#7d8480] text-xs font-bold">#{delivery?.id || '-'}</span>
          <span className="inline-flex items-center rounded-full px-2 py-1 text-[0.68rem] font-bold bg-rider-pill-yellow text-rider-pill-yellow-text">
            {delivery?.status || 'In Progress'}
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

      {/* Payment Options Card */}
      <article className="bg-rider-details-card rounded-xl p-3 mb-3">
        <h3 className="m-0 mb-1.5 text-[#4b534d] text-sm font-bold">PAYMENT OPTIONS</h3>
        <div className="w-[126px] h-[126px] mx-auto mb-2.5 rounded-[10px] bg-[#a7a7a7] text-[#3f3f3f] text-[2.5rem] font-black grid place-items-center">
          QR
        </div>
        <p className="m-0 text-center text-[#2d322f] font-bold">{delivery?.customer || '-'}</p>
        <p className="m-0 text-center text-[#616a62] text-sm">Scan to pay</p>
        <p className="m-0 mb-2 text-center text-[#0d7420] text-[1.8rem] font-black">{delivery ? toCurrency(delivery.amount) : '-'}</p>
        <button
          type="button"
          className="w-full border-none rounded bg-[#a7a7a7] text-[#efefef] px-2 py-2 font-bold mb-2 cursor-pointer hover:opacity-90"
        >
          Upload Payment Proof
        </button>
        <button
          type="button"
          className="w-full border-none rounded-lg bg-[#f0df44] text-[#1a1e10] px-3 py-3 font-black cursor-pointer hover:opacity-90"
          onClick={handleConfirmPayment}
        >
          Confirm Payment Received
        </button>
      </article>

      {/* Map Button */}
      <button
        type="button"
        className="w-full border-none rounded-[11px] bg-[#707070] text-[#e9e9e9] px-4 py-3.25 text-[1.05rem] mb-3 font-bold cursor-pointer hover:opacity-90"
        onClick={handleOpenInAppMap}
        disabled={!delivery?.address}
      >
        Open In-App Map
      </button>

      <button
        type="button"
        className="w-full border border-[#7d7d7d] rounded-[11px] bg-[#ececec] text-[#3b3b3b] px-4 py-2.5 text-[0.9rem] mb-3 font-bold cursor-pointer hover:opacity-90"
        onClick={handleOpenGoogleMaps}
        disabled={!delivery?.address}
      >
        Open in Google Maps
      </button>

      {/* Result Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className="border-none rounded-[10px] px-3 py-3 font-black bg-[#8fd98d] text-[#0c8f2d] cursor-pointer hover:opacity-90"
          onClick={handleConfirmPayment}
        >
          Delivered
        </button>
        <button type="button" className="border-none rounded-[10px] px-3 py-3 font-black bg-[#ef8f8f] text-[#f21f1f] cursor-pointer hover:opacity-90" onClick={handleFailed}>
          Failed
        </button>
      </div>
    </RiderAppLayout>
  );
}
