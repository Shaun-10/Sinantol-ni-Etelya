import React, { useEffect, useState } from 'react';
import { FiMapPin, FiNavigation } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RiderAppLayout from '../../components/RiderAppLayout';
import { getRiderDeliveryById, markDeliveryDelivered, markDeliveryFailed, toCurrency, type RiderDelivery } from '../../lib/riderData';

export default function RiderDeliveryDetailsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deliveryId = searchParams.get('id') ?? '';
  const [delivery, setDelivery] = useState<RiderDelivery | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setError(`Failed to load delivery: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
        navigate(`/rider/deliveries/delivered?id=${encodeURIComponent(deliveryId)}`);
      } else {
        setError('Failed to mark delivery as delivered. Please try again.');
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFailed = async () => {
    if (!deliveryId) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const success = await markDeliveryFailed(deliveryId, 'Marked as failed by rider');
      if (success) {
        navigate(`/rider/history/details?id=${encodeURIComponent(deliveryId)}`);
      } else {
        setError('Failed to mark delivery as failed. Please try again.');
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
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
    <RiderAppLayout showBack backTo="/rider/deliveries">
      {isLoading ? <p className="m-0 mb-3 text-sm text-[#5b645c]">Loading delivery...</p> : null}

      {error && (
        <div className="mb-3 p-3 bg-[#ffe0e0] text-[#d12525] rounded-lg text-sm font-semibold">
          {error}
        </div>
      )}

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
        <button
          type="button"
          className="w-full border-none rounded-lg bg-[#96d68f] text-[#108426] px-3 py-3 font-black cursor-pointer hover:opacity-90 disabled:opacity-60"
          onClick={() => navigate(`/rider/deliveries/payment?id=${encodeURIComponent(deliveryId)}`)}
          disabled={isSubmitting}
        >
          Switch to e-Payment (GCash/Maya)
        </button>
      </article>

      {/* Map Button */}
      <button
        type="button"
        className="w-full border-none rounded-[11px] bg-[#707070] text-[#e9e9e9] px-4 py-3.25 text-[1.05rem] mb-3 font-bold cursor-pointer hover:opacity-90 disabled:opacity-60"
        onClick={handleOpenInAppMap}
        disabled={!delivery?.address || isSubmitting}
      >
        Open In-App Map
      </button>

      <button
        type="button"
        className="w-full border border-[#7d7d7d] rounded-[11px] bg-[#ececec] text-[#3b3b3b] px-4 py-2.5 text-[0.9rem] mb-3 font-bold cursor-pointer hover:opacity-90 disabled:opacity-60"
        onClick={handleOpenGoogleMaps}
        disabled={!delivery?.address || isSubmitting}
      >
        Open in Google Maps
      </button>

      {/* Result Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className="border-none rounded-[10px] px-3 py-3 font-black bg-[#8fd98d] text-[#0c8f2d] cursor-pointer hover:opacity-90 disabled:opacity-60"
          onClick={handleDelivered}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Delivered'}
        </button>
        <button
          type="button"
          className="border-none rounded-[10px] px-3 py-3 font-black bg-[#ef8f8f] text-[#f21f1f] cursor-pointer hover:opacity-90 disabled:opacity-60"
          onClick={handleFailed}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Failed'}
        </button>
      </div>
    </RiderAppLayout>
  );
}
