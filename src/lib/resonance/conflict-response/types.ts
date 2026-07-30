import type { LocalizedContent } from "@/types/manifest";

export interface ConflictQuestion {
  id: string;
  options: {
    id: string;
    text: LocalizedContent;
    weights: Partial<Record<ConflictStyleType, number>>;
  }[];
  text: LocalizedContent;
}

export interface ConflictResponseResult {
  advice: LocalizedContent;
  description: LocalizedContent;
  primaryStyle: ConflictStyleType;
  resonanceImpact: LocalizedContent;
  scores: Record<ConflictStyleType, number>;
  secondaryStyle: ConflictStyleType;
}

export type ConflictStyleType =
  | "accommodating"
  | "avoiding"
  | "collaborating"
  | "competing"
  | "compromising";
