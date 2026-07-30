import type { LikertScoreResult } from "@/lib/engines/likert-score";
import type { LocalizedText } from "@/types/manifest";

// Based on Elaine Aron's DOES model
export type HSPDimension =
  | "D" // Depth of Processing
  | "E" // Emotional Reactivity
  | "O" // Overstimulation
  | "S"; // Sensing the Subtle

export interface HSPQuestion {
  dimension: HSPDimension;
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

export interface HSPResult {
  // DOES Breakdown
  dimensionScores: Record<HSPDimension, number>;
  interpretation: LocalizedText;
  isHeavenlyAntenna: boolean; // Top 10% logic

  maxScore: number;

  sensitivityLevel: "High" | "Low" | "Medium";
  timestamp: number;
  totalScore: number; // Sum of all items
}
