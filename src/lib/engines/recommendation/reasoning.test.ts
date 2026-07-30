import { describe, expect, it } from "vitest";

import type { RecommendationContext } from "./contracts";
import { CAREER_DEFINITIONS, HOBBY_DEFINITIONS } from "./data/definitions";
import { explainMatch, findDefinition } from "./reasoning";

function ctx(overrides: Partial<RecommendationContext> = {}): RecommendationContext {
  return { interpretation: {}, ...overrides };
}

describe("explainMatch", () => {
  it("returns [] for a signal-less profile without throwing", () => {
    for (const def of [...CAREER_DEFINITIONS, ...HOBBY_DEFINITIONS]) {
      expect(explainMatch(def, ctx())).toEqual([]);
    }
  });

  it("returns [] for a definition with no scoring criteria declared", () => {
    const bareDef = { ...CAREER_DEFINITIONS[0], scoring: {} };
    const richProfile = ctx({ signals: { mbti: { type: "ENTJ", traits: ["E", "N", "T", "J"] } } });
    expect(explainMatch(bareDef, richProfile)).toEqual([]);
  });

  it("surfaces the actual mbti type as the signal value, not just the category tag", () => {
    const def = CAREER_DEFINITIONS[0]; // global_leader: mbti traits E/J
    const signals = explainMatch(def, ctx({ interpretation: { mbti: { code: "ENTJ" } as any } }));
    expect(signals.length).toBeGreaterThan(0);
    expect(signals.every((s) => s.source === "mbti")).toBe(true);
    expect(signals.every((s) => s.value === "ENTJ")).toBe(true);
    // mbti has no corresponding ontology graph node
    expect(signals.every((s) => s.nodeId === undefined)).toBe(true);
  });

  it("surfaces a saju element-excess match with a lowercase element graph node id for deep-linking", () => {
    const def = HOBBY_DEFINITIONS.find((d) => d.id === "meditation")!; // saju.elementBalance.excess: Fire, Wood
    const signals = explainMatch(def, ctx({ interpretation: { saju: { element: "Fire" } as any } }));
    expect(signals.length).toBeGreaterThan(0);
    const sajuSignal = signals.find((s) => s.source === "saju");
    expect(sajuSignal?.value).toBe("Fire");
    expect(sajuSignal?.nodeId).toBe("fire");
  });

  it("ranks signals by contribution weight descending", () => {
    const def = CAREER_DEFINITIONS[0]; // global_leader: mbti(traits) + riasec + big5 + saju
    const signals = explainMatch(
      def,
      ctx({
        interpretation: { mbti: { code: "ENTJ" } as any, saju: { tenGodProfile: { dominant: "Friend" } } as any },
        signals: { big5: { A: 50, C: 50, E: 80, N: 50, O: 50 }, riasec: { code: "ESI", scores: {} } },
      }),
      10,
    );
    const weights = signals.map((s) => s.weight);
    expect(weights).toEqual([...weights].sort((a, b) => b - a));
  });

  it("caps results at `limit` (default 2) even when more signals matched", () => {
    const def = CAREER_DEFINITIONS[0];
    const signals = explainMatch(
      def,
      ctx({
        interpretation: { mbti: { code: "ENTJ" } as any, saju: { tenGodProfile: { dominant: "Friend" } } as any },
        signals: { big5: { A: 50, C: 50, E: 80, N: 50, O: 50 }, riasec: { code: "ESI", scores: {} } },
      }),
    );
    expect(signals.length).toBeLessThanOrEqual(2);
  });

  it("maps a matched riasec letter onto its graph trait node id", () => {
    const def = CAREER_DEFINITIONS[0]; // riasec.codes: E, S
    const signals = explainMatch(def, ctx({ signals: { riasec: { code: "E", scores: {} } } }));
    const riasecSignal = signals.find((s) => s.source === "riasec");
    expect(riasecSignal?.nodeId).toBe("enterprising");
  });

  it("maps a matched zodiac sign onto its lowercase graph node id", () => {
    const zodiacDef = { ...CAREER_DEFINITIONS[0], scoring: { zodiac: { signs: ["Leo"] } } };
    const signals = explainMatch(zodiacDef, ctx({ signals: { zodiac: "Leo" } }));
    expect(signals).toEqual([{ source: "zodiac", value: "Leo", nodeId: "leo", weight: expect.any(Number) }]);
  });
});

describe("findDefinition", () => {
  it("resolves a definition-backed recommendation id back to its definition", () => {
    const def = findDefinition("career-global_leader");
    expect(def?.id).toBe("global_leader");
    expect(def?.category).toBe("career");
  });

  it("returns undefined for a graph-fallback recommendation id (no backing definition)", () => {
    expect(findDefinition("hobby-graph-woodworking")).toBeUndefined();
  });

  it("returns undefined for an unknown id", () => {
    expect(findDefinition("not-a-real-id")).toBeUndefined();
  });
});
