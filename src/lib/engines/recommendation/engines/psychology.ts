import { Recommendation, RecommendationContext } from "../contracts";
import { PSYCHOLOGY_DEFINITIONS } from "../data/definitions";
import { computeMatchScore, MIN_DISPLAY_SCORE } from "../scoring";

/**
 * Psychology Recommendation Engine
 * Synthesizes psychological profiles (MBTI, Big Five, TCI) to offer deep shadow work and healing advice.
 */
export class PsychologyEngine {
  public static recommend(ctx: RecommendationContext): Recommendation[] {
    const results: Recommendation[] = [];

    for (const def of PSYCHOLOGY_DEFINITIONS) {
      const matchScore = computeMatchScore(def, ctx);
      if (matchScore < MIN_DISPLAY_SCORE) continue;

      results.push({
        category: "psychology",
        description: `recommendations.psychology.${def.id}.description`,
        icon: def.icon,
        id: `psychology-${def.id}`,
        matchScore,
        reasoning: {
          explanation: `recommendations.psychology.${def.id}.reasoning`,
          primarySource: def.reasoning.primarySource,
          secondarySource: def.reasoning.secondarySource,
        },
        tags: def.tags,
        title: `recommendations.psychology.${def.id}.title`,
      });
    }

    // TODO(Phase1 step2 통합 후): 그래프 인접 fallback — results가 비면
    // graph/traverse.ts neighbors()로 관계 기반 추천을 채운다.

    return results.sort((a, b) => b.matchScore - a.matchScore);
  }
}
