import React from 'react';
import { FiMapPin, FiNavigation } from 'react-icons/fi';
import RiderAppLayout from '../components/RiderAppLayout';

export default function RiderDeliveryDeliveredPage() {
  return (
    <RiderAppLayout showBack backTo="/rider/deliveries/details">
      {/* Customer Details Card */}
      <article className="bg-rider-details-card rounded-xl p-3 mb-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[#7d8480] text-xs font-bold">DEL-003</span>
          <span className="inline-flex items-center rounded-full px-2 py-1 text-[0.68rem] font-bold bg-rider-pill-yellow text-rider-pill-yellow-text">
            In Progress
          </span>
        </div>
        <h2 className="m-0 mt-1.75 mb-1 text-[#0c631f] text-[2rem] font-bold">Ana Reyes</h2>
        <p className="m-1 text-sm text-[#4d564e] flex items-center gap-1">
          <FiMapPin size={16} />
          789 Mabini Blvd, Brgy. Ermita, Manila
        </p>
        <p className="m-1 text-sm text-[#15a63d] font-black">+63 912 345 6789</p>
        <div className="mt-2 bg-[#9f9f9f] rounded text-[#dedede] px-2.25 py-1.75 text-sm flex items-center gap-1.25">
          <FiNavigation size={16} />
          0.8 km away - ETA 3 min
        </div>
      </article>

      {/* Order Items Card */}
      <article className="bg-rider-details-card rounded-xl p-3 mb-3">
        <h3 className="m-0 mb-1.5 text-[#4b534d] text-sm font-bold">ORDER ITEMS</h3>
        <ul className="m-0 pl-4.5">
          <li className="mb-1 text-[#3d453f] text-sm">3x Small Classic</li>
          <li className="mb-1 text-[#3d453f] text-sm">1x Bottled Spicy</li>
        </ul>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[#4d564e] text-sm">Cash on Delivery</span>
          <strong className="text-[#116220] text-[1.6rem] font-bold">P500</strong>
        </div>
      </article>

      {/* Success Message Card */}
      <article className="bg-rider-details-card rounded-xl p-3 text-[#0f6f22] text-[1.2rem]">
        Delivered at <strong>01:57 PM</strong>
      </article>
    </RiderAppLayout>
  );
}
