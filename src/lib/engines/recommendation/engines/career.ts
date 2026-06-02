import { Recommendation, RecommendationContext } from "../contracts";
import { CAREER_DEFINITIONS } from "../data/definitions";

/**
 * Career Recommendation Engine
 * Synthesizes Saju, MBTI, and RIASEC for career advice.
 * Now Metadata-Driven.
 */
export class CareerEngine {
  public static recommend(ctx: RecommendationContext): Recommendation[] {
    const results: Recommendation[] = [];
    const { interpretation } = ctx;

    // Extract signals
    const sajuProfile = interpretation.saju?.tenGodProfile;
    const mbtiType = interpretation.mbti?.code; // e.g. "INTJ"
    const mbtiTraits = mbtiType ? mbtiType.split("") : [];

    for (const def of CAREER_DEFINITIONS) {
      let score = 0;
      const reason = "";

      // Saju Scoring
      if (def.scoring.saju?.dominantTenGod && sajuProfile?.dominant) {
        if (def.scoring.saju.dominantTenGod.includes(sajuProfile.dominant)) {
          score += 50;
        }
      }

      // MBTI Scoring
      if (def.scoring.mbti?.traits && mbtiTraits.length > 0) {
        const matches = def.scoring.mbti.traits.filter((t) =>
          mbtiTraits.includes(t),
        );
        score += matches.length * 15;
      }

      // Threshold
      if (score >= 40) {
        results.push({
          category: "career",
          description: `recommendations.career.${def.id}.description`,
          icon: def.icon,
          id: `career-${def.id}`,
          matchScore: Math.min(score, 100),
          reasoning: {
            explanation: `recommendations.career.${def.id}.reasoning`,
            primarySource: def.reasoning.primarySource,
            secondarySource: def.reasoning.secondarySource,
          },
          tags: def.tags,
          title: `recommendations.career.${def.id}.title`,
        });
      }
    }

    // Fallback if no specific match (demonstration only)
    if (results.length === 0) {
      // In a real engine, we'd have a robust fallback or broad categories.
      // For now, return the first one as a generic suggestion with low score.
      const def = CAREER_DEFINITIONS[1];
      results.push({
        category: "career",
        description: `recommendations.career.${def.id}.description`,
        icon: def.icon,
        id: `career-${def.id}`,
        matchScore: 40,
        reasoning: {
          explanation: `recommendations.career.${def.id}.reasoning`,
          primarySource: def.reasoning.primarySource,
        },
        tags: def.tags,
        title: `recommendations.career.${def.id}.title`,
      });
    }

    return results;
  }
}
