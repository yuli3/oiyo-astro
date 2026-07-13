import type {
  AssessmentKind,
  AssessmentLocale,
  EvidenceTier,
} from "./common";
import {
  ASSESSMENT_RESULT_SCHEMA,
  ASSESSMENT_RESULT_SCHEMA_VERSION,
  type CanonicalAssessmentResult,
} from "./result";
import type { ScoreSet } from "./scoring";

export interface LegacyV1StoredTestResult {
  createdAt: string;
  id: string;
  inputs?: unknown;
  kind: string;
  locale?: string;
  result?: unknown;
  resultLabel: string;
  sourcePath?: string;
  testId: string;
  title: string;
}

export interface LegacyV1AdapterOptions {
  evidenceTier?: EvidenceTier;
  extractScores?: (result: unknown) => ScoreSet;
  instrumentVersion?: string;
  interpretationVersion?: string;
  scoringVersion?: string;
}

const LOCALES = new Set<AssessmentLocale>(["ko", "en", "ja", "zh", "fr", "es"]);
const KINDS = new Set<AssessmentKind>([
  "psychometric",
  "mystic",
  "preference",
  "skill",
  "wellness",
  "other",
]);

function localeOf(value: string | undefined): AssessmentLocale | undefined {
  return value && LOCALES.has(value as AssessmentLocale)
    ? (value as AssessmentLocale)
    : undefined;
}

function kindOf(value: string): AssessmentKind {
  if (value === "ontology" || value === "fortune") return "mystic";
  return KINDS.has(value as AssessmentKind) ? (value as AssessmentKind) : "other";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function numericRecord(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, number] =>
        typeof entry[1] === "number" && Number.isFinite(entry[1]),
    ),
  );
}

function conservativeScores(result: unknown): ScoreSet {
  if (!isRecord(result)) return { normalized: {}, raw: {} };
  return {
    normalized: numericRecord(result.percentages),
    percentile: Object.keys(numericRecord(result.percentile)).length
      ? numericRecord(result.percentile)
      : undefined,
    raw: numericRecord(result.rawScores ?? result.scores),
  };
}

export function adaptLegacyV1StoredTestResult(
  input: LegacyV1StoredTestResult,
  options: LegacyV1AdapterOptions = {},
): CanonicalAssessmentResult {
  const locale = localeOf(input.locale);
  const scores = options.extractScores
    ? options.extractScores(input.result)
    : conservativeScores(input.result);

  return {
    assessmentId: input.testId,
    classifications: input.resultLabel
      ? [{ id: "legacy-primary", label: input.resultLabel }]
      : [],
    completedAt: input.createdAt,
    evidenceTier: options.evidenceTier ?? "educational",
    kind: kindOf(input.kind),
    legacy: {
      payload: input.result,
      sourceSchema: "oiyo:test-results:v1",
    },
    locale,
    quality: {
      completionRate: 1,
      responseWarnings: ["Migrated from legacy v1 without response-level validation"],
    },
    resultId: input.id,
    schema: ASSESSMENT_RESULT_SCHEMA,
    schemaVersion: ASSESSMENT_RESULT_SCHEMA_VERSION,
    scores,
    sourcePath: input.sourcePath,
    versions: {
      instrument: options.instrumentVersion ?? "legacy-v1",
      interpretation: options.interpretationVersion ?? "legacy-v1",
      scoring: options.scoringVersion ?? "legacy-v1",
    },
  };
}
