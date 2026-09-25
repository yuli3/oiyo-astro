import { describe, expect, it, beforeEach } from "vitest";
import { recordTestResult } from "./test-results";
import { TEST_ACHIEVEMENTS, buildTestAchievementSnapshot, evaluateTestAchievements, jarText, listAchievementTests, recordTestOpened } from "./test-achievements";

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

  it("lists the same distinct tests the snapshot counts, finished first", () => {
    recordTestResult({ kind: "mystic", testId: "tarot", title: "타로", resultLabel: "done" });
    recordTestResult({ kind: "psychometric", testId: "mbti", title: "MBTI", resultLabel: "INFJ" });
    recordTestOpened("mbti");
    recordTestOpened("self-esteem-test");
    const list = listAchievementTests();
    expect(list.length).toBe(buildTestAchievementSnapshot().distinctTests);
    expect(list.map((t) => [t.testId, t.finished])).toEqual([["mbti", true], ["tarot", true], ["self-esteem-test", false]]);
    expect(list[0].kind).toBe("psychometric");
  });

  it("shortens labels for a ball", () => {
    expect(jarText("MBTI")).toBe("MBTI");
    expect(jarText("riasec")).toBe("RIA");
    expect(jarText("self-esteem-test")).toBe("SE");
    expect(jarText("빅파이브 성격 검사")).toBe("빅파");
  });
});
