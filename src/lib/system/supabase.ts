// Supabase Client Configuration for OIYO Personality Test Platform
import {
  createClient,
  type Session,
  type SupabaseClient as SupabaseGenericClient,
} from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import { getSecureItem, setSecureItem } from "@/lib/system/secure-storage";

type SupabaseClientLoose = Omit<SupabaseClientTyped, "from"> & {
  from: (...args: Parameters<SupabaseClientTyped["from"]>) => unknown;
};
type SupabaseClientTyped = SupabaseGenericClient<Database>;

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isConfigured && process.env.NODE_ENV !== "production") {
  console.warn(
    "[Supabase] Environment variables are missing. Public features depending on Supabase will be disabled until configuration is provided.",
  );
}

let supabaseClient: null | SupabaseClientLoose = null;
let supabaseAdminClient: null | SupabaseClientLoose = null;
let supabaseClientTyped: null | SupabaseClientTyped = null;
let supabaseAdminClientTyped: null | SupabaseClientTyped = null;

function createMissingClientProxy<T extends object>(message: string): T {
  return new Proxy(
    {},
    {
      apply() {
        throw new Error(message);
      },
      get() {
        throw new Error(message);
      },
    },
  ) as T;
}

if (isConfigured && supabaseUrl && supabaseAnonKey) {
  const publicClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

  supabaseClient = publicClient as SupabaseClientLoose;
  supabaseClientTyped = publicClient;

  if (supabaseServiceRoleKey) {
    const adminClient = createClient<Database>(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
    supabaseAdminClient = adminClient as SupabaseClientLoose;
    supabaseAdminClientTyped = adminClient;
  }
}

// Client-side Supabase client (public)
export const supabase =
  supabaseClient ??
  createMissingClientProxy<SupabaseClientLoose>(
    "[Supabase] Public client not configured",
  );

// Server-side Supabase client with service role (admin)
export const supabaseAdmin = supabaseAdminClient;

export type SupabaseAdminClient = null | SupabaseClientLoose;
// Types for convenience
export type SupabaseClient = null | SupabaseClientLoose;

// Database connection health check
export async function checkDatabaseConnection(): Promise<boolean> {
  const client = supabaseClient;
  if (!client) {
    return false;
  }
  try {
    const typedClient = client as SupabaseClientTyped;
    const { error } = await typedClient
      .from("test_categories")
      .select("count")
      .limit(1);

    return !error;
  } catch (error) {
    console.error("Database connection check failed:", error);
    return false;
  }
}

// Anonymous session management for non-authenticated users
export function generateSessionId(): string {
  return "anon_" + Math.random().toString(36).substring(2) + "_" + Date.now();
}

export async function getCurrentUser() {
  const client = supabaseClient;
  if (!client) {
    console.warn(
      "[Supabase] getCurrentUser called without configuration. Returning null.",
    );
    return null;
  }
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error) {
    console.error("Error getting user:", error);
    return null;
  }
  return user;
}

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return generateSessionId();

  const sessionKey = "oiyo_session_id";
  let sessionId = getSecureItem<null | string>(sessionKey, null);

  if (!sessionId) {
    sessionId = generateSessionId();
    setSecureItem(sessionKey, sessionId);
  }

  return sessionId;
}

// Helper functions for common operations
export async function getSession() {
  const client = supabaseClient;
  if (!client) {
    console.warn(
      "[Supabase] getSession called without configuration. Returning null.",
    );
    return null;
  }
  const {
    data: { session },
    error,
  } = await client.auth.getSession();
  if (error) {
    console.error("Error getting session:", error);
    return null;
  }
  return session;
}

export function getSupabaseAdminClientTyped(): null | SupabaseClientTyped {
  return supabaseAdminClientTyped;
}

// Typed client accessors
export function getSupabaseClientTyped(): null | SupabaseClientTyped {
  return supabaseClientTyped;
}

export function getTypedAdmin(): any {
  return supabaseAdmin;
}

// Database error handling utilities
export function handleDatabaseError(error: unknown): {
  code?: string;
  message: string;
  userMessage: string;
} {
  console.error("Database error:", error);

  const dbError = (
    typeof error === "object" && error !== null ? error : undefined
  ) as
    | undefined
    | {
        code?: string;
        message?: string;
      };

  // Common Supabase/PostgreSQL errors
  if (dbError?.code === "23505") {
    return {
      code: "DUPLICATE_KEY",
      message: dbError.message ?? "Duplicate key violation",
      userMessage: "This record already exists.",
    };
  }

  if (dbError?.code === "23503") {
    return {
      code: "FOREIGN_KEY_VIOLATION",
      message: dbError.message ?? "Foreign key violation",
      userMessage: "Referenced record does not exist.",
    };
  }

  if (dbError?.code === "42P01") {
    return {
      code: "TABLE_NOT_FOUND",
      message: dbError.message ?? "Table not found",
      userMessage: "Database table not found. Please contact support.",
    };
  }

  // Auth errors
  if (dbError?.message?.includes("JWT")) {
    return {
      code: "AUTH_ERROR",
      message: dbError.message ?? "Authentication error",
      userMessage: "Authentication error. Please sign in again.",
    };
  }

  // Network/connection errors
  if (
    dbError?.message?.includes("network") ||
    dbError?.message?.includes("connection")
  ) {
    return {
      code: "NETWORK_ERROR",
      message: dbError.message ?? "Network error",
      userMessage: "Connection error. Please check your internet connection.",
    };
  }

  // Generic error
  return {
    code: "UNKNOWN_ERROR",
    message:
      dbError?.message ??
      (error instanceof Error ? error.message : "Unknown database error"),
    userMessage: "An unexpected error occurred. Please try again.",
  };
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseClient);
}

// Type helper for working with loose Supabase client typing

// Session management helpers
export function onAuthStateChange(
  callback: (event: string, session: null | Session) => void,
) {
  const client = supabaseClient;
  if (!client) {
    console.warn(
      "[Supabase] onAuthStateChange called without configuration. Returning noop subscription.",
    );
    return {
      data: { subscription: { unsubscribe: () => undefined } },
    } as const;
  }
  return client.auth.onAuthStateChange(callback);
}

export async function signOut() {
  const client = supabaseClient;
  if (!client) {
    console.warn("[Supabase] signOut called without configuration.");
    return;
  }
  const { error } = await client.auth.signOut();
  if (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}
