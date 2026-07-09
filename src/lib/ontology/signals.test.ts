import { beforeEach, describe, expect, it } from "vitest";
import { vi } from "vitest";

import { useUserStore } from "@/lib/user/store/user-store";
import { recordTestResult } from "@/lib/user/test-results";

import { collectSignals } from "./signals";

function stubLocalStorage() {
  const store = new Map<string, string>();
  vi.stubGlobal("window", {
    dispatchEvent: vi.fn(),
    localStorage: {
      getItem: vi.fn((key: string) => store.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store.set(key, value);
      }),
      removeItem: vi.fn((key: string) => {
        store.delete(key);
      }),
    },
  });
  vi.stubGlobal(
    "CustomEvent",
    class CustomEvent<T = unknown> {
      detail: T;
      type: string;
      constructor(type: string, init?: { detail?: T }) {
        this.type = type;
        this.detail = init?.detail as T;
      }
    },
  );
}

describe("collectSignals", () => {
  beforeEach(() => {
    stubLocalStorage();
    useUserStore.getState().clearProfile();
  });

  it("returns an empty object when the store is empty (no crash)", () => {
    expect(collectSignals()).toEqual({});
  });

  it("extracts a big5 signal recorded by BigFivePersonalityTest-shaped payloads", () => {
    recordTestResult({
      kind: "psychometric",
      testId: "big5",
      title: "Big Five",
      resultLabel: "O 80%",
      result: { scores: { O: 80, C: 40, E: 55, A: 60, N: 20 } },
    });
    expect(collectSignals().big5).toEqual({ O: 80, C: 40, E: 55, A: 60, N: 20 });
  });

  it("extracts a riasec signal recorded by RiasecCareerTest-shaped payloads", () => {
    recordTestResult({
      kind: "psychometric",
      testId: "riasec",
      title: "RIASEC",
      resultLabel: "AIS",
      result: { code: "AIS", scores: { A: 18, I: 16, S: 14, R: 5, E: 4, C: 2 } },
    });
    expect(collectSignals().riasec).toEqual({
      code: "AIS",
      scores: { A: 18, I: 16, S: 14, R: 5, E: 4, C: 2 },
    });
  });

  it("extracts an enneagram signal recorded by EnneagramTest-shaped payloads", () => {
    recordTestResult({
      kind: "psychometric",
      testId: "enneagram",
      title: "Enneagram",
      resultLabel: "Type 4",
      result: { type: "4" },
    });
    expect(collectSignals().enneagram).toBe("4");
  });

  it("extracts an mbti signal recorded by MbtiPersonalityTest-shaped payloads", () => {
    recordTestResult({
      kind: "psychometric",
      testId: "mbti",
      title: "MBTI",
      resultLabel: "INFJ",
      result: { type: "infj" },
    });
    expect(collectSignals().mbti).toEqual({ type: "INFJ", traits: ["I", "N", "F", "J"] });
  });

  it("ignores malformed result payloads instead of crashing", () => {
    recordTestResult({ kind: "psychometric", testId: "big5", title: "Big Five", resultLabel: "-", result: { scores: { O: "high" } } });
    recordTestResult({ kind: "psychometric", testId: "riasec", title: "RIASEC", resultLabel: "-", result: {} });
    recordTestResult({ kind: "psychometric", testId: "enneagram", title: "Enneagram", resultLabel: "-", result: { type: "X" } });
    recordTestResult({ kind: "psychometric", testId: "mbti", title: "MBTI", resultLabel: "-", result: { type: "ABCD" } });
    recordTestResult({ kind: "psychometric", testId: "unknown-test", title: "?", resultLabel: "-", result: "not an object" });
    expect(collectSignals()).toEqual({});
  });

  it("falls back to the profile store for mbti/zodiac and derives saju from birthDate", () => {
    useUserStore.getState().setProfile({
      mbtiType: "entp",
      zodiacSign: "Gemini",
      birthDate: new Date("1990-05-15T10:00:00").toISOString(),
      gender: "male",
    });
    const signals = collectSignals();
    expect(signals.mbti).toEqual({ type: "ENTP", traits: ["E", "N", "T", "P"] });
    expect(signals.zodiac).toBe("Gemini");
    expect(typeof signals.saju?.element).toBe("string");
    expect(signals.saju?.tenGods.length).toBeGreaterThan(0);
  });

  it("prefers a quiz-recorded mbti signal over the profile-store fallback", () => {
    useUserStore.getState().setProfile({ mbtiType: "entp" });
    recordTestResult({ kind: "psychometric", testId: "mbti", title: "MBTI", resultLabel: "INFJ", result: { type: "infj" } });
    expect(collectSignals().mbti?.type).toBe("INFJ");
  });
});
