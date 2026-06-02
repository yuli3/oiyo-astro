export type AnswerMap = Record<string, string>;

export interface ScoringQuestion {
  code?: string; // For RIASEC (R, I, etc.)
  id: string;
  options?: Array<{
    id: string;
    preference?: string; // For MBTI (E/I, etc.)
    score?: number; // For numeric scoring
    weight?: number;
    weights?: Record<string, number>; // For multi-category scoring
  }>;
  type?: string;
  weight?: number;
}

/**
 * Calculates Category-based scores (e.g., RIASEC, Big5) where category is defined on Question or Option score.
 * Returns scores per category and the top category types (e.g., "RIA").
 */
export function calculateCategoryScore(
  answers: AnswerMap,
  questions: ScoringQuestion[],
  topN: number = 3,
): { scores: Record<string, number>; type: string } {
  // ... existing implementation ...

  const scores: Record<string, number> = {};

  Object.entries(answers).forEach(([questionId, answerValue]) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    // Determine category key (code or type)
    const categoryRaw = question.code || question.type;
    if (!categoryRaw) return;

    // Normalize category key
    const category =
      categoryRaw.length <= 1 ? categoryRaw.toUpperCase() : categoryRaw;

    if (scores[category] === undefined) scores[category] = 0;

    const weight = question.weight || 1;

    // Logic for finding score
    const option = question.options?.find((o) => o.id === answerValue);

    if (option) {
      // Option has explicit score?
      if (typeof option.score === "number") {
        scores[category] += option.score * weight;
      }
    } else if (!isNaN(Number(answerValue))) {
      // Index based (0-4)
      scores[category] += Number(answerValue) * weight;
    } else if (answerValue === "yes") {
      scores[category] += weight;
    }
  });

  // Sort and extract top N
  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);

  if (sorted.length === 0 || sorted[0][1] === 0) {
    return { scores, type: "N/A" };
  }

  const type = sorted
    .filter(([, score]) => score > 0)
    .slice(0, topN)
    .map(([code]) => code)
    .join("");

  return { scores, type };
}

/**
 * Calculates MBTI-style preference scores.
 * Returns both raw scores (e.g., E:5, I:2) and the resulting type string (e.g., "ESTJ").
 */
export function calculatePreferenceScore(
  answers: AnswerMap,
  questions: ScoringQuestion[],
  pairs: string[][] = [
    ["E", "I"],
    ["S", "N"],
    ["T", "F"],
    ["J", "P"],
  ],
): { scores: Record<string, number>; type: string } {
  const scores: Record<string, number> = {};
  // Initialize scores for all letters in pairs
  pairs.flat().forEach((letter) => (scores[letter] = 0));

  Object.entries(answers).forEach(([questionId, selectedValue]) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const option = question.options?.find((o) => o.id === selectedValue);
    if (option && option.preference) {
      const weight = option.weight || question.weight || 1;
      scores[option.preference] = (scores[option.preference] || 0) + weight;
    }
  });

  const type = pairs
    .map(([a, b]) => {
      return (scores[a] || 0) >= (scores[b] || 0) ? a : b;
    })
    .join("");

  return { scores, type };
}

/**
 * Calculates scores where each option contributes specific weights to categories.
 * e.g. "I like building things" -> { Realistic: 3, Conventional: 1 }
 */
export function calculateWeightedScore<T extends string = string>(
  answers: AnswerMap,
  questions: ScoringQuestion[],
): Record<T, number> {
  const scores: Record<string, number> = {};

  Object.entries(answers).forEach(([questionId, optionId]) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const option = question.options?.find((o) => o.id === optionId);
    if (option && option.weights) {
      Object.entries(option.weights).forEach(([category, weight]) => {
        scores[category] = (scores[category] || 0) + weight;
      });
    }
  });

  return scores as Record<T, number>;
}
