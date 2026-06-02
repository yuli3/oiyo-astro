/**
 * Supabase Client Configuration
 * Creates and exports Supabase client instance
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isConfigured && process.env.NODE_ENV !== "production") {
  console.warn(
    "[Supabase] Environment variables are missing. Database features will be disabled until configuration is provided.",
  );
}

/**
 * Create Supabase client instance
 * Can be used in both client and server components
 *
 * @returns Supabase client instance or throws error if not configured
 */
export function createClient() {
  if (!isConfigured || !supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.",
    );
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });
}

/**
 * Check if Supabase is configured
 * Useful for conditional features that depend on Supabase
 */
export function isSupabaseConfigured(): boolean {
  return isConfigured;
}

/**
 * Default export for convenience
 */
export default createClient;
