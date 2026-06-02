import { LikertScoreResult } from "@/lib/engines/likert-score";
import { LocalizedText } from "@/types/manifest";

export type HEXACODimension =
  | "A" // Agreeableness
  | "C" // Conscientiousness
  | "E" // Emotionality
  | "H" // Honesty-Humility
  | "O" // Openness to Experience
  | "X"; // eXtraversion

export type HEXACOFacet =
  // H Facets
  | "A_Flexibility"
  | "A_Forgiveness"
  | "A_Gentleness"
  | "A_Patience"
  // E Facets
  | "C_Diligence"
  | "C_Organization"
  | "C_Perfectionism"
  | "C_Prudence"
  // X Facets
  | "E_Anxiety"
  | "E_Dependence"
  | "E_Fearfulness"
  | "E_Sentimentality"
  // A Facets
  | "H_Fairness"
  | "H_Greed_Avoidance"
  | "H_Modesty"
  | "H_Sincerity"
  // C Facets
  | "O_Aesthetic_Appreciation"
  | "O_Creativity"
  | "O_Inquisitiveness"
  | "O_Unconventionality"
  // O Facets
  | "X_Liveliness"
  | "X_Sociability"
  | "X_Social_Boldness"
  | "X_Social_Self_Esteem";

export interface HEXACOQuestion {
  dimension: HEXACODimension;
  facet?: HEXACOFacet; // New for Detail
  id: string;
  isReversed?: boolean;
  options?: {
    color?: string;
    id: string;
    text: LocalizedText;
    value: number;
  }[];
  text: LocalizedText;
}

export interface HEXACOResult extends LikertScoreResult<HEXACODimension> {
  facetScores: Partial<Record<HEXACOFacet, number>>; // Facet breakdown
  honestyLevel: "High" | "Low" | "Medium";
  interpretation: LocalizedText;
  timestamp: number;
}
