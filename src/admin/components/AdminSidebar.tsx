import { NavLink } from "react-router-dom";
import { IconType } from "react-icons";
import { FiBox, FiGrid, FiShoppingBag, FiTruck } from "react-icons/fi";

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
    <aside className="w-64 border-r border-gray-200 bg-white">
      <nav aria-label="Admin navigation" className="p-4">
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
                      `flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition ${
                        isActive
                          ? "bg-green-50 text-green-700 border-l-4 border-green-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`
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
                  className="w-full flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
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
