import { Recommendation, RecommendationContext } from "../contracts";
import { CAREER_DEFINITIONS } from "../data/definitions";
import { computeMatchScore, MIN_DISPLAY_SCORE } from "../scoring";

/**
 * Career Recommendation Engine
 * Synthesizes Saju, MBTI, Big Five, and RIASEC for career advice.
 * Metadata-driven — see `../scoring.ts` for the matching logic.
 */
export class CareerEngine {
  public static recommend(ctx: RecommendationContext): Recommendation[] {
    const results: Recommendation[] = [];

    for (const def of CAREER_DEFINITIONS) {
      const matchScore = computeMatchScore(def, ctx);
      if (matchScore < MIN_DISPLAY_SCORE) continue;

      results.push({
        category: "career",
        description: `recommendations.career.${def.id}.description`,
        icon: def.icon,
        id: `career-${def.id}`,
        matchScore,
        reasoning: {
          explanation: `recommendations.career.${def.id}.reasoning`,
          primarySource: def.reasoning.primarySource,
          secondarySource: def.reasoning.secondarySource,
        },
        tags: def.tags,
        title: `recommendations.career.${def.id}.title`,
      });
    }

    // TODO(Phase1 step2 통합 후): 그래프 인접 fallback — results가 비면
    // graph/traverse.ts neighbors()로 관계 기반 추천을 채운다.

    return results.sort((a, b) => b.matchScore - a.matchScore);
  }
}
