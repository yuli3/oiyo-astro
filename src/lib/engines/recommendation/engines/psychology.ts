import { Recommendation, RecommendationContext } from "../contracts";
import { PSYCHOLOGY_DEFINITIONS } from "../data/definitions";

/**
 * Psychology Recommendation Engine
 * Synthesizes psychological profiles (MBTI, TCI) to offer deep shadow work and healing advice.
 */
export class PsychologyEngine {
  public static recommend(ctx: RecommendationContext): Recommendation[] {
    const results: Recommendation[] = [];

    // In a real implementation, we would check ctx.interpretation.mbti against def.scoring.mbti

    for (const def of PSYCHOLOGY_DEFINITIONS) {
      // Default high score for pilot
      const score = 85;

      if (score > 50) {
        results.push({
          category: "psychology",
          description: `recommendations.psychology.${def.id}.description`,
          icon: def.icon,
          id: `psychology-${def.id}`,
          matchScore: score,
          reasoning: {
            explanation: `recommendations.psychology.${def.id}.reasoning`,
            // @ts-ignore
            primarySource: def.reasoning.primarySource,
            // @ts-ignore
            secondarySource: def.reasoning.secondarySource,
          },
          tags: def.tags,
          title: `recommendations.psychology.${def.id}.title`,
        });
      }
    }

    return results;
  }
}
