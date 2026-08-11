export type LonelinessLevel = 'connected' | 'moderate' | 'high';

export function scoreLoneliness(
  answers: number[],
  reversed: boolean[],
): { level: LonelinessLevel; score: number } {
  const score = answers.reduce((total, answer, index) => {
    const raw = answer + 1;
    return total + (reversed[index] ? 5 - raw : raw);
  }, 0);
  const level: LonelinessLevel = score >= 29 ? 'high' : score >= 20 ? 'moderate' : 'connected';
  return { level, score };
}
