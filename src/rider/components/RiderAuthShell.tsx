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
    <div className="rider-auth-shell">
      <div className="rider-auth-hero">
        <div className="rider-auth-badge">
          <img src="/images/logo_delivery.png" alt="Delivery ni Etelya" className="w-32 h-auto object-contain" />
        </div>
      </div>

      <div className="rider-auth-card">
        <div className="rider-auth-panel fade-in-card">
          <div className="w-full">
            {title && <h1 className="hidden">{title}</h1>}
            {subtitle && <p className="hidden">{subtitle}</p>}
            {children}
            {footer && <div className="rider-auth-footer">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
