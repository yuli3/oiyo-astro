import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
  big5Type?: null | string;
  birthDate: null | string;
  birthTime?: null | string;
  bloodType?: "A" | "AB" | "B" | "O" | null;
  gender?: "female" | "male" | null;
  hobbies?: string[];
  hspType?: null | string;
  mbtiType: null | string;
  name?: null | string;
  riasecCode: null | string;
  tciType?: null | string;
  tier?: UserTier;
  zodiacSign: null | string;
}

export type UserTier = "FREE" | "OFFERING" | "SUBSCRIBER";

interface UserState {
  clearProfile: () => void;
  isInitialized: boolean;

  profile: UserProfile;
  setBirthDate: (date: string) => void;
  setInitialized: (val: boolean) => void;
  setMbtiType: (type: string) => void;
  // Actions
  setProfile: (profile: Partial<UserProfile>) => void;
  setRiasecCode: (code: string) => void;
  setTier: (tier: UserTier) => void;
  setZodiacSign: (sign: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      clearProfile: () =>
        set({
          profile: {
            big5Type: null,
            birthDate: null,
            birthTime: null,
            bloodType: null,
            gender: null,
            hspType: null,
            mbtiType: null,
            name: null,
            riasecCode: null,
            tciType: null,
            tier: "FREE",
            zodiacSign: null,
          },
        }),
      isInitialized: false,

      profile: {
        big5Type: null,
        birthDate: null,
        birthTime: null,
        bloodType: null,
        gender: null,
        hspType: null,
        mbtiType: null,
        name: null,
        riasecCode: null,
        tciType: null,
        tier: "FREE",
        zodiacSign: null,
      },

      setBirthDate: (date) =>
        set((state) => ({
          profile: { ...state.profile, birthDate: date },
        })),

      setInitialized: (val) => set({ isInitialized: val }),

      setMbtiType: (type) =>
        set((state) => ({
          profile: { ...state.profile, mbtiType: type },
        })),

      setProfile: (updates) =>
        set((state) => ({
          profile: { ...state.profile, ...updates },
        })),

      setRiasecCode: (code) =>
        set((state) => ({
          profile: { ...state.profile, riasecCode: code },
        })),

      setTier: (tier) =>
        set((state) => ({
          profile: { ...state.profile, tier },
        })),

      setZodiacSign: (sign) =>
        set((state) => ({
          profile: { ...state.profile, zodiacSign: sign },
        })),
    }),
    {
      name: "oiyo_user_state", // Storage key
    },
  ),
);
