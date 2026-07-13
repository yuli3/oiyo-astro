import { beforeEach, describe, expect, it } from "vitest";
import { vi } from "vitest";

import { useUserStore } from "@/lib/user/store/user-store";
import { recordTestResult } from "@/lib/user/test-results";
import { bigFivePlugin, bigFiveResponsesFromAnswers, buildAssessmentResult, buildMbtiResult, buildRiasecResult, recordAssessmentResult, riasecFullPlugin } from "@/assessments";

import { collectSignals, mergeAssessmentSignals } from "./signals";

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

  it("extracts a riasec signal recorded by RiasecQuickTest-shaped payloads (testId riasec-quick)", () => {
    recordTestResult({
      kind: "psychometric",
      testId: "riasec-quick",
      title: "RIASEC Quick",
      resultLabel: "SEA",
      result: { code: "SEA", scores: { S: 12, E: 10, A: 9, I: 5, R: 3, C: 2 } },
    });
    expect(collectSignals().riasec).toEqual({
      code: "SEA",
      scores: { S: 12, E: 10, A: 9, I: 5, R: 3, C: 2 },
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

  it("overlays complete V2 Big Five, MBTI, and RIASEC signals on legacy values", () => {
    recordTestResult({ kind: "psychometric", testId: "mbti", title: "MBTI", resultLabel: "ESTJ", result: { type: "ESTJ" } });

    recordAssessmentResult(buildAssessmentResult(bigFivePlugin, bigFiveResponsesFromAnswers(Array(20).fill(3))));
    recordAssessmentResult(buildMbtiResult(Object.fromEntries(
      Array.from({ length: 16 }, (_, index) => [`q${index + 1}`, ["I", "N", "F", "P"][index % 4]]),
    )));
    recordAssessmentResult(buildRiasecResult(riasecFullPlugin, Object.fromEntries(
      riasecFullPlugin.instrument.items.map((item, index) => [item.id, index < 4 ? 5 : 1]),
    )));

    const signals = collectSignals();
    expect(signals.mbti?.type).toBe("INFP");
    expect(signals.big5).toEqual({ O: 50, C: 50, E: 50, A: 50, N: 50 });
    expect(signals.riasec?.code).toHaveLength(3);
    expect(signals.riasec?.scoreScale).toBe("normalized-0-100");
    expect(Object.keys(signals.riasec?.scores ?? {})).toEqual(["R", "I", "A", "S", "E", "C"]);
  });

  it("keeps an entire legacy domain when the V2 construct family is incomplete", () => {
    const legacy = { big5: { O: 10, C: 20, E: 30, A: 40, N: 50 } };
    const partial = [{
      confidence: 0.6,
      constructId: "psychology.big5.O",
      evidenceTier: "research-inspired" as const,
      id: "partial:O",
      observedAt: "2026-07-14T00:00:00.000Z",
      provenance: { instrumentVersion: "partial", resultId: "partial", scoringVersion: "partial" },
      scale: { min: 0, max: 100 },
      sourceAssessmentId: "big5",
      value: 99,
    }];
    expect(mergeAssessmentSignals(legacy, partial).big5).toEqual(legacy.big5);
  });
});
