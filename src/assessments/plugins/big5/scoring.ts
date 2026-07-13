import type {
  AssessmentResponses,
  AssessmentScorer,
  InstrumentDefinition,
  ResponseValidation,
  ScoreSet,
} from "../../core";

export const BIG5_DIMENSIONS = ["O", "C", "E", "A", "N"] as const;
export type BigFiveDimension = (typeof BIG5_DIMENSIONS)[number];
export type BigFiveScoreMap = Record<BigFiveDimension, number>;

export const BIG5_LIVE_ITEM_IDS = BIG5_DIMENSIONS.flatMap((dimension) =>
  Array.from({ length: 4 }, (_, index) => `${dimension.toLowerCase()}${index + 1}`),
);

export function bigFiveResponsesFromAnswers(answers: number[]): AssessmentResponses {
  return Object.fromEntries(BIG5_LIVE_ITEM_IDS.map((id, index) => [id, answers[index]]));
}

function validate(
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
  return {
    complete: errors.length === 0,
    errors,
    responses,
    warnings: [],
  };
}

function score(responses: AssessmentResponses, context: { instrument: InstrumentDefinition }): ScoreSet {
  const raw: Record<string, number> = {};
  const normalized: Record<string, number> = {};

  for (const dimension of BIG5_DIMENSIONS) {
    const items = context.instrument.items.filter((item) => item.constructId.endsWith(`.${dimension}`));
    const sum = items.reduce((total, item) => total + Number(responses[item.id]), 0);
    const min = items.length;
    const max = items.length * 5;
    raw[dimension] = sum;
    normalized[dimension] = Math.round(((sum - min) / (max - min)) * 100);
  }

  return { raw, normalized };
}

export const bigFiveScorer: AssessmentScorer = {
  score,
  validateResponses: validate,
  version: "big5-ocean-20-scoring-v1",
};
export function scoreLegacyBigFiveAnswers(answers: number[]): BigFiveScoreMap {
  const scores = score(bigFiveResponsesFromAnswers(answers), { instrument: BIG5_INSTRUMENT });
  return Object.fromEntries(
    BIG5_DIMENSIONS.map((dimension) => [dimension, scores.normalized[dimension]]),
  ) as BigFiveScoreMap;
}

export const BIG5_INSTRUMENT: InstrumentDefinition = {
  items: BIG5_DIMENSIONS.flatMap((dimension) =>
    Array.from({ length: 4 }, (_, index) => ({
      constructId: `psychology.big5.${dimension}`,
      id: `${dimension.toLowerCase()}${index + 1}`,
      promptKey: `items.${dimension.toLowerCase()}${index + 1}`,
      required: true,
      responseScaleId: "likert-5",
    })),
  ),
  responseScales: [{ id: "likert-5", kind: "likert", min: 1, max: 5 }],
  version: "big5-ocean-20-v1",
};
