"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface UserProfile {
  big5Type?: null | string;
  birthDate: null | string; // e.g., "1990-01-01T15:30:00.000Z"
  birthTime?: null | string; // "15:30"
  bloodType?: "A" | "AB" | "B" | "O" | null;
  gender?: "female" | "male" | null;
  hobbies?: string[];

  hspType?: null | string;
  mbtiType: null | string; // e.g., "INTJ"
  name?: null | string;
  riasecCode: null | string; // e.g., "R-I-A"
  tciType?: null | string;
  tier?: UserTier;
  zodiacSign: null | string; // e.g., "aries"
}

export type UserTier = "FREE" | "OFFERING" | "SUBSCRIBER";

interface UserContextType {
  clearProfile: () => void;
  isInitialized: boolean;
  profile: UserProfile;
  setBirthDate: (date: string) => void;
  setMbtiType: (type: string) => void;
  // New setters
  setProfileData: (data: Partial<UserProfile>) => void;
  setRiasecCode: (code: string) => void;
  setZodiacSign: (sign: string) => void;
}

const UserContext = createContext<undefined | UserContextType>(undefined);

import { useUserStore } from "../store/user-store";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const {
    clearProfile,
    isInitialized,
    profile,
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
