import { Recommendation, RecommendationContext } from "../contracts";
import { HOBBY_DEFINITIONS } from "../data/definitions";

/**
 * Hobby Recommendation Engine
 * Synthesizes TCI (Temperament) and Elemental Balance for hobbies.
 */
export class HobbyEngine {
  public static recommend(ctx: RecommendationContext): Recommendation[] {
    const results: Recommendation[] = [];
    const { interpretation } = ctx;

    // Signals
    const tciTraits = interpretation.tci?.temperamentDimensions || [];
    // Real accessible structure needs verification, using safe access for now.

    for (const def of HOBBY_DEFINITIONS) {
      let score = 0;

      // Saju Matching (Mocked for now as 'elementBalance' isn't fully typed in base ctx yet)
      // Assuming we have some way to check element balance.
      // For this refactor, we just pass through if defined.
      if (def.scoring.saju) score += 40;

      if (score > 30) {
        results.push({
          category: "hobby",
          description: `recommendations.hobby.${def.id}.description`,
          icon: def.icon,
          id: `hobby-${def.id}`,
          matchScore: 85, // Placeholder dynamic score
          reasoning: {
            explanation: `recommendations.hobby.${def.id}.reasoning`,
            primarySource: def.reasoning.primarySource,
            secondarySource: def.reasoning.secondarySource,
          },
          tags: def.tags,
          title: `recommendations.hobby.${def.id}.title`,
        });
      }
    }

    // Fallback logic for demo purposes
    if (results.length === 0 && HOBBY_DEFINITIONS.length > 0) {
      const def = HOBBY_DEFINITIONS[0];
      results.push({
        category: "hobby",
        description: `recommendations.hobby.${def.id}.description`,
        icon: def.icon,
        id: `hobby-${def.id}`,
        matchScore: 70,
        reasoning: {
          explanation: `recommendations.hobby.${def.id}.reasoning`,
          primarySource: def.reasoning.primarySource,
        },
        tags: def.tags,
        title: `recommendations.hobby.${def.id}.title`,
      });
    }

    return results;
  }
}
