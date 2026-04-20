import React, { ReactNode } from 'react';

interface RiderAuthShellProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function RiderAuthShell({
  title,
  subtitle,
  children,
  footer,
}: RiderAuthShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rider-hero to-rider-bg text-rider-text">
      <div className="relative h-[230px] border-b border-rider-border">
        <div className="absolute left-1/2 bottom-[-58px] -translate-x-1/2 w-40 h-40 rounded-full bg-softWhite shadow-rider-badge grid place-items-center">
          <img src="/images/logo.png" alt="" className="w-24 h-24 object-contain" />
        </div>
      </div>

      <div className="px-6 pt-[84px] pb-9">
        <div className="max-w-[420px] w-full mx-auto">
          <div className="w-full">
            {title && <h1 className="hidden">{title}</h1>}
            {subtitle && <p className="hidden">{subtitle}</p>}
            {children}
            {footer && <div className="mt-3.5 text-center text-sm text-[#506053]">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
