import { useCallback, useEffect, useState } from "react";

import {
  calculateLifeScore,
  getHistory,
  saveResult as saveToStorage,
} from "@/lib/user/history";
import type { UserResult } from "@/types/data-schema";

// Clerk removed — localStorage-only in static build
export function useUserHistory() {
  const [history, setHistory] = useState<UserResult[]>([]);
  const [lifeScore, setLifeScore] = useState(0);
  const [loading, setLoading] = useState(true);

  const refreshLocalHistory = useCallback(() => {
    const data = getHistory();
    setHistory(data.results);
    setLifeScore(calculateLifeScore(data.results));
    setLoading(false);
  }, []);

  useEffect(() => {
    const data = getHistory();
    setHistory(data.results);
    setLifeScore(calculateLifeScore(data.results));
    setLoading(false);
  }, []);

  const persistResult = async (
    result: Omit<UserResult, "createdAt" | "id">,
  ): Promise<string> => {
    const id = saveToStorage(result);
    refreshLocalHistory();
    return id;
  };

  const markAsPremium = async (resultId: string) => {
    const data = getHistory();
    const resultIndex = data.results.findIndex((r) => r.id === resultId);
    if (resultIndex !== -1) {
      data.results[resultIndex].isPremium = true;
      localStorage.setItem("oiyo_user_history_v1", JSON.stringify(data));
      refreshLocalHistory();
    }
  };

  return { history, lifeScore, loading, markAsPremium, persistResult };
}
