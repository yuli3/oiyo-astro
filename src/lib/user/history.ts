import { UserHistory, UserResult } from "@/types/data-schema";

const STORAGE_KEY = "oiyo_user_history_v1";

export const getHistory = (): UserHistory => {
  if (typeof window === "undefined") return { lastUpdated: 0, results: [] };
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : { lastUpdated: 0, results: [] };
};

export const saveResult = (
  result: Omit<UserResult, "createdAt" | "id">,
): string => {
  const history = getHistory();
  // Simple UUID generation backup if crypto is not available (though it usually is)
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

  const newResult: UserResult = {
    ...result,
    createdAt: Date.now(),
    id,
  };

  const updatedHistory: UserHistory = {
    lastUpdated: Date.now(),
    results: [newResult, ...history.results].slice(0, 50), // Limit to 50 items
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  return id;
};

export const calculateLifeScore = (results: UserResult[]): number => {
  if (results.length === 0) return 0;
  const scoredResults = results.filter((r) => r.score !== undefined);
  if (scoredResults.length === 0) return 0;
  const total = scoredResults.reduce((acc, curr) => acc + (curr.score || 0), 0);
  return Math.round(total / scoredResults.length);
};
