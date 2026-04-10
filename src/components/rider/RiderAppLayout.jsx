import { FiChevronLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import RiderBottomNav from './RiderBottomNav';

export default function RiderAppLayout({
  pageTitle,
  children,
  showBack = false,
  backTo = '/rider/home',
  headerRight,
}) {
  const navigate = useNavigate();

  return (
    <div className="rider-inside-page">
      <div className="rider-mobile-shell">
        <header className="rider-page-header">
          {showBack ? (
            <button type="button" className="rider-back-btn" onClick={() => navigate(backTo)}>
              <FiChevronLeft aria-hidden="true" />
              Back
            </button>
          ) : null}

          {pageTitle ? <h1>{pageTitle}</h1> : null}

          {headerRight ? <div className="rider-header-right">{headerRight}</div> : null}
        </header>

        <main className="rider-page-content">{children}</main>

        <RiderBottomNav />
      </div>
    </div>
  );
}
