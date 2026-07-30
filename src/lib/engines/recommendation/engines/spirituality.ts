import type { Recommendation, RecommendationContext } from "../contracts";
import { SPIRITUALITY_DEFINITIONS } from "../data/definitions";
import { computeMatchScore, MIN_DISPLAY_SCORE } from "../scoring";

/**
 * Spirituality Recommendation Engine
 * Draws from Eastern Philosophy (Taoism, I Ching) and mystical traditions.
 */
export class SpiritualityEngine {
  public static recommend(ctx: RecommendationContext): Recommendation[] {
    const results: Recommendation[] = [];

    for (const def of SPIRITUALITY_DEFINITIONS) {
      const matchScore = computeMatchScore(def, ctx);
      if (matchScore < MIN_DISPLAY_SCORE) continue;

      results.push({
        category: "spirituality",
        description: `recommendations.spirituality.${def.id}.description`,
        icon: def.icon,
        id: `spirituality-${def.id}`,
        matchScore,
        reasoning: {
          explanation: `recommendations.spirituality.${def.id}.reasoning`,
          primarySource: def.reasoning.primarySource,
          secondarySource: def.reasoning.secondarySource,
        },
        tags: def.tags,
        title: `recommendations.spirituality.${def.id}.title`,
      });
    }

    // No graph-adjacency fallback here: `graph/types.ts` `NodeKind` has no
    // "spirituality" kind, so there's nothing in the relationship graph to
    // walk to for this category (see `../graph-fallback.ts`).

    return results.sort((a, b) => b.matchScore - a.matchScore);
  }
}
