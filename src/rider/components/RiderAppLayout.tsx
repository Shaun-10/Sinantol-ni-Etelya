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
}

export default function RiderAppLayout({
  pageTitle,
  children,
  showBack = false,
  backTo = '/rider/home',
  headerRight,
}: RiderAppLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-rider-bg text-rider-text">
      <div className="max-w-[430px] w-full min-h-screen mx-auto bg-rider-bg border-l border-r border-[#d2d2d2] flex flex-col">
        <header className="p-3 pb-2 border-b border-[#d4d4d4]">
          {showBack ? (
            <button
              type="button"
              className="border-none bg-transparent text-[#475047] inline-flex items-center gap-1 text-sm font-bold mb-2.5 cursor-pointer"
              onClick={() => navigate(backTo)}
            >
              <FiChevronLeft aria-hidden="true" />
              Back
            </button>
          ) : null}

          {pageTitle ? <h1 className="m-0 text-rider-text-gray text-[1.6rem] font-medium">{pageTitle}</h1> : null}

          {headerRight ? <div className="mt-1">{headerRight}</div> : null}
        </header>

        <main className="flex-1 p-3 pb-5 overflow-y-auto">{children}</main>

        <RiderBottomNav />
      </div>
    </div>
  );
}
