import React from 'react';
import { FiChevronRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import RiderAppLayout from '../components/RiderAppLayout';

interface HistoryItem {
  id: string;
  customer: string;
  address: string;
  amount: string;
  status: 'Delivered' | 'Failed';
  meta: string;
}

const historyItems: HistoryItem[] = [];

export default function RiderHistoryPage() {
  const navigate = useNavigate();

  return (
    <RiderAppLayout showBack backTo="/rider/home">
      {/* Totals Card */}
      <article className="border border-[#27a842] rounded-xl bg-[#d9dfd9] px-4 py-3.25 flex items-center justify-between mb-3.5">
        <div>
          <p className="m-0 text-[#1f2e22] text-sm">Total COD Collected</p>
          <strong className="block mt-0.75 text-[#0d7421] text-[2rem] font-bold">P0</strong>
        </div>
        <div className="text-right">
          <span className="text-[#1f2e22] text-sm">Deliveries</span>
          <strong className="block mt-0.75 text-[#0d7421] text-[2rem] font-bold">0</strong>
        </div>
      </article>

      {/* History Items */}
      <div className="flex flex-col gap-3">
        {historyItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className="w-full border-none bg-rider-history-bg rounded-xl px-3 py-3 flex items-center justify-between text-left text-[#232e24] cursor-pointer hover:opacity-90"
            onClick={() => navigate('/rider/history/details')}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 mb-0.75">
                <h4 className="m-0 text-[1.5rem] text-[#0f6420] font-black">{item.customer}</h4>
                <strong className="text-[#116321] text-[2rem] font-bold flex-shrink-0">{item.amount}</strong>
              </div>
              <p className="m-0 text-sm text-[#5c635d] mb-1">{item.address}</p>
              <div className="flex items-center gap-2.25 text-[0.76rem]">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 font-bold ${
                    item.status === 'Delivered'
                      ? 'bg-[#cbf0ce] text-[#14722b]'
                      : 'bg-[#ffd5d5] text-[#d12525]'
                  }`}
                >
                  {item.status}
                </span>
                <span>{item.meta}</span>
              </div>
            </div>
            <FiChevronRight size={20} className="flex-shrink-0 ml-2" />
          </button>
        ))}
      </div>
    </RiderAppLayout>
  );
}
