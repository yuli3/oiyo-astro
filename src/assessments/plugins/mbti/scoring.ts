import type {
  AssessmentClassification,
  AssessmentResponses,
  AssessmentScorer,
  CanonicalAssessmentResult,
  InstrumentDefinition,
  ResponseValidation,
  ScoreSet,
} from "../../core";
import { MBTI_AXES, MBTI_INSTRUMENT, MBTI_POLES, type MbtiAxis, type MbtiPreference } from "./data";

export function validateMbtiResponses(
  responses: AssessmentResponses,
  instrument: InstrumentDefinition,
): ResponseValidation {
  const errors: string[] = [];
  const expectedIds = new Set(instrument.items.map((item) => item.id));
  for (const id of Object.keys(responses)) {
    if (!expectedIds.has(id)) errors.push(`Unknown MBTI item: ${id}`);
  }
  for (const item of instrument.items) {
    const axis = item.constructId.split(".").at(-1) as MbtiAxis;
    const value = responses[item.id];
    if (typeof value !== "string" || !MBTI_POLES[axis].includes(value as MbtiPreference)) {
      errors.push(`${item.id} must be ${MBTI_POLES[axis].join(" or ")}`);
    }
  }
  return { complete: errors.length === 0, errors, responses, warnings: [] };
}

export function scoreMbti(
  responses: AssessmentResponses,
  context: { instrument: InstrumentDefinition },
): ScoreSet {
  const raw: Record<string, number> = {};
  const normalized: Record<string, number> = {};
  for (const axis of MBTI_AXES) {
    const items = context.instrument.items.filter((item) => item.constructId.endsWith(`.${axis}`));
    const firstPole = MBTI_POLES[axis][0];
    const firstCount = items.filter((item) => responses[item.id] === firstPole).length;
    raw[axis] = firstCount;
    normalized[axis] = Math.round((firstCount / items.length) * 100);
  }
  return { normalized, raw };
}

export function mbtiType(
  input: CanonicalAssessmentResult | Record<string, number>,
): string {
  const normalized = "scores" in input ? input.scores.normalized : input;
  return MBTI_AXES.map((axis) => {
    const [first, second] = MBTI_POLES[axis];
    return (normalized[axis] ?? 0) >= 50 ? first : second;
  }).join("");
}

export function mbtiPreferenceScores(
  responses: AssessmentResponses,
): Record<MbtiAxis, number> {
  const scores = scoreMbti(responses, { instrument: MBTI_INSTRUMENT });
  return Object.fromEntries(
    MBTI_AXES.map((axis) => [axis, scores.normalized[axis]]),
  ) as Record<MbtiAxis, number>;
}

export function mbtiTypeFromResponses(responses: AssessmentResponses): string {
  return mbtiType(mbtiPreferenceScores(responses));
}

export function mbtiClassification(
  normalized: Record<string, number>,
): AssessmentClassification[] {
  const type = mbtiType(normalized);
  return [{ id: `mbti-${type}`, label: type }];
}

export const mbtiScorer: AssessmentScorer = {
  score: scoreMbti,
  validateResponses: validateMbtiResponses,
  version: "mbti-preference-count-scoring-v1",
};
