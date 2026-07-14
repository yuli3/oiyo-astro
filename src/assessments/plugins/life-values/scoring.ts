import type {
  AssessmentClassification,
  AssessmentResponses,
  AssessmentScorer,
  InstrumentDefinition,
  ResponseValidation,
  ScoreSet,
} from "../../core";
import type { AssessmentLocale } from "../../core";
import { lifeValueCardCopy } from "./copy";
import { LIFE_VALUE_IDS, type LifeValueId } from "./data";

const NORMALIZED_BY_RANK: Record<number, number> = { 0: 0, 1: 100, 2: 80, 3: 60, 4: 40, 5: 20 };

export function validateLifeValuesResponses(
  responses: AssessmentResponses,
  instrument: InstrumentDefinition,
): ResponseValidation {
  const errors: string[] = [];
  const expected = new Set(instrument.items.map((item) => item.id));

  for (const id of Object.keys(responses)) {
    if (!expected.has(id)) errors.push(`Unknown life-values card: ${id}`);
  }

  const counts = new Map<number, number>();
  for (const item of instrument.items) {
    const value = responses[item.id];
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 5) {
      errors.push(`${item.id} must be an integer from 0 to 5`);
      continue;
    }
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  for (let rank = 1; rank <= 5; rank += 1) {
    if (counts.get(rank) !== 1) errors.push(`Rank ${rank} must be assigned to exactly one card`);
  }
  if (counts.get(0) !== instrument.items.length - 5) {
    errors.push(`Exactly ${instrument.items.length - 5} cards must be unselected with rank 0`);
  }

  return { complete: errors.length === 0, errors, responses, warnings: [] };
}

export function scoreLifeValues(
  responses: AssessmentResponses,
  context: { instrument: InstrumentDefinition },
): ScoreSet {
  const raw: Record<string, number> = {};
  const normalized: Record<string, number> = {};
  for (const item of context.instrument.items) {
    const rank = Number(responses[item.id]);
    raw[item.id] = rank;
    normalized[item.id] = NORMALIZED_BY_RANK[rank] ?? 0;
  }
  return { normalized, raw };
}

export function topLifeValues(scores: Record<string, number>): LifeValueId[] {
  return LIFE_VALUE_IDS
    .filter((id) => (scores[id] ?? 0) > 0)
    .sort((left, right) => (scores[right] ?? 0) - (scores[left] ?? 0))
    .slice(0, 5);
}

export function lifeValuesClassifications(
  scores: Record<string, number>,
  locale: AssessmentLocale = "en",
): AssessmentClassification[] {
  return topLifeValues(scores).map((id, index) => ({
    constructId: `values.chosen.${id}`,
    id: `life-values-rank-${index + 1}`,
    label: lifeValueCardCopy(id, locale)[0],
  }));
}

export const lifeValuesScorer: AssessmentScorer = {
  score: scoreLifeValues,
  validateResponses: validateLifeValuesResponses,
  version: "life-values-top-five-relative-priority-v1",
};
