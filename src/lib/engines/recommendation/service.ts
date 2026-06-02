import { RecommendationContext, RecommendationResult } from "./contracts";
import { CareerEngine } from "./engines/career";
import { HobbyEngine } from "./engines/hobby";
import { MythologyEngine } from "./engines/mythology";
import { PsychologyEngine } from "./engines/psychology";
import { ScienceEngine } from "./engines/science";
import { SpiritualityEngine } from "./engines/spirituality";

/**
 * Recommendation Service
 * Orchestrates domain-specific engines to provide actionable life advice.
 */
export class RecommendationService {
  /**
   * Generate a full suite of recommendations based on interpretation data.
   */
  public static generateRecommendations(
    context: RecommendationContext,
  ): RecommendationResult {
    // 1. Generate Career Recommendations
    const careers = CareerEngine.recommend(context);

    // 2. Generate Hobby Recommendations
    const hobbies = HobbyEngine.recommend(context);

    // 3. Generate Diverse Interpetations/Recommendations
    const psychology = PsychologyEngine.recommend(context);
    const mythology = MythologyEngine.recommend(context);
    const science = ScienceEngine.recommend(context);
    const spirituality = SpiritualityEngine.recommend(context);

    // Future: Activities, Wellness, etc.
    const activities: any[] = [];

    return {
      activities,
      careers,
      hobbies,
      mythology,
      psychology,
      science,
      spirituality,
    };
  }
}
