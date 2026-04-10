export default function RiderAuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="rider-auth-page">
      <div className="rider-auth-hero">
        <div className="rider-auth-badge" aria-hidden="true">
          <img src="/images/logo.png" alt="" />
        </div>
      </div>

      <div className="rider-auth-body">
        <div className="rider-auth-shell">
          <div className="rider-auth-panel">
            <h1 className="rider-auth-title">{title}</h1>
            {subtitle ? <p className="rider-auth-subtitle">{subtitle}</p> : null}
            {children}
            {footer ? <div className="rider-footer-link">{footer}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}