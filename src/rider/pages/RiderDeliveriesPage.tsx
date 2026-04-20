import React from 'react';
import { FiChevronRight, FiNavigation, FiPhone } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import RiderAppLayout from '../components/RiderAppLayout';

interface DeliveryItem {
  id: string;
  customer: string;
  status: 'Delivered' | 'Failed';
  time: string;
}

interface ActiveDelivery {
  id: string;
  customer: string;
  address: string;
  distance: string;
  eta: string;
  amount: string;
}

const activeDelivery: ActiveDelivery = {
  id: 'DEL-003',
  customer: 'Ana Reyes',
  address: '789 Mabini Blvd, Brgy. Ermita, Manila',
  distance: '0.8 km',
  eta: 'ETA 3 min',
  amount: 'COD P290',
};

const completedDeliveries: DeliveryItem[] = [
  { id: 'DEL-002', customer: 'Maria Santos', status: 'Delivered', time: '01:45 PM' },
  { id: 'DEL-001', customer: 'Juan Dela Cruz', status: 'Failed', time: '01:45 AM' },
  { id: 'DEL-000', customer: 'Pedro Garcia', status: 'Delivered', time: '02:15 PM' },
  { id: 'DEL-104', customer: 'Rosa Mendoza', status: 'Delivered', time: '01:42 PM' },
  { id: 'DEL-103', customer: 'Carlo Tan', status: 'Failed', time: '12:30 PM' },
];

export default function RiderDeliveriesPage() {
  const navigate = useNavigate();

  return (
    <RiderAppLayout>
      <section className="w-full">
        <h2 className="m-0 mb-3.5 text-[#166723] text-[2.2rem] font-bold">Deliveries</h2>

        {/* Next Best Stop Card */}
        <article
          className="border-2 border-rider-next-stop-border rounded-xl bg-rider-next-stop-bg p-2.5 cursor-pointer hover:opacity-90"
          role="button"
          tabIndex={0}
          onClick={() => navigate('/rider/deliveries/details')}
        >
          <p className="m-0 text-rider-next-stop-label text-xs font-black">NEXT BEST STOP - {activeDelivery.distance}</p>
          <h3 className="m-0 mt-1.25 text-rider-next-stop-green text-[1.9rem] font-bold">{activeDelivery.customer}</h3>
          <p className="m-0.5 text-[#5b615c] text-sm">{activeDelivery.address}</p>
          <div className="flex items-center gap-1.75 flex-wrap mt-1.75">
            <span className="inline-flex items-center rounded-full px-2 py-1 text-[0.68rem] font-bold bg-rider-pill-yellow text-rider-pill-yellow-text">
              In Progress
            </span>
            <span className="inline-flex items-center rounded-full px-2 py-1 text-[0.68rem] font-bold bg-rider-pill-green text-rider-pill-green-text">
              {activeDelivery.amount}
            </span>
            <span className="text-[#596259] text-sm">{activeDelivery.eta}</span>
          </div>
        </article>

        {/* Active Section */}
        <div className="m-4 mb-2.5 text-[#505b50] text-base font-black">ACTIVE (1)</div>
        <article className="bg-rider-item-bg rounded-xl p-2.5 flex justify-between gap-2.5">
          <div className="min-w-0">
            <h4 className="m-0 text-[1.35rem] text-[#116120] font-black">{activeDelivery.customer}</h4>
            <p className="m-0 mt-0.75 text-[0.76rem] text-[#5a625c]">2</p>
            <p className="m-0 mt-0.75 text-[0.76rem] text-[#5a625c]">{activeDelivery.address}</p>
            <div className="flex items-center gap-1.75 flex-wrap mt-1.75">
              <span className="inline-flex items-center rounded-full px-2 py-1 text-[0.68rem] font-bold bg-rider-pill-yellow text-rider-pill-yellow-text">
                In Progress
              </span>
              <span className="inline-flex items-center rounded-full px-2 py-1 text-[0.68rem] font-bold bg-rider-pill-green text-rider-pill-green-text">
                {activeDelivery.amount}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end justify-between flex-shrink-0">
            <span className="text-[#596259] text-sm">{activeDelivery.distance}</span>
            <button
              type="button"
              className="w-9 h-9 border-none rounded-full bg-rider-icon-circle text-[#223422] grid place-items-center cursor-pointer hover:opacity-90"
              onClick={() => navigate('/rider/deliveries/details')}
            >
              <FiPhone size={18} />
            </button>
          </div>
        </article>

        {/* Completed Section */}
        <div className="m-4 mb-2.5 text-[#505b50] text-base font-black">COMPLETED (5)</div>
        <div className="flex flex-col gap-3">
          {completedDeliveries.map((item) => (
            <button
              key={item.id}
              type="button"
              className="w-full border-none bg-rider-history-bg rounded-xl px-3 py-2.5 flex items-center justify-between text-left text-[#232e24] cursor-pointer hover:opacity-90"
              onClick={() => navigate('/rider/history/details')}
            >
              <div className="min-w-0 flex-1">
                <h4 className="m-0 text-[1.5rem] text-[#0f6420] font-black">{item.customer}</h4>
                <div className="flex items-center gap-2.25 text-[0.76rem] mt-0.75">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 font-bold ${
                      item.status === 'Delivered'
                        ? 'bg-[#cbf0ce] text-[#14722b]'
                        : 'bg-[#ffd5d5] text-[#d12525]'
                    }`}
                  >
                    {item.status}
                  </span>
                  <span>{item.time}</span>
                </div>
              </div>
              <FiChevronRight size={20} />
            </button>
          ))}
        </div>
      </section>
    </RiderAppLayout>
  );
}
