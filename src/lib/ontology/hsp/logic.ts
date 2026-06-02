import { calculateLikertScores } from "@/lib/engines/likert-score";
import { LocalizedText } from "@/types/manifest";

import { HSP_QUESTIONS } from "./data";
import { HSPDimension, HSPResult } from "./types";

export function calculateHSP(answers: Record<string, number>): HSPResult {
  // Use generic engine for dimension scores
  const scoreData = calculateLikertScores<HSPDimension>(answers, {
    maxScale: 7, // HSP usually uses 7-point scale
    minScale: 1,
    questions: HSP_QUESTIONS,
  });

  // Calculate Total Score (Sum of all dimensional raw scores)
  // LikertEngine returns rawScores keyed by Dimension.
  // BUT we need total sum of ALL items.
  // scoreData.rawScores[dim] is sum of items in that dim.
  const totalScore = Object.values(scoreData.rawScores).reduce(
    (a, b) => a + b,
    0,
  );

  const maxPossible = HSP_QUESTIONS.length * 7;
  const ratio = totalScore / maxPossible;

  let sensitivityLevel: "High" | "Low" | "Medium" = "Low";
  if (ratio >= 0.75) sensitivityLevel = "High";
  else if (ratio >= 0.5) sensitivityLevel = "Medium";

  const isHeavenlyAntenna = ratio >= 0.85;

  const interpretation: LocalizedText = {
    en: isHeavenlyAntenna
      ? "Your neural system processes environmental subtleties with extraordinary depth (Top 10%)."
      : `Your sensitivity level is ${sensitivityLevel}.`,
    ko: isHeavenlyAntenna
      ? "당신의 신경계는 환경의 미세한 변화를 평균보다 깊게 처리합니다 (상위 10%)."
      : `당신의 감각적 민감성은 ${sensitivityLevel === "High" ? "높음" : sensitivityLevel === "Medium" ? "보통" : "낮음"} 수준입니다.`,
  };

  return {
    dimensionScores: scoreData.rawScores,
    interpretation,
    isHeavenlyAntenna,
    maxScore: maxPossible,
    sensitivityLevel,
    timestamp: Date.now(),
    totalScore,
  };
}
