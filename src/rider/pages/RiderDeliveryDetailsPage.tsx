import React from 'react';
import { FiMapPin, FiNavigation } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import RiderAppLayout from '../components/RiderAppLayout';

export default function RiderDeliveryDetailsPage() {
  const navigate = useNavigate();

  return (
    <RiderAppLayout showBack backTo="/rider/deliveries">
      {/* Customer Details Card */}
      <article className="bg-rider-details-card rounded-xl p-3 mb-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[#7d8480] text-xs font-bold">-</span>
          <span className="inline-flex items-center rounded-full px-2 py-1 text-[0.68rem] font-bold bg-rider-pill-yellow text-rider-pill-yellow-text">
            In Progress
          </span>
        </div>
        <h2 className="m-0 mt-1.75 mb-1 text-[#0c631f] text-[2rem] font-bold">-</h2>
        <p className="m-1 text-sm text-[#4d564e] flex items-center gap-1">
          <FiMapPin size={16} />
          -
        </p>
        <p className="m-1 text-sm text-[#15a63d] font-black">-</p>
        <div className="mt-2 bg-[#9f9f9f] rounded text-[#dedede] px-2.25 py-1.75 text-sm flex items-center gap-1.25">
          <FiNavigation size={16} />
          -
        </div>
      </article>

      {/* Order Items Card */}
      <article className="bg-rider-details-card rounded-xl p-3 mb-3">
        <h3 className="m-0 mb-1.5 text-[#4b534d] text-sm font-bold">ORDER ITEMS</h3>
        <ul className="m-0 pl-4.5">
          <li className="mb-1 text-[#3d453f] text-sm">-</li>
        </ul>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[#4d564e] text-sm">Cash on Delivery</span>
          <strong className="text-[#116220] text-[1.6rem] font-bold">-</strong>
        </div>
      </article>

      {/* Payment Options Card */}
      <article className="bg-rider-details-card rounded-xl p-3 mb-3">
        <h3 className="m-0 mb-1.5 text-[#4b534d] text-sm font-bold">PAYMENT OPTIONS</h3>
        <button
          type="button"
          className="w-full border-none rounded-lg bg-[#96d68f] text-[#108426] px-3 py-3 font-black cursor-pointer hover:opacity-90"
          onClick={() => navigate('/rider/deliveries/payment')}
        >
          Switch to e-Payment (GCash/Maya)
        </button>
      </article>

      {/* Map Button */}
      <button
        type="button"
        className="w-full border-none rounded-[11px] bg-[#707070] text-[#e9e9e9] px-4 py-3.25 text-[1.05rem] mb-3 font-bold cursor-pointer hover:opacity-90"
      >
        Navigate with Google Maps
      </button>

      {/* Result Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className="border-none rounded-[10px] px-3 py-3 font-black bg-[#8fd98d] text-[#0c8f2d] cursor-pointer hover:opacity-90"
          onClick={() => navigate('/rider/deliveries/delivered')}
        >
          Delivered
        </button>
        <button type="button" className="border-none rounded-[10px] px-3 py-3 font-black bg-[#ef8f8f] text-[#f21f1f] cursor-pointer hover:opacity-90">
          Failed
        </button>
      </div>
    </RiderAppLayout>
  );
}
