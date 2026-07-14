import type {
  AssessmentResponses,
  AssessmentScorer,
  InstrumentDefinition,
  ResponseValidation,
  ScoreSet,
} from "../../core";
import { ATTACHMENT_DIMENSIONS, ATTACHMENT_INSTRUMENT, type AttachmentDimension } from "./data";

export function validateAttachmentResponses(
  responses: AssessmentResponses,
  instrument: InstrumentDefinition,
): ResponseValidation {
  const errors: string[] = [];
  const expected = new Set(instrument.items.map((item) => item.id));
  for (const id of Object.keys(responses)) {
    if (!expected.has(id)) errors.push(`Unknown attachment item: ${id}`);
  }
  for (const item of instrument.items) {
    const value = responses[item.id];
    if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 5) {
      errors.push(`${item.id} must be an integer from 1 to 5`);
    }
  }
  return { complete: errors.length === 0, errors, responses, warnings: [] };
}

export function scoreAttachment(
  responses: AssessmentResponses,
  context: { instrument: InstrumentDefinition },
): ScoreSet {
  const raw: Record<string, number> = {};
  const normalized: Record<string, number> = {};
  for (const dimension of ATTACHMENT_DIMENSIONS) {
    const items = context.instrument.items.filter((item) => item.constructId.endsWith(`.${dimension}`));
    const sum = items.reduce((total, item) => {
      const value = Number(responses[item.id]);
      return total + (item.reverse ? 6 - value : value);
    }, 0);
    raw[dimension] = sum;
    normalized[dimension] = Math.round(((sum - items.length) / (items.length * 4)) * 100);
  }
  return { normalized, raw };
}

export function attachmentResponsesFromAnswers(answers: number[]): AssessmentResponses {
  return Object.fromEntries(ATTACHMENT_INSTRUMENT.items.map((item, index) => [item.id, answers[index]]));
}

export type AttachmentScoreMap = Record<AttachmentDimension, number>;

export const attachmentScorer: AssessmentScorer = {
  score: scoreAttachment,
  validateResponses: validateAttachmentResponses,
  version: "attachment-anxiety-avoidance-minmax-scoring-v1",
};
