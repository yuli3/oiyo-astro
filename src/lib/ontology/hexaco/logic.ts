import { calculateLikertScores } from "@/lib/engines/likert-score";
import { LocalizedText } from "@/types/manifest";

import { HEXACO_QUESTIONS } from "./data";
import { HEXACODimension, HEXACOFacet, HEXACOResult } from "./types";

export function calculateHEXACO(answers: Record<string, number>): HEXACOResult {
  const scores = calculateLikertScores<HEXACODimension>(answers, {
    maxScale: 5,
    minScale: 1,
    questions: HEXACO_QUESTIONS,
  });

  // Calculate H-Level
  const hScore = scores.percentages.H;
  let honestyLevel: "High" | "Low" | "Medium" = "Medium";
  if (hScore >= 70) honestyLevel = "High";
  else if (hScore <= 30) honestyLevel = "Low";

  // Facet Calculation (Manual aggregation since LikertEngine aggregates by Dimension)
  const facetScores: Partial<Record<HEXACOFacet, number>> = {};

  HEXACO_QUESTIONS.forEach((q) => {
    if (q.facet) {
      const val = answers[q.id];
      if (val) {
        const adjustedVal = q.isReversed ? 6 - val : val; // 1-5 scale
        facetScores[q.facet] = (facetScores[q.facet] || 0) + adjustedVal;
      }
    }
  });

  const interpretation: LocalizedText = {
    en: `Honesty-Humility Level: ${honestyLevel}. Primary Trait: ${getPrimaryTrait(scores.percentages)}`,
    ko: `정직-겸손 수준: ${honestyLevel === "High" ? "높음" : honestyLevel === "Medium" ? "보통" : "낮음"}. 주요 특성: ${getPrimaryTrait(scores.percentages)}`,
  };

  return {
    ...scores,
    facetScores,
    honestyLevel,
    interpretation,
    timestamp: Date.now(),
  };
}

function getPrimaryTrait(percentages: Record<HEXACODimension, number>): string {
  const maxEntry = Object.entries(percentages).reduce((a, b) =>
    a[1] > b[1] ? a : b,
  );
  return maxEntry[0];
}
