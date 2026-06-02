import { createClient } from "@supabase/supabase-js";

import { Database } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Only create the client if environment variables are available to prevent runtime crashes
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey)
    : null;

if (!supabase) {
  console.warn("Supabase credentials missing. DB features will not work.");
}
