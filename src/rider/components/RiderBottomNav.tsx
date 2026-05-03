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
    <nav className="rider-bottom-nav" aria-label="Rider main navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);

        return (
          <button
            key={item.path}
            type="button"
            className={active ? 'is-active' : ''}
            aria-current={active ? 'page' : undefined}
            onClick={() => navigate(item.path)}
          >
            <Icon size={22} aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
