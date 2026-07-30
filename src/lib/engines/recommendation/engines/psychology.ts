import type { Recommendation, RecommendationContext } from "../contracts";
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

    // No graph-adjacency fallback here: `graph/types.ts` `NodeKind` has no
    // "psychology" kind, so there's nothing in the relationship graph to walk
    // to for this category (see `../graph-fallback.ts`).

    return results.sort((a, b) => b.matchScore - a.matchScore);
  }
}
