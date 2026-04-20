import React from 'react';
import { FiClock, FiHome, FiList, FiUser } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number }>;
}

const navItems: NavItem[] = [
  { label: 'Home', path: '/rider/home', icon: FiHome },
  { label: 'Deliveries', path: '/rider/deliveries', icon: FiList },
  { label: 'History', path: '/rider/history', icon: FiClock },
  { label: 'Profile', path: '/rider/profile', icon: FiUser },
];

export default function RiderBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/rider/deliveries') return location.pathname.startsWith('/rider/deliveries');
    if (path === '/rider/history') return location.pathname.startsWith('/rider/history');
    return location.pathname === path;
  };

  return (
    <nav className="mt-auto border-t border-[#bfc8bf] bg-rider-nav-bg p-[8px_10px_9px] grid grid-cols-4 gap-0.5" aria-label="Rider main navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);

        return (
          <button
            key={item.path}
            type="button"
            className={`border-none bg-transparent text-[#1f2b22] flex flex-col items-center gap-0.75 text-[0.66rem] font-bold cursor-pointer ${
              active ? 'text-rider-nav-active' : ''
            }`}
            onClick={() => navigate(item.path)}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={22} aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
