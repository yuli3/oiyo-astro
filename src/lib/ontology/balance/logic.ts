import type { LocalizedText } from "@/types/manifest";

import { BALANCE_QUESTIONS, type BalanceQuestion } from "./data";
import {
  BALANCE_CATEGORIES,
  type BalanceCategoryKey,
  type BalanceResult,
  type BalanceScores,
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
      es: "Reflexiona sobre tus valores fundamentales y cómo se alinean con tu trabajo.",
      fr: "Réfléchissez à vos valeurs fondamentales et à la façon dont elles s'alignent avec votre travail.",
      ja: "自分の核となる価値観と、それが仕事とどう一致しているかを振り返ってみましょう。",
      ko: "당신의 핵심 가치와 업무가 어떻게 일치하는지 성찰해보세요.",
      zh: "反思你的核心价值观，以及它们如何与你的工作相契合。",
    },
    contribution: {
      en: "Look for a small act of kindness you can do today.",
      es: "Busca un pequeño acto de amabilidad que puedas hacer hoy.",
      fr: "Cherchez un petit geste de gentillesse que vous pouvez faire aujourd'hui.",
      ja: "今日できる小さな親切を探してみましょう。",
      ko: "오늘 할 수 있는 작은 친절을 찾아보세요.",
      zh: "找一件今天就能做的小小善举。",
    },
    environment: {
      en: "Declutter one small area of your living space.",
      es: "Ordena una pequeña zona de tu espacio vital.",
      fr: "Désencombrez une petite zone de votre espace de vie.",
      ja: "生活空間の小さな一角を片付けてみましょう。",
      ko: "생활 공간의 작은 구역 하나를 정리해보세요.",
      zh: "整理一下生活空间中的一个小区域。",
    },
    finance: {
      en: "Create a simple budget and track expenses for a week.",
      es: "Crea un presupuesto sencillo y registra tus gastos durante una semana.",
      fr: "Créez un budget simple et suivez vos dépenses pendant une semaine.",
      ja: "簡単な予算を作り、1週間の支出を記録してみましょう。",
      ko: "간단한 예산을 세우고 일주일간 지출을 추적해보세요.",
      zh: "制定一个简单预算，并记录一周的支出。",
    },
    fun: {
      en: "Schedule one activity purely for joy this weekend.",
      es: "Programa una actividad este fin de semana solo por el placer de disfrutar.",
      fr: "Planifiez une activité ce week-end uniquement pour le plaisir.",
      ja: "今週末、純粋に楽しむための活動を一つ予定しましょう。",
      ko: "이번 주말에 순수한 즐거움을 위한 활동을 하나 계획하세요.",
      zh: "这个周末安排一项纯粹为了快乐的活动。",
    },
    health: {
      en: "Prioritize sleep and move for at least 20 minutes daily.",
      es: "Prioriza el sueño y muévete al menos 20 minutos al día.",
      fr: "Donnez la priorité au sommeil et bougez au moins 20 minutes par jour.",
      ja: "睡眠を優先し、毎日少なくとも20分は体を動かしましょう。",
      ko: "수면을 우선시하고 매일 20분 이상 움직이세요.",
      zh: "优先保证睡眠，并每天至少活动20分钟。",
    },
    personal: {
      en: "Dedicate 15 minutes a day to a hobby or learning.",
      es: "Dedica 15 minutos al día a un pasatiempo o al aprendizaje.",
      fr: "Consacrez 15 minutes par jour à un loisir ou à l'apprentissage.",
      ja: "毎日15分を趣味や学びに充てましょう。",
      ko: "매일 15분을 취미나 학습에 투자하세요.",
      zh: "每天拿出15分钟用于爱好或学习。",
    },
    relationships: {
      en: "Reach out to one friend or family member today.",
      es: "Ponte en contacto hoy con un amigo o familiar.",
      fr: "Contactez aujourd'hui un ami ou un membre de votre famille.",
      ja: "今日、友人か家族の誰か一人に連絡してみましょう。",
      ko: "오늘 가족이나 친구 한 명에게 연락해보세요.",
      zh: "今天联系一位朋友或家人。",
    },
  };
  return recs[area];
}
