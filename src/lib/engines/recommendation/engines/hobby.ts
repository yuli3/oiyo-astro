import { Recommendation, RecommendationContext } from "../contracts";
import { HOBBY_DEFINITIONS } from "../data/definitions";
import { graphAdjacentRecommendations } from "../graph-fallback";
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

    // No signal directly matched any definition — fall back to graph-adjacent
    // hobbies so the user still sees a relationship-based suggestion instead
    // of an empty list. See `../graph-fallback.ts` for why this can't just
    // "boost" one of the definitions above.
    if (results.length === 0) {
      results.push(...graphAdjacentRecommendations("hobby", ctx));
    }

    return results.sort((a, b) => b.matchScore - a.matchScore);
  }
}
