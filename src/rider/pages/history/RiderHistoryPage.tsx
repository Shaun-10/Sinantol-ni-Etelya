import React, { useEffect, useMemo, useState } from 'react';
import { FiChevronRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import RiderAppLayout from '../../components/RiderAppLayout';
import { formatMetaDateTime, getRiderDeliveries, toCurrency, type RiderDelivery } from '../../lib/riderData';

interface HistoryItem {
  id: string;
  customer: string;
  address: string;
  amount: string;
  status: 'Delivered' | 'Failed';
  meta: string;
}

export default function RiderHistoryPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      const deliveries = await getRiderDeliveries();
      const history = deliveries
        .filter((item) => item.status === 'Delivered' || item.status === 'Failed')
        .map((item: RiderDelivery) => ({
          id: item.id,
          customer: item.customer,
          address: item.address,
          amount: toCurrency(item.amount),
          status: item.status,
          meta: formatMetaDateTime(item.deliveredAt || item.failedAt || item.createdAt),
        }));

      setHistoryItems(history);
      setIsLoading(false);
    };

    loadHistory();
  }, []);

  const totalCodCollected = useMemo(() => {
    return historyItems
      .filter((item) => item.status === 'Delivered')
      .reduce((sum, item) => sum + Number(item.amount.replace(/[^\d.-]/g, '')), 0);
  }, [historyItems]);

  return (
    <RiderAppLayout showBack backTo="/rider/home">
      {/* Totals Card */}
      <article className="border border-[#27a842] rounded-xl bg-[#d9dfd9] px-4 py-3.25 flex items-center justify-between mb-3.5">
        <div>
          <p className="m-0 text-[#1f2e22] text-sm">Total COD Collected</p>
          <strong className="block mt-0.75 text-[#0d7421] text-[2rem] font-bold">{toCurrency(totalCodCollected)}</strong>
        </div>
        <div className="text-right">
          <span className="text-[#1f2e22] text-sm">Deliveries</span>
          <strong className="block mt-0.75 text-[#0d7421] text-[2rem] font-bold">{historyItems.length}</strong>
        </div>
      </article>

      {isLoading ? <p className="m-0 mb-3 text-sm text-[#586259]">Loading history...</p> : null}

      {/* History Items */}
      <div className="flex flex-col gap-3">
        {historyItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className="w-full border-none bg-rider-history-bg rounded-xl px-3 py-3 flex items-center justify-between text-left text-[#232e24] cursor-pointer hover:opacity-90"
            onClick={() => navigate(`/rider/history/details?id=${encodeURIComponent(item.id)}`)}
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
