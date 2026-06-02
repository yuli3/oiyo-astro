import { LikertScoreResult } from "@/lib/engines/likert-score";
import { LocalizedText } from "@/types/manifest";

export type Big5Dimension =
  | "agreeableness"
  | "conscientiousness"
  | "extraversion"
  | "neuroticism"
  | "openness";

export interface Big5Question {
  dimension: Big5Dimension;
  id: string;
  isReversed?: boolean;
  options?: {
    color?: string; // Optional for UI
    id: string;
    text: LocalizedText;
    value: number;
  }[];
  text: LocalizedText;
}

export interface Big5Result extends LikertScoreResult<Big5Dimension> {
  interpretation: LocalizedText;
  primaryTrait: Big5Dimension;
  timestamp: number;
}
