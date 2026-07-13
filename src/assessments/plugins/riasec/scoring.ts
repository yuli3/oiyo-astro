import type {
  AssessmentClassification,
  AssessmentResponses,
  AssessmentScorer,
  InstrumentDefinition,
  ResponseValidation,
  ScoreSet,
} from "../../core";
import { RIASEC_DIMENSION_NAMES, RIASEC_DIMENSIONS, type RiasecDimension } from "./data";

export function validateRiasecResponses(
  responses: AssessmentResponses,
  instrument: InstrumentDefinition,
): ResponseValidation {
  const errors: string[] = [];
  for (const item of instrument.items) {
    const value = responses[item.id];
    if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 5) {
      errors.push(`${item.id} must be an integer from 1 to 5`);
    }
  }
  return { complete: errors.length === 0, errors, responses, warnings: [] };
}

export function scoreRiasec(
  responses: AssessmentResponses,
  context: { instrument: InstrumentDefinition },
): ScoreSet {
  const raw: Record<string, number> = {};
  const normalized: Record<string, number> = {};

  for (const dimension of RIASEC_DIMENSIONS) {
    const items = context.instrument.items.filter(
      (item) => item.constructId === `vocation.riasec.${dimension}`,
    );
    const sum = items.reduce((total, item) => total + Number(responses[item.id]), 0);
    const minimum = items.length;
    const maximum = items.length * 5;
    raw[dimension] = sum;
    normalized[dimension] = Math.round(((sum - minimum) / (maximum - minimum)) * 100);
  }

  return { normalized, raw };
}

export function topRiasecDimensions(
  normalized: Record<string, number>,
): RiasecDimension[] {
  return [...RIASEC_DIMENSIONS]
    .sort((left, right) => {
      const scoreDifference = (normalized[right] ?? 0) - (normalized[left] ?? 0);
      return scoreDifference || RIASEC_DIMENSIONS.indexOf(left) - RIASEC_DIMENSIONS.indexOf(right);
    })
    .slice(0, 3);
}

export function riasecClassifications(
  normalized: Record<string, number>,
): AssessmentClassification[] {
  return topRiasecDimensions(normalized).map((dimension, index) => ({
    constructId: `vocation.riasec.${dimension}`,
    id: `riasec-rank-${index + 1}`,
    label: RIASEC_DIMENSION_NAMES[dimension],
  }));
}

export const riasecScorer: AssessmentScorer = {
  score: scoreRiasec,
  validateResponses: validateRiasecResponses,
  version: "riasec-minmax-scoring-v1",
};
