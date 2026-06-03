// Stub: Supabase disabled in static build
export const supabase = {
  from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }) }),
  auth: { getUser: async () => ({ data: { user: null } }) },
};
