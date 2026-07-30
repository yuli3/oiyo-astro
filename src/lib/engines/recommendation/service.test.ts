import { describe, expect, it } from "vitest";

import type { RecommendationContext } from "./contracts";
import { RecommendationService } from "./service";

describe("RecommendationService.generateRecommendations", () => {
  it("never throws and returns empty category arrays for a signal-less profile", () => {
    const ctx: RecommendationContext = { interpretation: {} };
    const result = RecommendationService.generateRecommendations(ctx);

    expect(result.careers).toEqual([]);
    expect(result.hobbies).toEqual([]);
    expect(result.psychology).toEqual([]);
    expect(result.mythology).toEqual([]);
    expect(result.science).toEqual([]);
    expect(result.spirituality).toEqual([]);
  });

  it("surfaces matching, distinctly-scored recommendations for a rich profile, sorted by matchScore desc", () => {
    const ctx: RecommendationContext = {
      interpretation: {
        mbti: { code: "ENTJ" } as any,
        saju: { tenGodProfile: { dominant: "Friend" } } as any,
        tci: {
          temperamentDimensions: [
            { key: "HA", level: "high", name: { en: "Harm Avoidance", ko: "위험 회피" } } as any,
          ],
        } as any,
      },
      signals: {
        big5: { A: 50, C: 50, E: 80, N: 50, O: 50 },
        riasec: { code: "ESI", scores: {} },
        zodiac: "Leo",
      },
    };
    const result = RecommendationService.generateRecommendations(ctx);

    expect(result.careers.length).toBeGreaterThan(0);
    for (const rec of result.careers) {
      expect(rec.matchScore).toBeGreaterThanOrEqual(0);
      expect(rec.matchScore).toBeLessThanOrEqual(100);
    }
    // sorted descending
    const scores = result.careers.map((r) => r.matchScore);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));

    // A direct signal match exists for every declared definition, so the
    // graph-adjacency fallback (`../graph-fallback.ts`) must not kick in.
    expect(result.careers.every((rec) => !rec.id.includes("-graph-"))).toBe(true);
    expect(result.hobbies.every((rec) => !rec.id.includes("-graph-"))).toBe(true);
  });

  it("falls back to graph-adjacent hobbies/careers when signals exist but match no definition directly", () => {
    // A lone zodiac signal: none of HOBBY_DEFINITIONS/CAREER_DEFINITIONS
    // declare a `zodiac` scoring rule, so every definition scores 0 — but
    // the graph (`@/lib/ontology/graph/edges.ts`) still connects "taurus" to
    // "gardening" (hobby) and, two hops out, to "architect" (career).
    const ctx: RecommendationContext = { interpretation: {}, signals: { zodiac: "Taurus" } };
    const result = RecommendationService.generateRecommendations(ctx);

    expect(result.hobbies.length).toBeGreaterThan(0);
    expect(result.careers.length).toBeGreaterThan(0);
    expect(result.hobbies.every((rec) => rec.id.includes("-graph-"))).toBe(true);
    expect(result.careers.every((rec) => rec.id.includes("-graph-"))).toBe(true);
  });
});
