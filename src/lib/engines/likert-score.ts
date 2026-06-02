/**
 * Likert Scale Engine ("The Reversible Brain")
 *
 * A generic engine for processing Likert-scale based psychological assessments.
 * Supports:
 * - Reverse scoring (isReversed)
 * - Dimension grouping
 * - Score normalization (Raw -> Percentile/Percentage)
 */

export interface LikertQuestion<DimensionType extends string = string> {
  dimension: DimensionType;
  id: string;
  isReversed?: boolean;
  weight?: number; // Defaults to 1 if undefined
}

export interface LikertScaleConfig<DimensionType extends string = string> {
  maxScale: number; // e.g., 5 (Strongly Agree)
  minScale: number; // e.g., 1 (Strongly Disagree)
  questions: LikertQuestion<DimensionType>[];
}

export interface LikertScoreResult<DimensionType extends string = string> {
  maxPossibleScores: Record<DimensionType, number>;
  percentages: Record<DimensionType, number>; // 0 to 100
  rawScores: Record<DimensionType, number>;
}

/**
 * Calculates scores based on provided answers and configuration.
 * @param answers Record<questionId, scaleValue>
 * @param config LikertScaleConfig
 */
export function calculateLikertScores<DimensionType extends string = string>(
  answers: Record<string, number>,
  config: LikertScaleConfig<DimensionType>,
): LikertScoreResult<DimensionType> {
  const rawScores = {} as Record<DimensionType, number>;
  const maxPossibleScores = {} as Record<DimensionType, number>;

  // Initialize scores
  config.questions.forEach((q) => {
    if (rawScores[q.dimension] === undefined) {
      rawScores[q.dimension] = 0;
      maxPossibleScores[q.dimension] = 0;
    }
  });

  // Calculate scores
  config.questions.forEach((q) => {
    const rawValue = answers[q.id];

    // Skip unanswered questions (or handle as 0/mid-point depending on policy)
    // Here we assume strict validation ensures all questions are answered,
    // or we treat missing as minScale (or ignore).
    // For this engine, we'll ignore missing values in summation but track max possible based on ALL questions.
    // Ideally, the UI ensures completeness.
    if (rawValue === undefined) return;

    const weight = q.weight ?? 1;

    // Reverse Scoring Logic: "The Reversible Brain"
    // If scale is 1-5:
    // Normal: 5 is high.
    // Reversed: 1 is high (5), 2 is (4), 3 is (3), 4 is (2), 5 is (1).
    // Formula: (Max + Min) - Value
    // Example: (5 + 1) - 1 = 5. (5 + 1) - 5 = 1.
    const calculatedValue = q.isReversed
      ? config.maxScale + config.minScale - rawValue
      : rawValue;

    rawScores[q.dimension] += calculatedValue * weight;
    maxPossibleScores[q.dimension] += config.maxScale * weight;
  });

  // Calculate percentages
  const percentages = {} as Record<DimensionType, number>;
  (Object.keys(rawScores) as DimensionType[]).forEach((dim) => {
    const max = maxPossibleScores[dim];
    const raw = rawScores[dim];
    percentages[dim] = max > 0 ? Math.round((raw / max) * 100) : 0;
  });

  return {
    maxPossibleScores,
    percentages,
    rawScores,
  };
}

/**
 * Normalizes a raw score to a percentile based on mean and standard deviation (if available),
 * or simply returns the percentage if no distribution data is provided.
 *
 * TODO: Add Z-score based calculation in Phase 24 for "Scientific Authority".
 */
export function normalizeToPercentile(
  rawScore: number,
  maxScore: number,
  distribution?: { mean: number; stdDev: number },
): number {
  if (!distribution) {
    return Math.round((rawScore / maxScore) * 100);
  }

  // Simple Z-score approximation for now
  // Z = (X - μ) / σ
  // Percentile = CDF(Z)
  // This is a placeholder for the advanced statistical module.
  return Math.round((rawScore / maxScore) * 100);
}
