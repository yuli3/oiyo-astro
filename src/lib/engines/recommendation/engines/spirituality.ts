import { Recommendation, RecommendationContext } from "../contracts";
import { SPIRITUALITY_DEFINITIONS } from "../data/definitions";

/**
 * Spirituality Recommendation Engine
 * Draws from Eastern Philosophy (Taoism, I Ching) and mystical traditions.
 */
export class SpiritualityEngine {
  public static recommend(ctx: RecommendationContext): Recommendation[] {
    const results: Recommendation[] = [];

    for (const def of SPIRITUALITY_DEFINITIONS) {
      // Default high score for pilot
      const score = 80;

      if (score > 50) {
        results.push({
          category: "spirituality",
          description: `recommendations.spirituality.${def.id}.description`,
          icon: def.icon,
          id: `spirituality-${def.id}`,
          matchScore: score,
          reasoning: {
            explanation: `recommendations.spirituality.${def.id}.reasoning`,
            // @ts-ignore
            primarySource: def.reasoning.primarySource,
            // @ts-ignore
            secondarySource: def.reasoning.secondarySource,
          },
          tags: def.tags,
          title: `recommendations.spirituality.${def.id}.title`,
        });
      }
    }

    return results;
  }
}
