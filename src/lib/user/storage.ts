export interface TestResult<T = Record<string, unknown>> {
  id: string;
  result: T & { label?: string }; // Flexible payload but hinting at common properties
  testId: string;
  timestamp: number;
  title: string;
}

const STORAGE_KEY = "oiyo_user_results";

export const saveResult = (
  testId: string,
  title: string,
  result: Record<string, unknown>,
) => {
  if (typeof window === "undefined") return;

  try {
    const existing = getResults();
    const newResult: TestResult = {
      id: crypto.randomUUID(),
      result,
      testId,
      timestamp: Date.now(),
      title,
    };

    // Add to beginning, limit to 50 items
    const updated = [newResult, ...existing].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newResult;
  } catch (e) {
    console.error("Failed to save result", e);
    return null;
  }
};

export const getResults = (): TestResult[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse results", e);
    return [];
  }
};

export const clearResults = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
};

export const deleteResult = (id: string) => {
  if (typeof window === "undefined") return;
  const existing = getResults();
  const updated = existing.filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};
