import { calculateWeightedScore } from "@/lib/engines/scoring-engine";

import {
  LEARNING_STYLE_DESCRIPTIONS,
  LEARNING_STYLE_ENVIRONMENTS,
  LEARNING_STYLE_QUESTIONS,
  LEARNING_STYLE_STUDY_TIPS,
} from "./data";
import { LearningStyle, LearningStyleResult } from "./types";

export function calculateLearningStyleResult(
  answers: Record<string, string>,
): LearningStyleResult {
  // Adapt to engine needs
  // calculateWeightedScore expects options to have 'weights'.
  // Our data has `option.style` and `option.weight`.
  // We need to transform or just implement custom (as previous code did).
  // But wait! We can adapt the questions structure quickly or use calculateCategoryScore?
  // calculateCategoryScore works if we have code/type.
  // Our questions don't have code. The OPTIONS define the category.

  // Let's stick to custom implementation but CLEAN like riasec's.

  const scores: Record<LearningStyle, number> = {
    auditory: 0,
    kinesthetic: 0,
    reading: 0,
    visual: 0,
  };

  Object.entries(answers).forEach(([questionId, optionId]) => {
    const question = LEARNING_STYLE_QUESTIONS.find((q) => q.id === questionId);
    if (question) {
      const option = question.options.find((o) => o.id === optionId);
      if (option) {
        scores[option.style] += option.weight;
      }
    }
  });

  const totalScore = Object.values(scores).reduce(
    (sum, score) => sum + score,
    0,
  );
  const percentages: Record<LearningStyle, number> = {} as Record<
    LearningStyle,
    number
  >;

  Object.entries(scores).forEach(([style, score]) => {
    percentages[style as LearningStyle] =
      totalScore > 0 ? Math.round((score / totalScore) * 100) : 0;
  });

  const sortedStyles = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([style]) => style as LearningStyle);

  const primary = sortedStyles[0];
  const secondary = sortedStyles[1];

  return {
    description: LEARNING_STYLE_DESCRIPTIONS[primary],
    idealEnvironment: LEARNING_STYLE_ENVIRONMENTS[primary],
    percentages,
    primary,
    scores,
    secondary,
    studyTips: LEARNING_STYLE_STUDY_TIPS[primary],
  };
}
