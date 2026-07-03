"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useLocale } from "next-intl";

import { useAlmanac } from "@/hooks/useAlmanac";
import { useUserHistory } from "@/hooks/useUserHistory";
import { aggregateOntology } from "@/lib/ontology/engine";

import {
  calculateDailyEnergy,
  calculateResonanceScore,
  DailyCosmicState,
} from "./engine";

interface DailyInsightContextType {
  data: DailyCosmicState | null;
  loading: boolean;
}

const DailyInsightContext = createContext<DailyInsightContextType>({
  data: null,
  loading: true,
});

export function DailyInsightProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Hooks for External Data
  const now = useMemo(() => new Date(), []);
  const { dayData: almanacData, isLoading: isAlmanacLoading } = useAlmanac(now);
  const { history, loading: isUserLoading } = useUserHistory();

  // 2. Computed Logic
  const loading = isAlmanacLoading || isUserLoading;

  const [profile, setProfile] = useState<any>(null);
  const locale = useLocale();

  useEffect(() => {
    if (loading || !history || history.length === 0) return;
    const fetchProfile = async () => {
      const result = await aggregateOntology(history, locale);
      setProfile(result);
    };
    fetchProfile();
  }, [history, loading, locale]);

  const data = useMemo(() => {
    if (loading) return null;

    const baseEnergy = calculateDailyEnergy(now);
    baseEnergy.almanac = almanacData || null;

    const userDayMaster = profile?.roots?.universal?.saju?.dayMaster;
    if (userDayMaster) {
      baseEnergy.resonanceScore = calculateResonanceScore(
        userDayMaster,
        baseEnergy.saju.element,
        baseEnergy.moon.phase,
      );
    } else {
      // General baseline for guests
      baseEnergy.resonanceScore = 50;
    }

    return baseEnergy;
  }, [now, almanacData, profile, loading]);

  const value = useMemo(() => ({ data, loading }), [data, loading]);

  return (
    <DailyInsightContext.Provider value={value}>
      {children}
    </DailyInsightContext.Provider>
  );
}

export function useDailyInsight() {
  const context = useContext(DailyInsightContext);
  if (context === undefined) {
    throw new Error(
      "useDailyInsight must be used within a DailyInsightProvider",
    );
  }
  return context;
}
