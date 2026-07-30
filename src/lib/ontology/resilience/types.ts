import type { LocalizedContent } from "@/types/manifest";

export type ResilienceFactor =
  | "adaptability"
  | "hardiness"
  | "persistence"
  | "purpose"
  | "trust";

export interface ResilienceQuestion {
  factor: ResilienceFactor;
  id: string;
  options: {
    id: string;
    score: number;
    text: LocalizedContent;
  }[];
  text: LocalizedContent;
}

export interface ResilienceResult {
  advice: LocalizedContent;
  description: LocalizedContent;
  factors: Record<ResilienceFactor, number>;
  level: "High" | "Legendary" | "Low" | "Moderate";
  oracleInsight: LocalizedContent;
  score: number;
  title: LocalizedContent;
}
