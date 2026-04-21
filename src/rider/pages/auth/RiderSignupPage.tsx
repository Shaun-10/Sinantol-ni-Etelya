import React, { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RiderAuthShell from '../../components/RiderAuthShell';
import { getRiderSupabaseClient, hasRiderSupabaseConfig } from '../../lib/supabaseClient';

export default function RiderSignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const normalizedEmail = email.replace(/\s+/g, '').toLowerCase();

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
    const { error } = await client.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          username: username.trim(),
        },
      },
    });
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    navigate('/rider/login', {
      state: {
        message: 'Signup successful. If email confirmation is enabled, verify your email before login.',
      },
    });
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
            type="text"
            name="username"
            placeholder="Username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full border border-rider-field-border rounded bg-rider-field-bg px-2.5 py-3 text-sm text-rider-field-text focus:outline-none focus:border-[#31a641]"
            required
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            name="password"
            placeholder="Password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full border border-rider-field-border rounded bg-rider-field-bg px-2.5 py-3 text-sm text-rider-field-text focus:outline-none focus:border-[#31a641]"
            required
            minLength={6}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full border border-rider-btn-border rounded-full px-4 py-3 bg-rider-btn-bg text-rider-btn-text font-black text-[1.05rem] shadow-rider-btn cursor-pointer hover:opacity-90"
        >
          {isSubmitting ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
    </RiderAuthShell>
  );
}
