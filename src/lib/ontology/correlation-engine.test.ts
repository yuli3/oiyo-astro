import { describe, expect, it } from "vitest";

import { generateCorrelations } from "./correlation-engine";

describe("CorrelationEngine", () => {
  it("should generate financial insights for Introverted Savers", () => {
    const profile = { mbti: "ISTJ", moneyType: "saver" };
    const insights = generateCorrelations(profile);

    const financialInsight = insights.find((i) => i.id === "mbti-money-1");
    expect(financialInsight).toBeDefined();
    expect(financialInsight?.title).toBe("Introverted Saver Synergy");
    expect(financialInsight?.category).toBe("financial");
  });

  it("should generate career insights for Judging Fire Signs", () => {
    const profile = { mbti: "ENTJ", zodiac: "Leo" };
    const insights = generateCorrelations(profile);

    const careerInsight = insights.find((i) => i.id === "mbti-zodiac-1");
    expect(careerInsight).toBeDefined();
    expect(careerInsight?.title).toBe("Structured Fire Energy");
  });

  it("should generate age-specific insights for 20s", () => {
    const profile = {
      lifeStage: "20s" as const,
      mbti: "INFP",
      moneyType: "saver",
    };
    const insights = generateCorrelations(profile);

    expect(insights.some((i) => i.id === "lifestage-20s-saver")).toBe(true);
    expect(insights.some((i) => i.id === "lifestage-20s-intuitive")).toBe(true);
  });

  it("should return empty array if no profile data is provided", () => {
    const insights = generateCorrelations({});
    expect(insights).toEqual([]);
  });

  it("should handle missing properties gracefully", () => {
    const profile = { mbti: "INFJ" }; // No moneyType, zodiac, etc.
    const insights = generateCorrelations(profile);

    // Should still get basic MBTI-only insights if any (currently thinking/feeling)
    expect(insights.length).toBeGreaterThan(0);
    expect(insights.every((i) => i.sources.includes("MBTI"))).toBe(true);
  });
});
