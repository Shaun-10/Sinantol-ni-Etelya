import { FaUserCircle } from 'react-icons/fa';

export default function AuthCard({
  title,
  children,
  footer,
  size = 'default',
}) {
  const isLarge = size === 'large';

  return (
    <section className={`fade-in-card w-full rounded-2xl bg-[#eff2e8f2] px-7 py-8 shadow-[0_22px_34px_-20px_rgba(23,85,30,0.65)] backdrop-blur-[1px] sm:px-10 sm:py-9 ${isLarge ? 'max-w-lg' : 'max-w-md'}`}>
      <div className={`mx-auto flex w-full flex-col items-center ${isLarge ? 'max-w-sm' : 'max-w-xs'}`}>
        <FaUserCircle className="text-5xl text-[#083813]" />
        <h1 className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#1c2e23]">
          {title}
        </h1>

        <div className="mt-5 w-full">{children}</div>

        {footer ? <div className="mt-4 text-center text-sm text-[#222]">{footer}</div> : null}
      </div>
    </section>
  );
}
