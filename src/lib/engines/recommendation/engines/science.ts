import type { Recommendation, RecommendationContext } from "../contracts";
import { SCIENCE_DEFINITIONS } from "../data/definitions";
import { computeMatchScore, MIN_DISPLAY_SCORE } from "../scoring";

/**
 * Science Recommendation Engine
 * Provides actionable advice grounded in modern neuroscience and biology.
 */
export class ScienceEngine {
  public static recommend(ctx: RecommendationContext): Recommendation[] {
    const results: Recommendation[] = [];

    for (const def of SCIENCE_DEFINITIONS) {
      const matchScore = computeMatchScore(def, ctx);
      if (matchScore < MIN_DISPLAY_SCORE) continue;

      results.push({
        category: "science",
        description: `recommendations.science.${def.id}.description`,
        icon: def.icon,
        id: `science-${def.id}`,
        matchScore,
        reasoning: {
          explanation: `recommendations.science.${def.id}.reasoning`,
          primarySource: def.reasoning.primarySource,
          secondarySource: def.reasoning.secondarySource,
        },
        tags: def.tags,
        title: `recommendations.science.${def.id}.title`,
      });
    }

    // No graph-adjacency fallback here: `graph/types.ts` `NodeKind` has no
    // "science" kind, so there's nothing in the relationship graph to walk to
    // for this category (see `../graph-fallback.ts`).

    return results.sort((a, b) => b.matchScore - a.matchScore);
  }
}
