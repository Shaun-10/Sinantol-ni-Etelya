import { IconType } from "react-icons";
import { FiBox, FiGrid, FiShoppingBag, FiTruck } from "react-icons/fi";
import { NavLink } from "react-router-dom";

interface NavItem {
  label: string;
  icon: IconType;
  to?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: FiGrid, to: "/dashboard" },
  { label: "Orders", icon: FiShoppingBag, to: "/orders" },
  { label: "Riders", icon: FiTruck, to: "/riders" },
  { label: "Sales", icon: FiBox, to: "/sales" },
];

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar-shell">
      <nav aria-label="Admin navigation" className="admin-sidebar-nav">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const ItemIcon = item.icon;

            if (item.to) {
              return (
                <li key={item.label}>
                  <NavLink
                    to={item.to}
                    end
                    className={({ isActive }) =>
                      `admin-sidebar-link ${isActive ? "active" : ""}`
                    }
                  >
                    <ItemIcon className="h-5 w-5" aria-hidden="true" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            }

            return (
              <li key={item.label}>
                <button
                  type="button"
                  className="admin-sidebar-button"
                  aria-label={`${item.label} section`}
                >
                  <ItemIcon className="h-5 w-5" aria-hidden="true" />
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
