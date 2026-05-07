import { useState, useRef, useEffect } from "react";
import { FiChevronRight, FiUser, FiLogOut } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@lib/supabase";

export default function AdminNavbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const pageLabel = (() => {
    if (pathname.startsWith("/orders")) return "Orders";
    if (pathname.startsWith("/riders")) return "Riders";
    if (pathname.startsWith("/sales")) return "Sales";
    return null;
  })();

  const handleAdminClick = () => {
    setShowMenu(!showMenu);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
    setShowMenu(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  return (
    <header className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="h-15 w-20 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
          <img
            src="/images/logo.png"
            alt="Sinantol ni Etelya logo"
            className="h-15 w-20 object-contain"
          />
        </div>

        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
          {pageLabel && (
            <>
              <FiChevronRight className="text-gray-400" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-gray-900">{pageLabel}</h2>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 relative" ref={menuRef}>
        <button
          onClick={handleAdminClick}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition ${
            showMenu
              ? "border-green-500 bg-green-50"
              : "border-gray-200 bg-white hover:bg-gray-50"
          }`}
          type="button"
          aria-label="Admin menu"
          aria-expanded={showMenu}
        >
          <div className={`h-6 w-6 rounded-full flex items-center justify-center transition ${
            showMenu
              ? "bg-green-500 text-white"
              : "bg-green-100 text-green-700"
          }`}>
            <FiUser className="h-4 w-4" />
          </div>
          <span className={`text-sm font-medium transition ${
            showMenu ? "text-green-700" : "text-gray-900"
          }`}>Admin</span>
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-transparent">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <FiUser className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Admin Account</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 rounded-md transition flex items-center gap-3 font-medium"
                type="button"
              >
                <FiLogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
