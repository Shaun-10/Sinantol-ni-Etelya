import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let riderSupabaseClient: SupabaseClient | null = null;

export function hasRiderSupabaseConfig(): boolean {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}

export function getRiderSupabaseClient(): SupabaseClient | null {
  if (riderSupabaseClient) {
    return riderSupabaseClient;
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  riderSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return riderSupabaseClient;
}
