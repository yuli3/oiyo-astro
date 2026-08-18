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

/**
 * Works with or without a UserProvider.
 *
 * The fallback used to be a frozen guest object whose setters only called
 * console.warn, so any consumer rendered outside the provider — and the
 * provider is mounted in exactly one island — saved nothing and said nothing.
 * A visitor could fill in the birth form, watch it close, and lose the input.
 *
 * The provider is only a thin wrapper over the same zustand store, so the
 * fallback now reads and writes that store directly. Both paths persist.
 */
export function useUserProfile(): UserContextType {
  const context = useContext(UserContext);
  const store = useUserStore();

  const fallback: UserContextType = {
    clearProfile: store.clearProfile,
    isInitialized: store.isInitialized,
    profile: store.profile,
    saveBirthRecord: store.saveBirthRecord,
    setBirthDate: store.setBirthDate,
    setMbtiType: store.setMbtiType,
    setProfileData: store.setProfile,
    setRiasecCode: store.setRiasecCode,
    setZodiacSign: store.setZodiacSign,
  };

  return context ?? fallback;
}
