import React, { useEffect, useMemo, useState } from 'react';
import { FiBell, FiClock, FiMapPin, FiPackage, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import RiderAppLayout from '../../components/RiderAppLayout';
import { getRiderDataIssue, getRiderDeliveries, getRiderProfileData, toCurrency, type RiderDelivery } from '../../lib/riderData';

interface StatItem {
  icon: React.ComponentType<{ size?: number }>;
  value: string | number;
  label: string;
}

interface Order {
  id: string;
  customer: string;
  address: string;
  amount: string;
}

export default function RiderHomePage() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('Rider');
  const [isLoading, setIsLoading] = useState(true);
  const [dataIssue, setDataIssue] = useState<string | null>(null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<StatItem[]>([
    { icon: FiPackage, value: 0, label: 'Total Deliveries Today' },
    { icon: FiClock, value: 0, label: 'Today Pending Deliveries' },
    { icon: FiUser, value: 0, label: 'Today Completed Deliveries' },
    { icon: FiMapPin, value: toCurrency(0), label: 'COD Collected Today' },
  ]);

  const greetingName = useMemo(() => {
    return displayName.trim() || 'Rider';
  }, [displayName]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      const [profile, deliveries] = await Promise.all([getRiderProfileData(), getRiderDeliveries()]);
      setDataIssue(getRiderDataIssue());

      setDisplayName(profile.fullName || 'Rider');

      const inProgress = deliveries.filter((item) => item.status === 'In Progress');
      const completed = deliveries.filter((item) => item.status === 'Delivered');
      const totalCod = completed.reduce((sum, item) => sum + item.amount, 0);

      setStats([
        { icon: FiPackage, value: deliveries.length, label: 'Total Deliveries Today' },
        { icon: FiClock, value: inProgress.length, label: 'Today Pending Deliveries' },
        { icon: FiUser, value: completed.length, label: 'Today Completed Deliveries' },
        { icon: FiMapPin, value: toCurrency(totalCod), label: 'COD Collected Today' },
      ]);

      const topOrders: Order[] = inProgress.slice(0, 9).map((item: RiderDelivery) => ({
        id: item.id,
        customer: item.customer,
        address: item.address,
        amount: toCurrency(item.amount),
      }));

      setActiveOrders(topOrders);
      setIsLoading(false);
    };

    loadData();
  }, []);

  return (
    <RiderAppLayout
      headerContent={
        <>
          <div className="bg-[#efefef] border-t border-[#d8d8d8] border-b border-[#b8b8b8] p-2 flex items-center justify-between">
            <img
              src="/images/logo_delivery.png"
              alt="Sinantol ni Etelya Riders"
              className="w-[72px] h-11 object-contain"
            />
            <div className="flex items-center gap-2.5">
              <button type="button" className="w-7.5 h-7.5 border-none bg-transparent text-[#101810] grid place-items-center text-[1.2rem] cursor-pointer hover:opacity-75">
                <FiBell />
              </button>
              <div className="flex items-center gap-1 font-bold text-[#222]">
                <FiUser size={18} />
                Rider
              </div>
            </div>
          </div>

          <div className="px-2.5 py-2">
            <p className="m-0 text-rider-text-muted text-base">Good day,</p>
            <h2 className="m-0 mt-0.5 mb-3.5 text-3xl leading-tight text-rider-text-main font-bold">{greetingName}</h2>
          </div>
        </>
      }
    >
      {dataIssue ? (
        <p className="m-0 mb-3 rounded border border-[#e2b4b4] bg-[#fff0f0] px-3 py-2 text-xs text-[#9b1d1d]">{dataIssue}</p>
      ) : null}

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-3">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.label}
              className="bg-rider-card-bg rounded-[14px] min-h-[108px] flex flex-col items-center justify-center gap-1.25"
            >
              <span className="text-[#2d2d2d]"><Icon size={30} aria-hidden="true" /></span>
              <strong className="text-[2rem] text-rider-green-bold leading-tight">{isLoading ? '-' : item.value}</strong>
              <span className="text-[0.76rem] font-bold text-[#222]">{item.label}</span>
            </article>
          );
        })}
      </section>

      {/* Route Button */}
      <button
        type="button"
        className="w-full mt-4 border border-rider-btn-border rounded-full px-3.5 py-3.5 bg-rider-btn-yellow text-rider-green-dark text-[1.8rem] font-black shadow-rider-btn cursor-pointer hover:opacity-90"
        onClick={() => navigate('/rider/routes')}
      >
        Start Route
      </button>

      {/* Active Deliveries Section */}
      <section className="mt-5">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="m-0 text-[1.2rem] text-[#1f281f] font-bold">Active Deliveries</h3>
          <button
            type="button"
            className="border-none bg-transparent text-[#485448] text-[0.95rem] cursor-pointer hover:opacity-75"
            onClick={() => navigate('/rider/deliveries')}
          >
            View all
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {activeOrders.map((order) => (
            <button
              key={order.id}
              type="button"
              className="border-none w-full bg-rider-item-bg rounded-[14px] p-3 flex items-center gap-2.25 cursor-pointer hover:opacity-90"
              onClick={() => navigate(`/rider/deliveries/details?id=${encodeURIComponent(order.id)}`)}
            >
              <div className="min-w-0 flex-1">
                <h4 className="m-0 text-base text-rider-text-main font-bold">{order.customer}</h4>
                <p className="m-0 mt-1 text-[0.72rem] text-[#2f3e35] flex items-center gap-1">
                  <FiMapPin size={14} />
                  {order.address}
                </p>
              </div>
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <span className="inline-flex items-center rounded-full px-2 py-1 text-[0.68rem] font-bold bg-rider-pill-yellow text-rider-pill-yellow-text">
                  In Progress
                </span>
                <span className="inline-flex items-center rounded-full px-2 py-1 text-[0.68rem] font-bold bg-rider-pill-green text-rider-pill-green-text">
                  {order.amount}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </RiderAppLayout>
  );
}
