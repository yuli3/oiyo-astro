import { Recommendation, RecommendationContext } from "../contracts";
import { MYTHOLOGY_DEFINITIONS } from "../data/definitions";

/**
 * Mythology Recommendation Engine
 * Maps user archetypes to mythic heroes and stories (Campbellian Hero's Journey).
 */
export class MythologyEngine {
  public static recommend(ctx: RecommendationContext): Recommendation[] {
    const results: Recommendation[] = [];

    for (const def of MYTHOLOGY_DEFINITIONS) {
      // Default high score for pilot
      const score = 80;

      if (score > 50) {
        results.push({
          category: "mythology",
          description: `recommendations.mythology.${def.id}.description`,
          icon: def.icon,
          id: `mythology-${def.id}`,
          matchScore: score,
          reasoning: {
            explanation: `recommendations.mythology.${def.id}.reasoning`,
            // @ts-ignore
            primarySource: def.reasoning.primarySource,
            // @ts-ignore
            secondarySource: def.reasoning.secondarySource,
          },
          tags: def.tags,
          title: `recommendations.mythology.${def.id}.title`,
        });
      }
    }

    return results;
  }
}
