import { describe, expect, it } from "vitest";

import type { RecommendationContext } from "./contracts";
import { graphAdjacentRecommendations } from "./graph-fallback";

const context = (signals: NonNullable<RecommendationContext["signals"]>): RecommendationContext => ({ interpretation: {}, signals });

describe("ontology platform legacy recommendation fixtures", () => {
  it("reports the unchanged legacy graph fallback fixtures before any platform consumer is enabled", () => {
    const fixtures = {
      empty: graphAdjacentRecommendations("hobby", { interpretation: {} }).map(({ id, matchScore }) => [id, matchScore]),
      openness: graphAdjacentRecommendations("hobby", context({ big5: { A: 50, C: 50, E: 50, N: 50, O: 80 } })).map(({ id, matchScore }) => [id, matchScore]),
      woodCareer: graphAdjacentRecommendations("career", context({ saju: { element: "wood", tenGods: [] } })).map(({ id, matchScore }) => [id, matchScore])
    };
    expect(fixtures).toEqual({
      empty: [],
      openness: [["hobby-graph-boxing-kickboxing", 36], ["hobby-graph-astrophotography", 24]],
      woodCareer: [["career-graph-architect", 20], ["career-graph-physician", 18]]
    });
  });
});
