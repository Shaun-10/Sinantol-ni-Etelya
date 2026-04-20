import React from 'react';
import { FiMapPin } from 'react-icons/fi';
import RiderAppLayout from '../components/RiderAppLayout';

export default function RiderHistoryDetailsPage() {
  return (
    <RiderAppLayout showBack backTo="/rider/history">
      {/* Delivery Details Card */}
      <article className="bg-rider-details-card rounded-xl p-3 mb-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[#7d8480] text-xs font-bold">DEL-002</span>
          <span className="inline-flex items-center rounded-full px-2 py-1 text-[0.68rem] font-bold bg-rider-pill-red text-rider-pill-red-text">
            Failed
          </span>
        </div>
        <h2 className="m-0 mt-1.75 mb-1 text-[#0c631f] text-[2rem] font-bold">Juan Dela Cruz</h2>
        <p className="m-1 text-sm text-[#4d564e] flex items-center gap-1">
          <FiMapPin size={16} />
          456 Bonifacio St., Brgy. Poblacion, Makati
        </p>
        <p className="m-1 text-sm text-[#15a63d] font-black">+63 987 654 3210</p>
      </article>

      {/* Order Items Card */}
      <article className="bg-rider-details-card rounded-xl p-3 mb-3">
        <h3 className="m-0 mb-1.5 text-[#4b534d] text-sm font-bold">ORDER ITEMS</h3>
        <ul className="m-0 pl-4.5">
          <li className="mb-1 text-[#3d453f] text-sm">1x Large Classic</li>
          <li className="mb-1 text-[#3d453f] text-sm">2x Small Spicy</li>
        </ul>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[#4d564e] text-sm">Paid Online</span>
          <strong className="text-[#116220] text-[1.6rem] font-bold">P370</strong>
        </div>
      </article>

      {/* Failure Message Card */}
      <article className="bg-rider-details-card rounded-xl p-3">
        <p className="m-0 text-[#116020] text-[1.05rem]">
          Failed at <strong>01:45 PM</strong>
        </p>
        <strong className="block mt-1 text-[#ff0909] text-[1.05rem]">Reason: Customer not available</strong>
      </article>
    </RiderAppLayout>
  );
}
