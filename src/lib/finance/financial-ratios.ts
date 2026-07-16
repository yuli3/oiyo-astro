export function computeRatioPercent(numerator: number, denominator: number): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    throw new RangeError("ratio inputs must be finite and denominator must be non-zero");
  }
  return (numerator / denominator) * 100;
}
