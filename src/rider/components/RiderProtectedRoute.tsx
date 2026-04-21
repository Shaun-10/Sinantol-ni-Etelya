import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getRiderSupabaseClient, hasRiderSupabaseConfig } from '../lib/supabaseClient';

interface RiderProtectedRouteProps {
  children: ReactNode;
}

type AccessState = 'loading' | 'allowed' | 'denied' | 'not-configured';

export default function RiderProtectedRoute({ children }: RiderProtectedRouteProps) {
  const [accessState, setAccessState] = useState<AccessState>('loading');

  useEffect(() => {
    if (!hasRiderSupabaseConfig()) {
      setAccessState('not-configured');
      return;
    }

    const client = getRiderSupabaseClient();
    if (!client) {
      setAccessState('not-configured');
      return;
    }

    let isMounted = true;

    const checkSession = async () => {
      const { data, error } = await client.auth.getSession();
      if (!isMounted) {
        return;
      }

      if (error) {
        setAccessState('denied');
        return;
      }

      setAccessState(data.session ? 'allowed' : 'denied');
    };

    checkSession();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setAccessState(session ? 'allowed' : 'denied');
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (accessState === 'loading') {
    return (
      <div className="min-h-screen grid place-items-center bg-rider-bg text-rider-text-main">
        Checking rider session...
      </div>
    );
  }

  if (accessState === 'not-configured') {
    return (
      <div className="min-h-screen grid place-items-center bg-rider-bg text-rider-text-main px-6 text-center">
        <div>
          <h1 className="text-xl font-bold mb-2">Supabase is not configured</h1>
          <p className="m-0">Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable rider auth.</p>
        </div>
      </div>
    );
  }

  if (accessState === 'denied') {
    return <Navigate to="/rider/login" replace state={{ message: 'Please log in to continue.' }} />;
  }

  return <>{children}</>;
}
