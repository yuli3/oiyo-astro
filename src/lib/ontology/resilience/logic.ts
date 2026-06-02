import { RESILIENCE_QUESTIONS, RESILIENCE_RESULTS } from "./data";
import { ResilienceFactor, ResilienceResult } from "./types";

export function calculateResilience(
  answers: Record<string, string>,
): ResilienceResult {
  const factors: Record<ResilienceFactor, number> = {
    adaptability: 0,
    hardiness: 0,
    persistence: 0,
    purpose: 0,
    trust: 0,
  };

  let totalScore = 0;
  let maxPossible = 0;

  for (const q of RESILIENCE_QUESTIONS) {
    const answerId = answers[q.id];
    const option = q.options.find((o) => o.id === answerId);
    if (option) {
      factors[q.factor] += option.score;
      totalScore += option.score;
    }
    maxPossible += 4; // Max score per question is 4
  }

  const scorePercentage = (totalScore / maxPossible) * 100;

  let level: ResilienceResult["level"];
  let resultTemplate;

  if (scorePercentage >= 70) {
    level = scorePercentage >= 85 ? "Legendary" : "High";
    resultTemplate = RESILIENCE_RESULTS.high;
  } else if (scorePercentage >= 40) {
    level = "Moderate";
    resultTemplate = RESILIENCE_RESULTS.moderate;
  } else {
    level = "Low";
    resultTemplate = RESILIENCE_RESULTS.low;
  }

  return {
    advice: resultTemplate.advice,
    description: resultTemplate.description,
    factors,
    level,
    oracleInsight: resultTemplate.oracleInsight,
    score: totalScore,
    title: resultTemplate.title,
  };
}
