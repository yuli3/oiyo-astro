export interface WeightedValue {
  value: number;
  weight: number;
}

/**
 * Calculates a weighted average of values.
 */
export function calculateWeightedAverage(items: WeightedValue[]): number {
  let totalWeightedValue = 0;
  let totalWeight = 0;

  items.forEach((item) => {
    totalWeightedValue += item.value * item.weight;
    totalWeight += item.weight;
  });

  if (totalWeight === 0) return 50; // Neutral fallback
  return Math.round(totalWeightedValue / totalWeight);
}

/**
 * Normalizes scores from various systems into a single 0-100 scale.
 */
export function normalizeScore(
  rawScore: number,
  min: number = 0,
  max: number = 100,
): number {
  const normalized = ((rawScore - min) / (max - min)) * 100;
  return Math.min(100, Math.max(0, normalized));
}
