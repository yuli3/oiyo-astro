import { LikertScoreResult } from "@/lib/engines/likert-score";
import { LocalizedText } from "@/types/manifest";

export type PerfectionismDimension = "Adaptive" | "Maladaptive";

export interface PerfectionismQuestion {
  dimension: PerfectionismDimension;
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

export interface PerfectionismResult extends LikertScoreResult<PerfectionismDimension> {
  classification:
    | "Free Spirit"
    | "Grinder"
    | "Master Artisan"
    | "Tortured Critic";
  interpretation: LocalizedText;
  timestamp: number;
}
