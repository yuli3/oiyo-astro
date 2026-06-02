import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UserProfile {
  age?: number;
  colorTone?: string;
  currentFocus?: "career" | "growth" | "relationships" | "wealth" | "wellness";
  enneagram?: string;
  isPremium?: boolean;
  lifeStage?: "20s" | "30s" | "40s+";
  mbti?: string;
  moneyType?: string;
  subscriptionStatus?: "active" | "expired" | "none";
  zodiac?: string;
}

interface UserState {
  addResult: (result: UserTestResult) => void;
  hasLoaded: boolean;
  initialize: (userId?: string) => void;
  profile: UserProfile;

  reset: () => void;
  results: UserTestResult[];
  sessionId: null | string;
  // Actions
  setProfile: (profile: Partial<UserProfile>) => void;
  setResults: (results: UserTestResult[]) => void;
  setSessionId: (id: string) => void;
  syncWithCloud: (userId: string) => Promise<void>;
}

interface UserTestResult {
  result: any;
  test_slug: string;
  timestamp: string;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      addResult: (result) =>
        set((state) => ({
          results: [result, ...state.results],
        })),
      hasLoaded: false,
      initialize: async (userId?: string) => {
        if (typeof window === "undefined") return;

        // If we have a userId, try to fetch from cloud first
        if (userId && !get().hasLoaded) {
          const { UserPersistenceService } =
            await import("@/lib/system/database/UserPersistenceService");
          const cloudProfile =
            await UserPersistenceService.fetchProfile(userId);
          if (cloudProfile) {
            set((state) => ({
              profile: { ...state.profile, ...cloudProfile },
            }));
          }
        }

        if (get().hasLoaded) return;

        // Sync with legacy localStorage if needed during transition
        const legacyMbti = localStorage.getItem("oiyo_mbti_result");
        if (legacyMbti && !get().profile.mbti) {
          try {
            const parsed = JSON.parse(legacyMbti);
            get().setProfile({ mbti: parsed.type || parsed });
          } catch {}
        }

        const legacyTests = localStorage.getItem("oiyo_user_tests");
        if (legacyTests && get().results.length === 0) {
          try {
            get().setResults(JSON.parse(legacyTests));
          } catch {}
        }

        set({ hasLoaded: true });
      },
      profile: {},

      reset: () => set({ profile: {}, results: [], sessionId: null }),

      results: [],

      sessionId: null,

      setProfile: (newProfile) =>
        set((state) => ({
          profile: { ...state.profile, ...newProfile },
        })),

      setResults: (results) => set({ results }),

      setSessionId: (sessionId) => set({ sessionId }),

      syncWithCloud: async (userId: string) => {
        const { UserPersistenceService } =
          await import("@/lib/system/database/UserPersistenceService");
        await UserPersistenceService.syncProfile(userId, get().profile);
      },
    }),
    {
      name: "oiyo-user-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
