import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  migrateLegacyBirth,
  type BirthRecordV2,
} from "../birth-record";

export interface UserProfile {
  big5Type?: null | string;
  birthCityId?: null | string;
  birthDate: null | string;
  birthRecord?: BirthRecordV2 | null;
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
  saveBirthRecord: (record: BirthRecordV2) => void;
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
            birthCityId: null,
            birthDate: null,
            birthRecord: null,
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
        birthCityId: null,
        birthDate: null,
        birthRecord: null,
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

      saveBirthRecord: (record) =>
        set((state) => ({
          profile: {
            ...state.profile,
            birthDate: record.civilDate,
            birthRecord: record,
            birthTime: record.civilTime,
          },
        })),

      setBirthDate: (date) =>
        set((state) => ({
          profile: {
            ...state.profile,
            birthDate: date,
            birthRecord: migrateLegacyBirth({
              birthDate: date,
              birthTime: state.profile.birthTime,
            }),
          },
        })),

      setInitialized: (val) => set({ isInitialized: val }),

      setMbtiType: (type) =>
        set((state) => ({
          profile: { ...state.profile, mbtiType: type },
        })),

      setProfile: (updates) =>
        set((state) => {
          const profile = { ...state.profile, ...updates };
          if (
            !Object.prototype.hasOwnProperty.call(updates, "birthDate")
            && !Object.prototype.hasOwnProperty.call(updates, "birthTime")
          ) {
            return { profile };
          }
          return {
            profile: {
              ...profile,
              // A legacy writer cannot safely retain exact V2 location data
              // after changing the civil date/time. New code uses the atomic
              // saveBirthRecord action; old code becomes confirmation-required.
              birthRecord: migrateLegacyBirth({
                birthDate: profile.birthDate,
                birthTime: profile.birthTime,
              }),
            },
          };
        }),

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
      version: 2,
      migrate: (persisted, version) => {
        if (!persisted || typeof persisted !== "object") return persisted as UserState;
        const state = persisted as UserState;
        if (version >= 2 || !state.profile) return state;
        const birthRecord = migrateLegacyBirth(state.profile);
        return {
          ...state,
          profile: {
            ...state.profile,
            birthRecord,
          },
        };
      },
    },
  ),
);
