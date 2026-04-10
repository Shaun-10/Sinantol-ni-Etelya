export default function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f4de48] via-[#9cd233] to-[#0da220] px-4 py-10">
      <div className="auth-layer-1" />
      <div className="auth-layer-2" />

      <div className="relative z-10 flex min-h-[calc(100vh-5rem)] items-center justify-center">
        {children}
      </div>
    </div>
  );
}
