import { listStoredTestResults, type StoredTestResultKind } from "./test-results";

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

export interface AchievementTest {
  testId: string;
  /** 결과까지 본 검사. 아니면 열기만 한 검사. */
  finished: boolean;
  title?: string;
  kind?: StoredTestResultKind;
}

/**
 * 업적이 세는 "서로 다른 검사" 목록 — 항아리에 공 하나씩 떨어진다.
 * `distinctTests` 와 같은 집합이다(끝낸 검사 ∪ 연 검사).
 */
export function listAchievementTests(): AchievementTest[] {
  const byId = new Map<string, AchievementTest>();
  // 최신 결과가 앞에 있으므로 처음 본 제목이 가장 최근 제목이다.
  for (const entry of listStoredTestResults()) {
    if (!byId.has(entry.testId)) {
      byId.set(entry.testId, { testId: entry.testId, finished: true, title: entry.title, kind: entry.kind });
    }
  }
  for (const testId of Object.keys(readOpened())) {
    if (!byId.has(testId)) byId.set(testId, { testId, finished: false });
  }
  return [...byId.values()];
}

/** 공에 적는 짧은 글자. 라틴 글자는 대문자 머리글자(한 단어면 네 글자까지), 그 밖에는 앞 두 글자. */
export function jarText(label: string): string {
  const clean = label.replace(/[-_]?(test|quiz|screening)$/i, "").trim();
  if (/^[\x00-\x7F]+$/.test(clean)) {
    const words = clean.split(/[\s\-_]+/).filter(Boolean);
    if (words.length > 1) return words.map((w) => w[0]).join("").slice(0, 3).toUpperCase();
    return (clean.length <= 4 ? clean : clean.slice(0, 3)).toUpperCase();
  }
  return Array.from(clean.replace(/\s+/g, "")).slice(0, 2).join("");
}
