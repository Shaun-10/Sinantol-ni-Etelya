import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@lib/supabase';

interface AdminProtectedRouteProps {
  children: ReactNode;
}

type AccessState = 'loading' | 'allowed' | 'denied' | 'not-configured';

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const [accessState, setAccessState] = useState<AccessState>('loading');

  useEffect(() => {
    if (!supabase) {
      setAccessState('not-configured');
      return;
    }

    let isMounted = true;

    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
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
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
      <div className="min-h-screen grid place-items-center bg-gray-50 text-gray-700">
        Checking admin session...
      </div>
    );
  }

  if (accessState === 'not-configured') {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50 text-gray-700 px-6 text-center">
        <div>
          <h1 className="text-xl font-bold mb-2">Supabase is not configured</h1>
          <p className="m-0">Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable admin auth.</p>
        </div>
      </div>
    );
  }

  if (accessState === 'denied') {
    return <Navigate to="/login" replace state={{ message: 'Please log in to continue.' }} />;
  }

  return <>{children}</>;
}
