export const EMPATHY_DIMENSIONS = ["cognitive", "affective", "compassionate"] as const;

export type EmpathyDimension = (typeof EMPATHY_DIMENSIONS)[number];
export type EmpathyScores = Record<EmpathyDimension, number>;

export const EMPATHY_ITEMS_PER_DIMENSION = 4;
export const EMPATHY_MAX_ITEM_SCORE = 4;
export const EMPATHY_MAX_DIMENSION_SCORE = EMPATHY_ITEMS_PER_DIMENSION * EMPATHY_MAX_ITEM_SCORE;

// A difference of one or two answers on the five-point response scale is too
// small to support a strong "type" story. This is a reflection threshold, not
// a psychometric confidence interval.
export const EMPATHY_CLOSE_PROFILE_GAP = 2;

export interface EmpathyProfile {
  primary: EmpathyDimension;
  secondary: EmpathyDimension;
  gap: number;
  isTie: boolean;
  isClose: boolean;
  closeDimensions: EmpathyDimension[];
  closeGap: number;
  ranked: Array<{ dimension: EmpathyDimension; score: number; percent: number }>;
}

export function buildEmpathyProfile(scores: EmpathyScores): EmpathyProfile {
  const ranked = EMPATHY_DIMENSIONS.map((dimension) => {
    const score = Math.max(0, Math.min(EMPATHY_MAX_DIMENSION_SCORE, scores[dimension]));
    return {
      dimension,
      score,
      percent: Math.round((score / EMPATHY_MAX_DIMENSION_SCORE) * 100),
    };
  }).sort((a, b) => b.score - a.score);

  const [first, second] = ranked;
  const gap = first.score - second.score;
  const closeEntries = ranked.filter((entry) => first.score - entry.score <= EMPATHY_CLOSE_PROFILE_GAP);

  return {
    primary: first.dimension,
    secondary: second.dimension,
    gap,
    isTie: gap === 0,
    isClose: closeEntries.length > 1,
    closeDimensions: closeEntries.map((entry) => entry.dimension),
    closeGap: first.score - closeEntries.at(-1)!.score,
    ranked,
  };
}

export function scoreEmpathyAnswers(
  answers: number[],
  dimensions: readonly EmpathyDimension[],
): EmpathyScores | null {
  if (answers.length !== dimensions.length || dimensions.length === 0) return null;
  if (answers.some((answer) => !Number.isInteger(answer) || answer < 0 || answer > EMPATHY_MAX_ITEM_SCORE)) {
    return null;
  }

  const scores: EmpathyScores = { cognitive: 0, affective: 0, compassionate: 0 };
  dimensions.forEach((dimension, index) => {
    scores[dimension] += answers[index];
  });
  return scores;
}
