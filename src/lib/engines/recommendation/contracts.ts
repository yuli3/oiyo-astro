import { SixLangString } from "../interpretation/engine.contract";
import { UniversalInterpretationResult } from "../interpretation/engine.contract";

/**
 * A single recommendation item.
 */
export interface Recommendation {
  category: RecommendationCategory;
  /** Detailed description (Translation Key) */
  description: string;
  /** UI Metadata */
  icon: string; // Lucide icon name
  /** Unique ID for tracking/analytics */
  id: string;
  matchScore: number; // Confidence/Relevance score (0-100)
  /** The "Why" */
  reasoning: RecommendationReasoning;
  tags: string[]; // e.g. ["Creative", "Outdoor"]
  /** Display title (Translation Key) */
  title: string;
}

/**
 * Recommendation Categories
 * Defines the scope of life advice we provide.
 */
export type RecommendationCategory =
  | "activity"
  | "career"
  | "hobby"
  | "mythology"
  | "psychology"
  | "science"
  | "spirituality"
  | "wellness";

/**
 * Context required for generating recommendations.
 * Combines astrological data with psychological profiles.
 */
export interface RecommendationContext {
  /** The full output from the Interpretation Layer */
  interpretation: UniversalInterpretationResult;
  /** User profile data (if separated) */
  profile?: {
    age?: number;
    gender?: string;
  };
}

/**
 * Detailed reasoning for Explainable AI.
 * Answers "Why was this recommended?"
 */
export interface RecommendationReasoning {
  /** Localized explanation strings (Translation Key) */
  explanation: string;
  /** The primary engine that drove this decision (e.g., "saju") */
  primarySource: string;
  /** Secondary supporting engine (e.g., "mbti") */
  secondarySource?: string;
}

/**
 * Result structure returned by RecommendationService.
 */
export interface RecommendationResult {
  activities: Recommendation[];
  careers: Recommendation[];
  hobbies: Recommendation[];
  mythology: Recommendation[];
  psychology: Recommendation[];
  science: Recommendation[];
  spirituality: Recommendation[];
}
