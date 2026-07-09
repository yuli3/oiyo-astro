import { Recommendation, RecommendationContext } from "../contracts";
import { MYTHOLOGY_DEFINITIONS } from "../data/definitions";
import { computeMatchScore, MIN_DISPLAY_SCORE } from "../scoring";

/**
 * Mythology Recommendation Engine
 * Maps user archetypes to mythic heroes and stories (Campbellian Hero's Journey).
 */
export class MythologyEngine {
  public static recommend(ctx: RecommendationContext): Recommendation[] {
    const results: Recommendation[] = [];

    for (const def of MYTHOLOGY_DEFINITIONS) {
      const matchScore = computeMatchScore(def, ctx);
      if (matchScore < MIN_DISPLAY_SCORE) continue;

      results.push({
        category: "mythology",
        description: `recommendations.mythology.${def.id}.description`,
        icon: def.icon,
        id: `mythology-${def.id}`,
        matchScore,
        reasoning: {
          explanation: `recommendations.mythology.${def.id}.reasoning`,
          primarySource: def.reasoning.primarySource,
          secondarySource: def.reasoning.secondarySource,
        },
        tags: def.tags,
        title: `recommendations.mythology.${def.id}.title`,
      });
    }

    // TODO(Phase1 step2 통합 후): 그래프 인접 fallback — results가 비면
    // graph/traverse.ts neighbors()로 관계 기반 추천을 채운다.

    return results.sort((a, b) => b.matchScore - a.matchScore);
  }
}
