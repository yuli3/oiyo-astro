import { LocalizedText } from "@/types/manifest";

export interface BalanceCategory {
  id: string;
  weight: number;
}

export type BalanceCategoryKey =
  | "career"
  | "contribution"
  | "environment"
  | "finance"
  | "fun"
  | "health"
  | "personal"
  | "relationships";

export interface BalanceResult {
  balanceLevel:
    | "critical-imbalance"
    | "moderately-balanced"
    | "needs-attention"
    | "well-balanced";
  improvementAreas: BalanceCategoryKey[];
  overallBalance: number; // 0-100
  recommendations: LocalizedText[];
  scores: BalanceScores;
  strongestAreas: BalanceCategoryKey[];
}

export interface BalanceScores {
  career: number; // Work satisfaction & growth
  contribution: number; // Giving back, purpose, meaning
  environment: number; // Living space & surroundings
  finance: number; // Financial security & management
  fun: number; // Recreation & enjoyment
  health: number; // Physical & mental wellbeing
  personal: number; // Personal development & hobbies
  relationships: number; // Family, friends, romance
}

export const BALANCE_CATEGORIES: { id: BalanceCategoryKey; weight: number }[] =
  [
    { id: "health", weight: 15 },
    { id: "relationships", weight: 15 },
    { id: "career", weight: 15 },
    { id: "finance", weight: 12 },
    { id: "personal", weight: 12 },
    { id: "environment", weight: 10 },
    { id: "fun", weight: 11 },
    { id: "contribution", weight: 10 },
  ];
