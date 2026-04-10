import { FiClock, FiHome, FiList, FiUser } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'Home', path: '/rider/home', icon: FiHome },
  { label: 'Deliveries', path: '/rider/deliveries', icon: FiList },
  { label: 'History', path: '/rider/history', icon: FiClock },
  { label: 'Profile', path: '/rider/profile', icon: FiUser },
];

export default function RiderBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
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
            className={`rider-nav-item ${active ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            aria-current={active ? 'page' : undefined}
          >
            <Icon aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
