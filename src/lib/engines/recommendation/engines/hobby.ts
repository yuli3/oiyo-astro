import { Recommendation, RecommendationContext } from "../contracts";
import { HOBBY_DEFINITIONS } from "../data/definitions";
import { computeMatchScore, MIN_DISPLAY_SCORE } from "../scoring";

/**
 * Hobby Recommendation Engine
 * Synthesizes TCI (Temperament), Big Five, and Elemental Balance for hobbies.
 */
export class HobbyEngine {
  public static recommend(ctx: RecommendationContext): Recommendation[] {
    const results: Recommendation[] = [];

    for (const def of HOBBY_DEFINITIONS) {
      const matchScore = computeMatchScore(def, ctx);
      if (matchScore < MIN_DISPLAY_SCORE) continue;

      results.push({
        category: "hobby",
        description: `recommendations.hobby.${def.id}.description`,
        icon: def.icon,
        id: `hobby-${def.id}`,
        matchScore,
        reasoning: {
          explanation: `recommendations.hobby.${def.id}.reasoning`,
          primarySource: def.reasoning.primarySource,
          secondarySource: def.reasoning.secondarySource,
        },
        tags: def.tags,
        title: `recommendations.hobby.${def.id}.title`,
      });
    }

    // TODO(Phase1 step2 통합 후): 그래프 인접 fallback — results가 비면
    // graph/traverse.ts neighbors()로 관계 기반 추천을 채운다.

    return results.sort((a, b) => b.matchScore - a.matchScore);
  }
}
