export const ASSESSMENT_LOCALES = ["ko", "en", "ja", "zh", "fr", "es"] as const;

export type AssessmentLocale = (typeof ASSESSMENT_LOCALES)[number];

export type EvidenceTier =
  | "validated-scale"
  | "research-inspired"
  | "reflective-framework"
  | "symbolic-tradition"
  | "educational"
  | "entertainment";

export type AssessmentKind =
  | "psychometric"
  | "mystic"
  | "preference"
  | "skill"
  | "wellness"
  | "other";

export type AssessmentStatus = "draft" | "review" | "production" | "retired";

export type PrimitiveAnswer = boolean | number | string | string[];
export type AssessmentResponses = Record<string, PrimitiveAnswer>;

export interface VersionSet {
  instrument: string;
  interpretation: string;
  scoring: string;
}
