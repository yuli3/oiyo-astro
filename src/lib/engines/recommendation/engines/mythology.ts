import type { Recommendation, RecommendationContext } from "../contracts";
import { MYTHOLOGY_DEFINITIONS } from "../data/definitions";
import { computeMatchScore, MIN_DISPLAY_SCORE } from "../scoring";

/**
 * Mythology Recommendation Engine
 * Maps user archetypes to mythic heroes and stories (Campbellian Hero's Journey).
 */
export class MythologyEngine {
  public static recommend(ctx: RecommendationContext): Recommendation[] {
    const results: Recommendation[] = [];

    for (const def of MYTHOLOGY_DEFINITIONS) {
      const matchScore = computeMatchScore(def, ctx);
      if (matchScore < MIN_DISPLAY_SCORE) continue;

      results.push({
        category: "mythology",
        description: `recommendations.mythology.${def.id}.description`,
        icon: def.icon,
        id: `mythology-${def.id}`,
        matchScore,
        reasoning: {
          explanation: `recommendations.mythology.${def.id}.reasoning`,
          primarySource: def.reasoning.primarySource,
          secondarySource: def.reasoning.secondarySource,
        },
        tags: def.tags,
        title: `recommendations.mythology.${def.id}.title`,
      });
    }

    // No graph-adjacency fallback here: `graph/types.ts` `NodeKind` has no
    // "mythology" kind, so there's nothing in the relationship graph to walk
    // to for this category (see `../graph-fallback.ts`).

    return results.sort((a, b) => b.matchScore - a.matchScore);
  }
}
