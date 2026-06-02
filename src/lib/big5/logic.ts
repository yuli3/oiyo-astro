import { calculateLikertScores } from "@/lib/engines/likert-score";
import { LocalizedText } from "@/types/manifest";

import { BIG5_INSIGHTS, BIG5_QUESTIONS } from "./data";
import { Big5Dimension, Big5Result } from "./types";

export function calculateBig5(answers: Record<string, number>): Big5Result {
  const scores = calculateLikertScores<Big5Dimension>(answers, {
    maxScale: 5,
    minScale: 1,
    questions: BIG5_QUESTIONS,
  });

  // Find primary trait (highest percentage)
  let primaryTrait: Big5Dimension = "openness";
  let maxPercent = -1;

  (Object.keys(scores.percentages) as Big5Dimension[]).forEach((dim) => {
    if (scores.percentages[dim] > maxPercent) {
      maxPercent = scores.percentages[dim];
      primaryTrait = dim;
    }
  });

  // Generate interpretation based on primary trait score (High vs Low)
  // Threshold can be 50% for simple bifurcation
  const isHigh = scores.percentages[primaryTrait] >= 50;
  const interpretation = isHigh
    ? BIG5_INSIGHTS[primaryTrait].high
    : BIG5_INSIGHTS[primaryTrait].low;

  return {
    ...scores,
    interpretation,
    primaryTrait,
    timestamp: Date.now(),
  };
}
