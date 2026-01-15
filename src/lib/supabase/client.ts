import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase configuration from environment variables
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Check if Supabase credentials are configured
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Supabase client instance
 * Will be null if credentials are not configured
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Get the Supabase client, throwing an error if not configured
 * Use this when you need to guarantee Supabase is available
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
    );
  }
  return supabase;
}

/**
 * Log Supabase configuration status (only in development)
 */
if (import.meta.env.DEV) {
  if (isSupabaseConfigured) {
    console.log('[Supabase] Client configured successfully');
  } else {
    console.log('[Supabase] Not configured - using localStorage fallback');
    console.log('[Supabase] To enable cloud sync, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  }
}
