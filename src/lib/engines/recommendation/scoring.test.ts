import { describe, expect, it } from "vitest";

import { RecommendationContext } from "./contracts";
import { CAREER_DEFINITIONS, HOBBY_DEFINITIONS } from "./data/definitions";
import { computeMatchScore, MIN_DISPLAY_SCORE } from "./scoring";

function ctx(overrides: Partial<RecommendationContext> = {}): RecommendationContext {
  return { interpretation: {}, ...overrides };
}

describe("computeMatchScore", () => {
  it("returns 0 for an empty profile (no interpretation, no signals) without throwing", () => {
    for (const def of [...CAREER_DEFINITIONS, ...HOBBY_DEFINITIONS]) {
      expect(computeMatchScore(def, ctx())).toBe(0);
    }
  });

  it("returns 0 for a definition with no scoring criteria declared", () => {
    const bareDef = { ...CAREER_DEFINITIONS[0], scoring: {} };
    const richProfile = ctx({
      signals: { mbti: { type: "ENTJ", traits: ["E", "N", "T", "J"] } },
    });
    expect(computeMatchScore(bareDef, richProfile)).toBe(0);
  });

  it("scores 100 when every declared category fully matches", () => {
    const def = CAREER_DEFINITIONS[0]; // global_leader: mbti E/J, riasec E/S, big5 high-E, saju dominant tenGod
    const fullMatch = ctx({
      interpretation: {
        mbti: { code: "ENTJ" } as any,
        saju: { tenGodProfile: { dominant: "Friend" } } as any,
      },
      signals: {
        big5: { A: 50, C: 50, E: 80, N: 50, O: 50 },
        riasec: { code: "ESI", scores: {} },
      },
    });
    expect(computeMatchScore(def, fullMatch)).toBe(100);
  });

  it("produces a meaningfully different score for a partial match than a full match", () => {
    const def = CAREER_DEFINITIONS[0];
    const fullMatch = ctx({
      interpretation: {
        mbti: { code: "ENTJ" } as any,
        saju: { tenGodProfile: { dominant: "Friend" } } as any,
      },
      signals: {
        big5: { A: 50, C: 50, E: 80, N: 50, O: 50 },
        riasec: { code: "ESI", scores: {} },
      },
    });
    const partialMatch = ctx({
      interpretation: { mbti: { code: "ENTJ" } as any },
    });

    const fullScore = computeMatchScore(def, fullMatch);
    const partialScore = computeMatchScore(def, partialMatch);
    expect(partialScore).toBeGreaterThan(0);
    expect(partialScore).toBeLessThan(fullScore);
  });

  it("produces distinct scores across differently-signaled profiles (no flat plateau)", () => {
    const profiles: RecommendationContext[] = [
      ctx({ interpretation: { mbti: { code: "ENTJ" } as any } }),
      ctx({ interpretation: { mbti: { code: "ISFP" } as any } }),
      ctx({
        interpretation: { saju: { tenGodProfile: { dominant: "Friend" } } as any },
      }),
      ctx({ signals: { riasec: { code: "ESI", scores: {} } } }),
      ctx({
        interpretation: { mbti: { code: "ENTJ" } as any },
        signals: {
          big5: { A: 50, C: 50, E: 80, N: 50, O: 50 },
          riasec: { code: "ESI", scores: {} },
        },
      }),
    ];

    const scores = profiles.map((p) => computeMatchScore(CAREER_DEFINITIONS[0], p));
    const distinctScores = new Set(scores);
    expect(distinctScores.size).toBeGreaterThan(1);
  });

  it("scores big5/riasec/zodiac signals sourced only from ctx.signals (not present on interpretation)", () => {
    const hikingDef = HOBBY_DEFINITIONS.find((d) => d.id === "hiking")!;
    const scoreWithSignal = computeMatchScore(
      hikingDef,
      ctx({ signals: { big5: { A: 50, C: 50, E: 50, N: 50, O: 80 } } }),
    );
    const scoreWithout = computeMatchScore(hikingDef, ctx());
    expect(scoreWithSignal).toBeGreaterThan(scoreWithout);
  });

  it("respects MIN_DISPLAY_SCORE as a sane threshold (0 < threshold <= 100)", () => {
    expect(MIN_DISPLAY_SCORE).toBeGreaterThan(0);
    expect(MIN_DISPLAY_SCORE).toBeLessThanOrEqual(100);
  });
});
