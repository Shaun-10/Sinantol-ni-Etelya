import { NavLink } from 'react-router-dom';
import {
  FiBox,
  FiGrid,
  FiMapPin,
  FiSettings,
  FiShoppingBag,
  FiTruck,
} from 'react-icons/fi';

const navItems = [
  { label: 'Dashboard', icon: FiGrid, to: '/dashboard' },
  { label: 'Orders', icon: FiShoppingBag, to: '/orders' },
  { label: 'Riders', icon: FiTruck, to: '/riders' },
  { label: 'Sales', icon: FiBox, to: '/sales' },
];

export default function Sidebar() {
  return (
    <aside className="dashboard-sidebar">
      <nav aria-label="Admin navigation">
        <ul>
          {navItems.map((item) => {
            const ItemIcon = item.icon;

            if (item.to) {
              return (
                <li key={item.label}>
                  <NavLink
                    to={item.to}
                    end
                    className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                  >
                    <ItemIcon aria-hidden="true" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            }

            return (
              <li key={item.label}>
                <button type="button" className="sidebar-item" aria-label={`${item.label} section`}>
                  <ItemIcon aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
