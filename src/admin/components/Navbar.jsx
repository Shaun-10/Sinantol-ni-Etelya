import {
  FiBell,
  FiChevronDown,
  FiChevronRight,
  FiMoreVertical,
  FiSearch,
  FiUser,
} from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();

  const pageLabel = (() => {
    if (pathname.startsWith('/orders')) return 'Orders';
    if (pathname.startsWith('/riders')) return 'Riders';
    if (pathname.startsWith('/sales')) return 'Sales';
    return null;
  })();

  return (
    <header className="dashboard-navbar">
      <div className="dashboard-navbar-left">
        <div className="dashboard-logo-box">
          <img src="/images/logo.png" alt="Sinantol ni Etelya logo" className="dashboard-logo-image" />
        </div>

        <div className="dashboard-title-wrap">
          <h1>Dashboard</h1>
          {pageLabel && (
            <>
              <FiChevronRight aria-hidden="true" />
              <h2 className="layout-subtitle">{pageLabel}</h2>
            </>
          )}
        </div>
      </div>

      <label className="dashboard-search" htmlFor="layout-search-input">
        <FiSearch aria-hidden="true" />
        <input id="layout-search-input" type="text" placeholder="Search" />
      </label>

      <div className="dashboard-navbar-right">
        <button type="button" className="navbar-label-btn" aria-label="Open filter menu">
          Label
          <FiChevronDown aria-hidden="true" />
        </button>

        <button type="button" className="icon-btn" aria-label="Notifications">
          <FiBell />
        </button>

        <div className="admin-chip" role="button" tabIndex={0}>
          <div className="avatar-circle" aria-hidden="true">
            <FiUser />
          </div>
          <span>Admin</span>
        </div>

        <button type="button" className="icon-btn" aria-label="More actions">
          <FiMoreVertical />
        </button>
      </div>
    </header>
  );
}
