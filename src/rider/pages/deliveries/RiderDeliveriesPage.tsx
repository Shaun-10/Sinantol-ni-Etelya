import React, { useEffect, useMemo, useState } from 'react';
import { FiChevronRight, FiPhone } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import RiderAppLayout from '../../components/RiderAppLayout';
import { getRiderDeliveries, toCurrency, type RiderDelivery } from '../../lib/riderData';

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

export default function RiderDeliveriesPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [deliveries, setDeliveries] = useState<RiderDelivery[]>([]);

  useEffect(() => {
    const loadDeliveries = async () => {
      setIsLoading(true);
      const data = await getRiderDeliveries();
      setDeliveries(data);
      setIsLoading(false);
    };

    loadDeliveries();
  }, []);

  const activeDelivery = useMemo<ActiveDelivery>(() => {
    const current = deliveries.find((item) => item.status === 'In Progress');
    if (!current) {
      return {
        id: '',
        customer: '-',
        address: '-',
        distance: '-',
        eta: '-',
        amount: '-',
      };
    }

    return {
      id: current.id,
      customer: current.customer,
      address: current.address,
      distance: current.distance,
      eta: current.eta,
      amount: toCurrency(current.amount),
    };
  }, [deliveries]);

  const completedDeliveries: DeliveryItem[] = useMemo(
    () =>
      deliveries
        .filter((item) => item.status !== 'In Progress')
        .map((item) => ({
          id: item.id,
          customer: item.customer,
          status: item.status === 'Delivered' ? 'Delivered' : 'Failed',
          time: item.createdAt ? new Date(item.createdAt).toLocaleString('en-PH') : '-',
        })),
    [deliveries]
  );

  return (
    <RiderAppLayout>
      <section className="w-full">
        <h2 className="m-0 mb-3.5 text-[#166723] text-[2.2rem] font-bold">Deliveries</h2>

        {/* Next Best Stop Card */}
        <article
          className="border-2 border-rider-next-stop-border rounded-xl bg-rider-next-stop-bg p-2.5 cursor-pointer hover:opacity-90"
          role="button"
          tabIndex={0}
          onClick={() => activeDelivery.id && navigate(`/rider/deliveries/details?id=${encodeURIComponent(activeDelivery.id)}`)}
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
        <div className="m-4 mb-2.5 text-[#505b50] text-base font-black">ACTIVE ({activeDelivery.id ? 1 : 0})</div>
        <article className="bg-rider-item-bg rounded-xl p-2.5 flex justify-between gap-2.5">
          <div className="min-w-0">
            <h4 className="m-0 text-[1.35rem] text-[#116120] font-black">{activeDelivery.customer}</h4>
            <p className="m-0 mt-0.75 text-[0.76rem] text-[#5a625c]">-</p>
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
              onClick={() => activeDelivery.id && navigate(`/rider/deliveries/details?id=${encodeURIComponent(activeDelivery.id)}`)}
            >
              <FiPhone size={18} />
            </button>
          </div>
        </article>

        {isLoading ? <p className="m-4 text-sm text-[#576257]">Loading deliveries...</p> : null}

        {/* Completed Section */}
        <div className="m-4 mb-2.5 text-[#505b50] text-base font-black">COMPLETED ({completedDeliveries.length})</div>
        <div className="flex flex-col gap-3">
          {completedDeliveries.map((item) => (
            <button
              key={item.id}
              type="button"
              className="w-full border-none bg-rider-history-bg rounded-xl px-3 py-2.5 flex items-center justify-between text-left text-[#232e24] cursor-pointer hover:opacity-90"
              onClick={() => navigate(`/rider/history/details?id=${encodeURIComponent(item.id)}`)}
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
