import { LocalizedText } from "@/types/manifest";

import { BALANCE_QUESTIONS, BalanceQuestion } from "./data";
import {
  BALANCE_CATEGORIES,
  BalanceCategoryKey,
  BalanceResult,
  BalanceScores,
} from "./types";

export function calculateBalance(
  answers: Record<string, string>,
): BalanceResult {
  const scores: BalanceScores = {
    career: 0,
    contribution: 0,
    environment: 0,
    finance: 0,
    fun: 0,
    health: 0,
    personal: 0,
    relationships: 0,
  };

  const counts: Record<BalanceCategoryKey, number> = {
    career: 0,
    contribution: 0,
    environment: 0,
    finance: 0,
    fun: 0,
    health: 0,
    personal: 0,
    relationships: 0,
  };

  Object.entries(answers).forEach(([qId, optionId]) => {
    const question = BALANCE_QUESTIONS.find((q) => q.id === qId);
    if (!question) return;

    const option = question.options.find((o) => o.id === optionId);
    if (!option) return;

    scores[question.category] += option.score;
    counts[question.category] += 1;
  });

  // Average per category
  (Object.keys(scores) as BalanceCategoryKey[]).forEach((key) => {
    if (counts[key] > 0) {
      scores[key] = Math.round(scores[key] / counts[key]);
    }
  });

  // Calculate Overall Balance (Weighted? Or simple average? Archive said simple avg)
  // Archive had weights in constants but analyzer used simple average.
  // I will use weights from BALANCE_CATEGORIES if I want, but for now simple avg is safer for "Balance" wheel.
  const allScores = Object.values(scores);
  const averageScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;

  // Calculate Variance for Balance Metric
  const variance =
    allScores.reduce((sum, s) => sum + Math.pow(s - averageScore, 2), 0) /
    allScores.length;
  const stdDev = Math.sqrt(variance);

  // Balance Score (Higher Avg - Penalty for Variance)
  const penalty = stdDev * 0.5;
  const overallBalance = Math.max(
    0,
    Math.min(100, Math.round(averageScore - penalty)),
  );

  // Recommendations
  const sortedCategories = (
    Object.entries(scores) as [BalanceCategoryKey, number][]
  ).sort((a, b) => b[1] - a[1]); // Descending

  const strongestAreas = sortedCategories.slice(0, 3).map((c) => c[0]);
  const improvementAreas = sortedCategories
    .slice(-3)
    .map((c) => c[0])
    .reverse(); // Lowest first

  const recommendations: LocalizedText[] = improvementAreas.map((area) =>
    getRecommendation(area),
  );

  let balanceLevel: BalanceResult["balanceLevel"] = "moderately-balanced";
  if (overallBalance >= 80 && stdDev < 15) balanceLevel = "well-balanced";
  else if (overallBalance < 50 || stdDev > 25) balanceLevel = "needs-attention";
  if (overallBalance < 30) balanceLevel = "critical-imbalance";

  return {
    balanceLevel,
    improvementAreas,
    overallBalance,
    recommendations,
    scores,
    strongestAreas,
  };
}

function getRecommendation(area: BalanceCategoryKey): LocalizedText {
  const recs: Record<BalanceCategoryKey, LocalizedText> = {
    career: {
      en: "Reflect on your core values and how they align with your work.",
      ko: "당신의 핵심 가치와 업무가 어떻게 일치하는지 성찰해보세요.",
    },
    contribution: {
      en: "Look for a small act of kindness you can do today.",
      ko: "오늘 할 수 있는 작은 친절을 찾아보세요.",
    },
    environment: {
      en: "Declutter one small area of your living space.",
      ko: "생활 공간의 작은 구역 하나를 정리해보세요.",
    },
    finance: {
      en: "Create a simple budget and track expenses for a week.",
      ko: "간단한 예산을 세우고 일주일간 지출을 추적해보세요.",
    },
    fun: {
      en: "Schedule one activity purely for joy this weekend.",
      ko: "이번 주말에 순수한 즐거움을 위한 활동을 하나 계획하세요.",
    },
    health: {
      en: "Prioritize sleep and move for at least 20 minutes daily.",
      ko: "수면을 우선시하고 매일 20분 이상 움직이세요.",
    },
    personal: {
      en: "Dedicate 15 minutes a day to a hobby or learning.",
      ko: "매일 15분을 취미나 학습에 투자하세요.",
    },
    relationships: {
      en: "Reach out to one friend or family member today.",
      ko: "오늘 가족이나 친구 한 명에게 연락해보세요.",
    },
  };
  return recs[area];
}
