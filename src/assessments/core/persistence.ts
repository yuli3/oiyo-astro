import type { AssessmentLocale, AssessmentResponses } from "./common";
import type { AssessmentPlugin } from "./plugin";
import {
  ASSESSMENT_RESULT_SCHEMA,
  ASSESSMENT_RESULT_SCHEMA_VERSION,
  type AssessmentClassification,
  type CanonicalAssessmentResult,
} from "./result";

export const OIYO_ASSESSMENT_RESULTS_STORAGE_KEY = "oiyo:assessment-results:v2";
export const OIYO_ASSESSMENT_RESULTS_UPDATED_EVENT = "oiyo:assessment-results-updated";
const MAX_RESULTS = 200;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export interface BuildAssessmentResultInput {
  classifications?: AssessmentClassification[];
  completedAt?: string;
  locale?: AssessmentLocale;
  resultId?: string;
  sourcePath?: string;
}

function browserStorage(): StorageLike | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isCanonicalResult(value: unknown): value is CanonicalAssessmentResult {
  if (!value || typeof value !== "object") return false;
  const result = value as Partial<CanonicalAssessmentResult>;
  return (
    result.schema === ASSESSMENT_RESULT_SCHEMA &&
    result.schemaVersion === ASSESSMENT_RESULT_SCHEMA_VERSION &&
    typeof result.resultId === "string" &&
    typeof result.assessmentId === "string"
  );
}

export function buildAssessmentResult(
  plugin: AssessmentPlugin,
  responses: AssessmentResponses,
  input: BuildAssessmentResultInput = {},
): CanonicalAssessmentResult {
  const validation = plugin.scorer.validateResponses(responses, plugin.instrument);
  if (!validation.complete || validation.errors.length > 0) {
    throw new Error(
      `Cannot build incomplete ${plugin.id} result: ${validation.errors.join(", ") || "missing responses"}`,
    );
  }

  const completedAt = input.completedAt ?? new Date().toISOString();
  return {
    assessmentId: plugin.id,
    classifications: input.classifications ?? [],
    completedAt,
    evidenceTier: plugin.manifest.evidenceTier,
    kind: plugin.manifest.kind,
    locale: input.locale,
    quality: {
      completionRate: 1,
      responseWarnings: validation.warnings,
    },
    responses: validation.responses,
    resultId: input.resultId ?? `${plugin.id}:${completedAt}`,
    schema: ASSESSMENT_RESULT_SCHEMA,
    schemaVersion: ASSESSMENT_RESULT_SCHEMA_VERSION,
    scores: plugin.scorer.score(validation.responses, { instrument: plugin.instrument }),
    sourcePath: input.sourcePath,
    versions: {
      instrument: plugin.instrument.version,
      interpretation: plugin.interpreter.version,
      scoring: plugin.scorer.version,
    },
  };
}

export function listAssessmentResults(storage: StorageLike | null = browserStorage()): CanonicalAssessmentResult[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(OIYO_ASSESSMENT_RESULTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCanonicalResult) : [];
  } catch {
    return [];
  }
}

export function recordAssessmentResult(
  result: CanonicalAssessmentResult,
  storage: StorageLike | null = browserStorage(),
): CanonicalAssessmentResult | null {
  if (!storage) return null;
  try {
    const next = [result, ...listAssessmentResults(storage)].slice(0, MAX_RESULTS);
    storage.setItem(OIYO_ASSESSMENT_RESULTS_STORAGE_KEY, JSON.stringify(next));
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(OIYO_ASSESSMENT_RESULTS_UPDATED_EVENT, { detail: result }),
      );
    }
    return result;
  } catch {
    return null;
  }
}
