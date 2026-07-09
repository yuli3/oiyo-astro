import { Recommendation, RecommendationContext } from "../contracts";
import { CAREER_DEFINITIONS } from "../data/definitions";
import { graphAdjacentRecommendations } from "../graph-fallback";
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

    // No signal directly matched any definition — fall back to graph-adjacent
    // careers so the user still sees a relationship-based suggestion instead
    // of an empty list. See `../graph-fallback.ts` for why this can't just
    // "boost" one of the definitions above.
    if (results.length === 0) {
      results.push(...graphAdjacentRecommendations("career", ctx));
    }

    return results.sort((a, b) => b.matchScore - a.matchScore);
  }
}
