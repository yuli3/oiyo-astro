import { beforeEach, describe, expect, it, vi } from "vitest";

import { decodeResult, encodeResult } from "@/lib/result-permalink";
import { useUserStore } from "@/lib/user/store/user-store";
import { recordTestResult } from "@/lib/user/test-results";
import { bigFivePlugin, bigFiveResponsesFromAnswers, buildAssessmentResult, recordAssessmentResult } from "@/assessments";

import {
  assembleOntologyExport,
  collectResultPermalinkState,
  ONTOLOGY_EXPORT_PERMALINK_TOOL_ID,
  parseSharedProfileSignals,
} from "./export";
import type { ProfileSignals } from "./signals";

// Same localStorage-stub idiom as `signals.test.ts`/`graph-fallback.test.ts`
// (this repo's vitest environment is "node", no jsdom).
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

describe("assembleOntologyExport", () => {
  beforeEach(() => {
    stubLocalStorage();
    useUserStore.getState().clearProfile();
  });

  it("degrades gracefully for a signal-less profile — no crash, every field empty", () => {
    const result = assembleOntologyExport();
    expect(result.signals).toEqual({});
    expect(result.testResults).toEqual([]);
    expect(result.assessmentResults).toEqual([]);
    expect(result.recommendations).toEqual([]);
    expect(result.graphSnapshot).toEqual([]);
    expect(typeof result.exportedAt).toBe("string");
    expect(Number.isNaN(Date.parse(result.exportedAt))).toBe(false);
  });

  it("exports V2 assessment history with provenance and scores but without raw responses", () => {
    const recorded = buildAssessmentResult(
      bigFivePlugin,
      bigFiveResponsesFromAnswers(Array(20).fill(3)),
      { completedAt: "2026-07-14T00:00:00.000Z", resultId: "big5:v2-export" },
    );
    recordAssessmentResult(recorded);

    const result = assembleOntologyExport();
    expect(result.assessmentResults).toHaveLength(1);
    expect(result.assessmentResults[0]).toMatchObject({
      resultId: "big5:v2-export",
      assessmentId: bigFivePlugin.id,
      evidenceTier: bigFivePlugin.manifest.evidenceTier,
      versions: recorded.versions,
      quality: recorded.quality,
      scores: recorded.scores,
    });
    expect(result.assessmentResults[0]).not.toHaveProperty("responses");
  });

  it("carries the full local test-result history, not just the most recent", () => {
    recordTestResult({ kind: "psychometric", testId: "big5", title: "Big Five", resultLabel: "O 80%", result: { scores: { O: 80, C: 40, E: 55, A: 60, N: 20 } } });
    recordTestResult({ kind: "psychometric", testId: "enneagram", title: "Enneagram", resultLabel: "Type 4", result: { type: "4" } });

    const result = assembleOntologyExport();
    expect(result.testResults).toHaveLength(2);
    expect(result.signals.big5).toEqual({ O: 80, C: 40, E: 55, A: 60, N: 20 });
    expect(result.signals.enneagram).toBe("4");
  });

  it("flattens every recommendation category (>= MIN_DISPLAY_SCORE / graph-fallback), not just the top one per category", () => {
    useUserStore.getState().setProfile({ zodiacSign: "Taurus" });
    const result = assembleOntologyExport();

    // Matches the "falls back to graph-adjacent hobbies/careers" case in
    // `RecommendationService.generateRecommendations` (service.test.ts):
    // a lone zodiac signal matches no RecommendationDefinition directly, so
    // both categories come entirely from the graph fallback.
    const hobbyRecs = result.recommendations.filter((r) => r.category === "hobby");
    const careerRecs = result.recommendations.filter((r) => r.category === "career");
    expect(hobbyRecs.length).toBeGreaterThan(0);
    expect(careerRecs.length).toBeGreaterThan(0);
    expect(hobbyRecs.every((r) => r.id.includes("-graph-"))).toBe(true);
  });

  it("builds a bounded 2-hop graph snapshot seeded from signals, empty when there are no signals", () => {
    useUserStore.getState().setProfile({ zodiacSign: "Taurus" });
    const result = assembleOntologyExport();

    expect(result.graphSnapshot.length).toBeGreaterThan(0);
    expect(result.graphSnapshot.length).toBeLessThanOrEqual(40); // SNAPSHOT_MAX_NODES cap
    for (const entry of result.graphSnapshot) {
      expect([1, 2]).toContain(entry.hop);
      expect(entry.nodeId).not.toBe("taurus"); // seeds themselves are never included
    }
    // No dangling/duplicate node ids.
    const ids = result.graphSnapshot.map((n) => n.nodeId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("ontology export permalink (T6 reuse)", () => {
  beforeEach(() => {
    stubLocalStorage();
    useUserStore.getState().clearProfile();
  });

  it("round-trips a realistic signals payload through encodeResult/decodeResult", () => {
    recordTestResult({ kind: "psychometric", testId: "riasec", title: "RIASEC", resultLabel: "AIS", result: { code: "AIS", scores: { A: 18, I: 16, S: 14, R: 5, E: 4, C: 2 } } });
    useUserStore.getState().setProfile({ zodiacSign: "Leo", mbtiType: "ENTJ" });

    const state = collectResultPermalinkState();
    const encoded = encodeResult(ONTOLOGY_EXPORT_PERMALINK_TOOL_ID, state);
    expect(encoded).not.toBeNull();

    const decoded = decodeResult<ProfileSignals>(encoded);
    expect(decoded?.toolId).toBe(ONTOLOGY_EXPORT_PERMALINK_TOOL_ID);
    expect(decoded?.state).toEqual(state);
  });

  it("round-trips an empty-profile payload (no signals) without crashing", () => {
    const state = collectResultPermalinkState();
    expect(state).toEqual({});
    const encoded = encodeResult(ONTOLOGY_EXPORT_PERMALINK_TOOL_ID, state);
    expect(decodeResult<ProfileSignals>(encoded)?.state).toEqual({});
  });

  it("encodeResult safely returns null (not a throw) once a payload is pushed past the 1500-char guard — callers must fall back, never crash", () => {
    // Deliberately oversized, not a realistic signals shape — this proves
    // the size-guard fallback path the export UI must handle, independent
    // of whether real-world signals ever get this large.
    const oversized: ProfileSignals = {
      saju: { element: "Wood", tenGods: Array.from({ length: 300 }, (_, i) => `ten-god-${i}-${"x".repeat(20)}`) },
    };
    expect(encodeResult(ONTOLOGY_EXPORT_PERMALINK_TOOL_ID, oversized)).toBeNull();
  });
});

describe("parseSharedProfileSignals (shared-link decoder banner)", () => {
  beforeEach(() => {
    stubLocalStorage();
    useUserStore.getState().clearProfile();
  });

  it("decodes a real encodeResult/decodeResult round-trip back into the exact shared signals", () => {
    recordTestResult({ kind: "psychometric", testId: "riasec", title: "RIASEC", resultLabel: "AIS", result: { code: "AIS", scores: { A: 18, I: 16, S: 14, R: 5, E: 4, C: 2 } } });
    useUserStore.getState().setProfile({ zodiacSign: "Leo", mbtiType: "ENTJ" });
    const state = collectResultPermalinkState();

    const encoded = encodeResult(ONTOLOGY_EXPORT_PERMALINK_TOOL_ID, state);
    const decoded = decodeResult<ProfileSignals>(encoded);

    expect(parseSharedProfileSignals(decoded)).toEqual(state);
  });

  it("returns null for a decoded payload from a different tool (never mistaken for a shared ontology profile)", () => {
    const encoded = encodeResult("saju-calculator", { year: 1990, month: 1, day: 1 });
    const decoded = decodeResult(encoded);
    expect(parseSharedProfileSignals(decoded as never)).toBeNull();
  });

  it("returns null when there is no hash / decode already failed — never crashes", () => {
    expect(parseSharedProfileSignals(null)).toBeNull();
    expect(parseSharedProfileSignals(decodeResult<ProfileSignals>(undefined))).toBeNull();
    expect(parseSharedProfileSignals(decodeResult<ProfileSignals>("garbage"))).toBeNull();
  });
});
