import type { ConflictResponseResult, ConflictStyleType } from "./types";

export function calculateConflictResponse(
  answers: Record<string, string>,
  questions: any[],
  resultsData: Record<string, any>,
): ConflictResponseResult {
  const scores: Record<ConflictStyleType, number> = {
    accommodating: 0,
    avoiding: 0,
    collaborating: 0,
    competing: 0,
    compromising: 0,
  };

  for (const q of questions) {
    const answerId = answers[q.id];
    const option = q.options.find((o: any) => o.id === answerId);
    if (option && option.weights) {
      for (const [style, weight] of Object.entries(option.weights)) {
        scores[style as ConflictStyleType] += weight as number;
      }
    }
  }

  const sorted = (Object.entries(scores) as [ConflictStyleType, number][]).sort(
    (a, b) => b[1] - a[1],
  );

  const primary = sorted[0][0];
  const secondary = sorted[1][0];

  const resultData = resultsData[primary];

  if (!resultData) {
    // Fallback if data is missing
    return {
      advice: { en: "", ko: "" },
      description: { en: "Data not found", ko: "데이터를 찾을 수 없습니다" },
      primaryStyle: primary,
      resonanceImpact: { en: "", ko: "" },
      scores,
      secondaryStyle: secondary,
    };
  }

  return {
    advice: resultData.advice,
    description: resultData.description,
    primaryStyle: primary,
    resonanceImpact: resultData.resonanceImpact,
    scores,
    secondaryStyle: secondary,
  };
}
