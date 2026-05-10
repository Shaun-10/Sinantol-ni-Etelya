import React, { ReactNode } from 'react';
import { FiChevronLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import RiderBottomNav from './RiderBottomNav';

interface RiderAppLayoutProps {
  pageTitle?: string;
  children: ReactNode;
  showBack?: boolean;
  backTo?: string;
  headerRight?: ReactNode;
  headerContent?: ReactNode;
}

export default function RiderAppLayout({
  pageTitle,
  children,
  showBack = false,
  backTo = '/rider/home',
  headerRight,
  headerContent,
}: RiderAppLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="rider-app-shell">
      <div className="max-w-[430px] w-full min-h-screen mx-auto bg-rider-bg border-l border-r border-[#d2d2d2] flex flex-col rider-frame">
        <header className="rider-top-shell">
          {headerContent ? (
            headerContent
          ) : (
            <>
              {showBack ? (
                <button
                  type="button"
                  className="mb-2.5 inline-flex items-center gap-1 border-none bg-transparent text-sm font-bold text-[#475047] cursor-pointer"
                  onClick={() => navigate(backTo)}
                >
                  <FiChevronLeft aria-hidden="true" />
                  Back
                </button>
              ) : null}

              {pageTitle ? <h1 className="m-0 text-[1.6rem] font-medium text-rider-text-gray">{pageTitle}</h1> : null}

              {headerRight ? <div className="mt-1">{headerRight}</div> : null}
            </>
          )}
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto p-3 pb-5">{children}</main>

        <RiderBottomNav />
      </div>
    </div>
  );
}
