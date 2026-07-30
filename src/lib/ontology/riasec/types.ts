import type { LocalizedContent } from "@/types/manifest";

export type RiasecType =
  | "Artistic"
  | "Conventional"
  | "Enterprising"
  | "Investigative"
  | "Realistic"
  | "Social";

// Hexagon Order: R -> I -> A -> S -> E -> C -> (Loops back to R)
export const RIASEC_ORDER: RiasecType[] = [
  "Realistic",
  "Investigative",
  "Artistic",
  "Social",
  "Enterprising",
  "Conventional",
];

export interface RiasecQuestion {
  category?: "Activity" | "Competence" | "Occupation"; // Expanded for Detailed version
  id: string;
  options: {
    id: string;
    text: LocalizedContent;
    weights: Partial<Record<RiasecType, number>>;
  }[];
  text: LocalizedContent;
}

import type { Career } from "@/lib/data-layer/types";

export interface RiasecResult {
  careers: (Career | LocalizedContent)[];
  // New Academic Metrics
  consistency: "High" | "Low" | "Medium"; // Based on Hexagonal distance of top 2 types

  consistencyScore: number; // 3 (High), 2 (Med), 1 (Low)
  description: LocalizedContent;
  differentiation: number; // Gap between Highest and Lowest score
  hexagonCode: string; // e.g. "RIA"

  scores: Record<RiasecType, number>;
  title: LocalizedContent;
  topTypes: RiasecType[];
}
