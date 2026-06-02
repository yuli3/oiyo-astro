/**
 * Shim for @clerk/nextjs — returns no-auth state so existing code
 * that conditionally syncs to cloud degrades gracefully.
 */
export function useUser() {
  return { isLoaded: true, isSignedIn: false, user: null };
}

export function useAuth() {
  return { isLoaded: true, isSignedIn: false, userId: null, getToken: async () => null };
}

export function useClerk() {
  return { signOut: async () => {} };
}

export function SignedIn({ children }: { children: React.ReactNode }) {
  return null;
}

export function SignedOut({ children }: { children: React.ReactNode }) {
  return children as any;
}
