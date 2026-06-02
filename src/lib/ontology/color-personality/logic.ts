import { calculateWeightedScore } from "@/lib/engines/scoring-engine";

import { COLOR_QUESTIONS } from "./data";
import { ColorPersonalityResult, ColorType } from "./types";

export function calculateColorPersonality(
  answers: Record<string, string>,
): ColorPersonalityResult {
  const scores = calculateWeightedScore<ColorType>(answers, COLOR_QUESTIONS);

  const sorted = (Object.entries(scores) as [ColorType, number][]).sort(
    (a, b) => b[1] - a[1],
  );

  // Default to blue if empty
  if (sorted.length === 0) {
    return {
      primaryColor: "blue",
      secondaryColor: "green",
    };
  }

  const primary = sorted[0][0];
  const secondary = sorted.length > 1 ? sorted[1][0] : primary;

  return {
    primaryColor: primary,
    secondaryColor: secondary,
  };
}
