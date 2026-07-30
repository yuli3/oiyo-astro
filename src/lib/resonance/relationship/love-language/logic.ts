import type { LoveLanguageResult, LoveLanguageType } from "./types";

export function calculateLoveLanguage(
  answers: Record<string, LoveLanguageType>,
): LoveLanguageResult {
  const scores: Record<LoveLanguageType, number> = {
    acts: 0,
    gifts: 0,
    time: 0,
    touch: 0,
    words: 0,
  };

  Object.values(answers).forEach((type) => {
    if (scores[type] !== undefined) {
      scores[type]++;
    }
  });

  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);

  return {
    primary: sorted[0][0] as LoveLanguageType,
    scores,
    secondary: sorted[1][0] as LoveLanguageType,
    timestamp: Date.now(),
  };
}
