import { useState, useRef, useEffect } from "react";
import { FiChevronRight, FiUser, FiLogOut } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

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

  const handleLogout = () => {
    navigate("/admin/login");
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
    <header className="admin-topbar">
      <div className="admin-topbar-brand">
        <div className="admin-topbar-logo">
          <img
            src="/images/logo.png"
            alt="Sinantol ni Etelya logo"
            className="object-contain"
          />
        </div>

        <div className="admin-topbar-title">
          <h1>Dashboard</h1>
          {pageLabel && (
            <>
              <FiChevronRight className="text-[#90a090]" aria-hidden="true" />
              <h2>{pageLabel}</h2>
            </>
          )}
        </div>
      </div>

      <div className="relative flex items-center gap-2" ref={menuRef}>
        <button
          onClick={handleAdminClick}
          className={`flex items-center gap-2 rounded-xl border px-3 py-2 cursor-pointer transition ${
            showMenu
              ? "border-[#80c28e] bg-[#edf8ef]"
              : "border-[#d7dfd4] bg-white hover:bg-[#fbfcfa]"
          }`}
          type="button"
          aria-label="Admin menu"
          aria-expanded={showMenu}
        >
          <div className={`h-6 w-6 rounded-full flex items-center justify-center transition ${
            showMenu
              ? "bg-[#1f8f38] text-white"
              : "bg-[#dff2e3] text-[#1f8f38]"
          }`}>
            <FiUser className="h-4 w-4" />
          </div>
          <span className={`text-sm font-semibold transition ${
            showMenu ? "text-[#11702b]" : "text-[#24311f]"
          }`}>Admin</span>
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-[#d6dfd0] bg-white shadow-[0_16px_34px_rgba(34,48,25,0.16)] animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="border-b border-[#eef2ea] bg-gradient-to-r from-[#ecf7ee] to-transparent p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1f8f38] text-white">
                  <FiUser className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#24311f]">Admin Account</p>
                  <p className="text-xs text-[#677368]">Administrator</p>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-[#d83d3d] transition hover:bg-[#fff1f1]"
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
