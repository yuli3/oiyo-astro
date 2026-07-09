import { Recommendation, RecommendationContext } from "../contracts";
import { SPIRITUALITY_DEFINITIONS } from "../data/definitions";
import { computeMatchScore, MIN_DISPLAY_SCORE } from "../scoring";

/**
 * Spirituality Recommendation Engine
 * Draws from Eastern Philosophy (Taoism, I Ching) and mystical traditions.
 */
export class SpiritualityEngine {
  public static recommend(ctx: RecommendationContext): Recommendation[] {
    const results: Recommendation[] = [];

    for (const def of SPIRITUALITY_DEFINITIONS) {
      const matchScore = computeMatchScore(def, ctx);
      if (matchScore < MIN_DISPLAY_SCORE) continue;

      results.push({
        category: "spirituality",
        description: `recommendations.spirituality.${def.id}.description`,
        icon: def.icon,
        id: `spirituality-${def.id}`,
        matchScore,
        reasoning: {
          explanation: `recommendations.spirituality.${def.id}.reasoning`,
          primarySource: def.reasoning.primarySource,
          secondarySource: def.reasoning.secondarySource,
        },
        tags: def.tags,
        title: `recommendations.spirituality.${def.id}.title`,
      });
    }

    // TODO(Phase1 step2 통합 후): 그래프 인접 fallback — results가 비면
    // graph/traverse.ts neighbors()로 관계 기반 추천을 채운다.

    return results.sort((a, b) => b.matchScore - a.matchScore);
  }
}
