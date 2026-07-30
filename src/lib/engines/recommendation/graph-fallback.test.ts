import { describe, expect, it } from "vitest";

import type { RecommendationContext } from "./contracts";
import { graphAdjacentRecommendations } from "./graph-fallback";

function ctx(overrides: Partial<RecommendationContext> = {}): RecommendationContext {
  return { interpretation: {}, ...overrides };
}

describe("graphAdjacentRecommendations", () => {
  it("returns [] for both categories when the profile has no signals at all", () => {
    expect(graphAdjacentRecommendations("hobby", ctx())).toEqual([]);
    expect(graphAdjacentRecommendations("career", ctx())).toEqual([]);
  });

  it("walks one hop (trait -> hobby) to surface graph-adjacent hobbies for a high big5 dimension", () => {
    const results = graphAdjacentRecommendations(
      "hobby",
      ctx({ signals: { big5: { A: 50, C: 50, E: 50, N: 50, O: 80 } } }),
    );
    expect(results.length).toBeGreaterThan(0);
    for (const rec of results) {
      expect(rec.category).toBe("hobby");
      expect(rec.id).toMatch(/^hobby-graph-/);
      expect(rec.reasoning.primarySource).toBe("graph");
      expect(rec.matchScore).toBeGreaterThan(0);
      expect(rec.matchScore).toBeLessThanOrEqual(50); // low-confidence fallback, never a strong-match score
    }
  });

  it("walks two hops (element -> hobby -> career) to surface graph-adjacent careers with no direct trait-career edges", () => {
    const results = graphAdjacentRecommendations("career", ctx({ signals: { saju: { element: "wood", tenGods: [] } } }));
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((rec) => rec.id === "career-graph-architect")).toBe(true);
    for (const rec of results) {
      expect(rec.category).toBe("career");
      expect(rec.matchScore).toBeGreaterThan(0);
      expect(rec.matchScore).toBeLessThanOrEqual(50);
    }
  });

  it("sorts results by descending graph confidence", () => {
    const results = graphAdjacentRecommendations(
      "hobby",
      ctx({ signals: { big5: { A: 50, C: 50, E: 50, N: 50, O: 80 } } }),
    );
    const scores = results.map((r) => r.matchScore);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it("maps riasec letters and zodiac signs (case-insensitively) onto graph trait/zodiac node ids", () => {
    const fromRiasec = graphAdjacentRecommendations("hobby", ctx({ signals: { riasec: { code: "ISE", scores: {} } } }));
    const fromZodiac = graphAdjacentRecommendations("hobby", ctx({ signals: { zodiac: "Taurus" } }));
    expect(fromRiasec.length).toBeGreaterThan(0);
    expect(fromZodiac.length).toBeGreaterThan(0);
  });
});
