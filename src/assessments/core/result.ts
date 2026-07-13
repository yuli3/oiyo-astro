import type {
  AssessmentKind,
  AssessmentLocale,
  AssessmentResponses,
  EvidenceTier,
  VersionSet,
} from "./common";
import type { ScoreSet } from "./scoring";

export const ASSESSMENT_RESULT_SCHEMA = "oiyo.assessment-result" as const;
export const ASSESSMENT_RESULT_SCHEMA_VERSION = 2 as const;

export interface AssessmentClassification {
  constructId?: string;
  id: string;
  label: string;
  level?: "high" | "low" | "medium";
}

export interface ResultQuality {
  completionRate: number;
  normPopulation?: string;
  responseWarnings: string[];
  uncertainty?: Record<string, number>;
}

export interface LegacyResultProvenance {
  payload: unknown;
  sourceSchema: "oiyo:test-results:v1";
}

export interface CanonicalAssessmentResult {
  assessmentId: string;
  classifications: AssessmentClassification[];
  completedAt: string;
  evidenceTier: EvidenceTier;
  kind: AssessmentKind;
  legacy?: LegacyResultProvenance;
  locale?: AssessmentLocale;
  quality: ResultQuality;
  responses?: AssessmentResponses;
  resultId: string;
  schema: typeof ASSESSMENT_RESULT_SCHEMA;
  schemaVersion: typeof ASSESSMENT_RESULT_SCHEMA_VERSION;
  scores: ScoreSet;
  sourcePath?: string;
  versions: VersionSet;
}
