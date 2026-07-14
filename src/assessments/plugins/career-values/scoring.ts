import type { AssessmentClassification, AssessmentLocale, AssessmentResponses, AssessmentScorer, InstrumentDefinition, ResponseValidation, ScoreSet } from "../../core";
import { CAREER_VALUE_IDS, CAREER_VALUES_COPY, type CareerValueId } from "./copy";
import { careerValueDimensionForItem } from "./data";

export function validateCareerValuesResponses(responses: AssessmentResponses, instrument: InstrumentDefinition): ResponseValidation {
  const errors: string[] = [];
  const expected = new Set(instrument.items.map((item) => item.id));
  for (const id of Object.keys(responses)) if (!expected.has(id)) errors.push(`Unknown career-values item: ${id}`);
  for (const item of instrument.items) {
    const value = responses[item.id];
    if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 5) errors.push(`${item.id} must be an integer from 1 to 5`);
  }
  return { complete: errors.length === 0, errors, responses, warnings: [] };
}

export function scoreCareerValues(responses: AssessmentResponses, context: { instrument: InstrumentDefinition }): ScoreSet {
  const raw = Object.fromEntries(CAREER_VALUE_IDS.map((id) => [id, 0]));
  for (const item of context.instrument.items) {
    const dimension = careerValueDimensionForItem(item.id);
    if (dimension) raw[dimension] += Number(responses[item.id]);
  }
  const normalized = Object.fromEntries(CAREER_VALUE_IDS.map((id) => [id, Math.round(((raw[id] - 3) / 12) * 100)]));
  return { raw, normalized };
}

export function rankedCareerValueGroups(scores: Record<string, number>): CareerValueId[][] {
  const levels = [...new Set(CAREER_VALUE_IDS.map((id) => scores[id] ?? 0))].sort((a, b) => b - a);
  return levels.map((score) => CAREER_VALUE_IDS.filter((id) => (scores[id] ?? 0) === score));
}

export function topCareerValueGroup(scores: Record<string, number>): CareerValueId[] { return rankedCareerValueGroups(scores)[0] ?? []; }

export function careerValuesClassifications(scores: Record<string, number>, locale: AssessmentLocale = "en"): AssessmentClassification[] {
  return topCareerValueGroup(scores).map((id) => ({ constructId: `values.work.${id}`, id: `career-values-top-${id}`, label: CAREER_VALUES_COPY[locale].dimensions[id].name }));
}

export const careerValuesScorer: AssessmentScorer = { score: scoreCareerValues, validateResponses: validateCareerValuesResponses, version: "career-values-oiyo-six-dimension-v1" };
