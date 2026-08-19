import { describe, expect, it, beforeEach } from "vitest";
import { recordTestResult } from "./test-results";
import { TEST_ACHIEVEMENTS, buildTestAchievementSnapshot, evaluateTestAchievements, recordTestOpened } from "./test-achievements";

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, String(value)),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() { return store.size; },
  } as Storage;
}

beforeEach(() => {
  (globalThis as { localStorage?: Storage }).localStorage = createMemoryStorage();
  (globalThis as { window?: Window }).window = globalThis as unknown as Window;
});

describe("test achievements", () => {
  it("unlocks nothing from an empty browser", () => {
    const result = evaluateTestAchievements(buildTestAchievementSnapshot());
    expect(result).toHaveLength(TEST_ACHIEVEMENTS.length);
    expect(result.every((a) => !a.unlocked)).toBe(true);
  });

  it("counts a finished test and an opened test as distinct", () => {
    recordTestResult({ kind: "psychometric", testId: "mbti", title: "MBTI", resultLabel: "INFJ" });
    recordTestOpened("self-esteem-test");
    recordTestOpened("self-esteem-test");
    const snap = buildTestAchievementSnapshot();
    expect(snap.distinctTests).toBe(2);
    expect(snap.finishedTests).toBe(1);
    expect(evaluateTestAchievements(snap).find((a) => a.id === "first-test")?.unlocked).toBe(true);
  });
});
