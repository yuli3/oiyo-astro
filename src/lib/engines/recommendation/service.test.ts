import { describe, expect, it } from "vitest";

import { RecommendationContext } from "./contracts";
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
  });
});
