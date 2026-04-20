import React, { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RiderAuthShell from '../components/RiderAuthShell';

export default function RiderSignupPage() {
  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate('/rider/login');
  };

  return (
    <RiderAuthShell
      title="RIDER SIGN UP"
      subtitle="Create your rider account to start accepting deliveries."
      footer={
        <p>
          Already have an account? <Link to="/rider/login" className="text-[#0a6d1d] font-black no-underline hover:underline">Login</Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="w-full">
        <div className="mb-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            autoComplete="email"
            className="w-full border border-rider-field-border rounded bg-rider-field-bg px-2.5 py-3 text-sm text-rider-field-text focus:outline-none focus:border-[#31a641]"
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            autoComplete="username"
            className="w-full border border-rider-field-border rounded bg-rider-field-bg px-2.5 py-3 text-sm text-rider-field-text focus:outline-none focus:border-[#31a641]"
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            name="password"
            placeholder="Password"
            autoComplete="new-password"
            className="w-full border border-rider-field-border rounded bg-rider-field-bg px-2.5 py-3 text-sm text-rider-field-text focus:outline-none focus:border-[#31a641]"
          />
        </div>
        <button
          type="submit"
          className="w-full border border-rider-btn-border rounded-full px-4 py-3 bg-rider-btn-bg text-rider-btn-text font-black text-[1.05rem] shadow-rider-btn cursor-pointer hover:opacity-90"
        >
          Sign Up
        </button>
      </form>
    </RiderAuthShell>
  );
}
