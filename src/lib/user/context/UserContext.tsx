"use client";

import React, { createContext, useContext, useEffect } from "react";
import type { BirthRecordV2 } from "../birth-record";
import {
  useUserStore,
  type UserProfile,
} from "../store/user-store";

export type { UserProfile, UserTier } from "../store/user-store";

interface UserContextType {
  clearProfile: () => void;
  isInitialized: boolean;
  profile: UserProfile;
  saveBirthRecord: (record: BirthRecordV2) => void;
  setBirthDate: (date: string) => void;
  setMbtiType: (type: string) => void;
  // New setters
  setProfileData: (data: Partial<UserProfile>) => void;
  setRiasecCode: (code: string) => void;
  setZodiacSign: (sign: string) => void;
}

const UserContext = createContext<undefined | UserContextType>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const {
    clearProfile,
    isInitialized,
    profile,
    saveBirthRecord,
    setBirthDate,
    setInitialized,
    setMbtiType,
    setProfile,
    setRiasecCode,
    setTier,
    setZodiacSign,
  } = useUserStore();

  // Handle Hydration
  useEffect(() => {
    setInitialized(true);
  }, [setInitialized]);

  // Tier sync disabled in static build (no Supabase)

  return (
    <UserContext.Provider
      value={{
        clearProfile,
        isInitialized,
        profile,
        saveBirthRecord,
        setBirthDate,
        setMbtiType,
        setProfileData: setProfile,
        setRiasecCode,
        setZodiacSign,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// Guest/Fallback Context for when Provider is missing or hydration fails
const GUEST_CONTEXT: UserContextType = {
  clearProfile: () =>
    console.warn("UserProvider missing: clearProfile ignored"),
  isInitialized: false,
  profile: {
    big5Type: null,
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
  saveBirthRecord: () =>
    console.warn("UserProvider missing: saveBirthRecord ignored"),
  setBirthDate: () =>
    console.warn("UserProvider missing: setBirthDate ignored"),
  setMbtiType: () => console.warn("UserProvider missing: setMbtiType ignored"),
  setProfileData: () =>
    console.warn("UserProvider missing: setProfileData ignored"),
  setRiasecCode: () =>
    console.warn("UserProvider missing: setRiasecCode ignored"),
  setZodiacSign: () =>
    console.warn("UserProvider missing: setZodiacSign ignored"),
};

export function useUserProfile() {
  const context = useContext(UserContext);
  if (context === undefined) {
    // Graceful fallback instead of crashing
    return GUEST_CONTEXT;
  }
  return context;
}
