import { Recommendation, RecommendationContext } from "../contracts";
import { SCIENCE_DEFINITIONS } from "../data/definitions";

/**
 * Science Recommendation Engine
 * Provides actionable advice grounded in modern neuroscience and biology.
 */
export class ScienceEngine {
  public static recommend(ctx: RecommendationContext): Recommendation[] {
    const results: Recommendation[] = [];

    for (const def of SCIENCE_DEFINITIONS) {
      // Default high score for pilot
      const score = 80;

      if (score > 50) {
        results.push({
          category: "science",
          description: `recommendations.science.${def.id}.description`,
          icon: def.icon,
          id: `science-${def.id}`,
          matchScore: score,
          reasoning: {
            explanation: `recommendations.science.${def.id}.reasoning`,
            // @ts-ignore
            primarySource: def.reasoning.primarySource,
            // @ts-ignore
            secondarySource: def.reasoning.secondarySource,
          },
          tags: def.tags,
          title: `recommendations.science.${def.id}.title`,
        });
      }
    }

    return results;
  }
}
