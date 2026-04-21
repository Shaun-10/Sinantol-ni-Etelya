import React, { FormEvent, useMemo, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import RiderAuthShell from '../../components/RiderAuthShell';
import { getRiderSupabaseClient, hasRiderSupabaseConfig } from '../../lib/supabaseClient';

export default function RiderLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const normalizedEmail = email.replace(/\s+/g, '').toLowerCase();

  const infoMessage = useMemo(() => {
    const state = location.state as { message?: string } | null;
    return state?.message ?? null;
  }, [location.state]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage(null);

    if (!hasRiderSupabaseConfig()) {
      setErrorMessage('Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      return;
    }

    const client = getRiderSupabaseClient();
    if (!client) {
      setErrorMessage('Unable to initialize Supabase client. Check your environment values.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await client.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    navigate('/rider/home');
  };

  return (
    <RiderAuthShell
      title="RIDER LOGIN"
      subtitle="Sign in to receive delivery tasks and manage your shift."
      footer={
        <p>
          Need a rider account? <Link to="/rider/signup" className="text-[#0a6d1d] font-black no-underline hover:underline">Sign Up</Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="w-full">
        {infoMessage ? (
          <p className="mb-3 rounded border border-[#9dc9a3] bg-[#eef9ef] p-2 text-xs text-[#1a5f28]">{infoMessage}</p>
        ) : null}
        {errorMessage ? (
          <p className="mb-3 rounded border border-[#d99a9a] bg-[#fff0f0] p-2 text-xs text-[#9b1d1d]">{errorMessage}</p>
        ) : null}
        <div className="mb-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value.replace(/\s+/g, ''))}
            className="w-full border border-rider-field-border rounded bg-rider-field-bg px-2.5 py-3 text-sm text-rider-field-text focus:outline-none focus:border-[#31a641]"
            required
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            name="password"
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full border border-rider-field-border rounded bg-rider-field-bg px-2.5 py-3 text-sm text-rider-field-text focus:outline-none focus:border-[#31a641]"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full border border-rider-btn-border rounded-full px-4 py-3 bg-rider-btn-bg text-rider-btn-text font-black text-[1.05rem] shadow-rider-btn cursor-pointer hover:opacity-90"
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </RiderAuthShell>
  );
}
