import { listStoredTestResults } from "./test-results";

export interface TestAchievementSnapshot {
  finishedTests: number;
  distinctTests: number;
}

export interface TestAchievementDef {
  id: string;
  icon: string;
  metric: keyof TestAchievementSnapshot;
  target: number;
}

export const TEST_ACHIEVEMENTS: readonly TestAchievementDef[] = [
  { id: "first-test", icon: "🧪", metric: "finishedTests", target: 1 },
  { id: "five-tests", icon: "📚", metric: "distinctTests", target: 5 },
  { id: "twenty-tests", icon: "🗺️", metric: "distinctTests", target: 20 },
  { id: "atlas-tests", icon: "🌏", metric: "distinctTests", target: 40 },
];

export function evaluateTestAchievements(snapshot: TestAchievementSnapshot) {
  return TEST_ACHIEVEMENTS.map((def) => {
    const value = snapshot[def.metric];
    return { ...def, progress: Math.min(value, def.target), unlocked: value >= def.target };
  });
}

const OPENED_KEY = "oiyo:test-opened:v1";

function readOpened(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(OPENED_KEY) || "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as Record<string, string>;
  } catch {
    return {};
  }
}

export function recordTestOpened(testId: string): void {
  if (typeof window === "undefined" || !testId) return;
  try {
    const all = readOpened();
    if (all[testId]) return;
    all[testId] = "1";
    window.localStorage.setItem(OPENED_KEY, JSON.stringify(all));
  } catch {
    /* private mode */
  }
}

export function buildTestAchievementSnapshot(): TestAchievementSnapshot {
  const finished = listStoredTestResults();
  const finishedIds = new Set(finished.map((entry) => entry.testId));
  const opened = Object.keys(readOpened());
  const distinct = new Set([...finishedIds, ...opened]);
  return {
    finishedTests: finishedIds.size,
    distinctTests: distinct.size,
  };
}
