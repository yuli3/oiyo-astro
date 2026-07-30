import { CONSUMPTION_QUESTIONS, CONSUMPTION_RESULTS } from "./data";
import type { ConsumptionResult, ConsumptionTrait } from "./types";

export function calculateConsumptionStyle(
  answers: Record<string, string>,
): ConsumptionResult {
  const traits: Record<ConsumptionTrait, number> = {
    emotional_satisfaction: 0,
    impulsive: 0,
    prestige_seeking: 0,
    sustainable: 0,
    value_oriented: 0,
  };

  for (const q of CONSUMPTION_QUESTIONS) {
    const answerId = answers[q.id];
    const option = q.options.find((o) => o.id === answerId);
    if (option) {
      traits[option.trait as ConsumptionTrait] += 1;
    }
  }

  const sorted = (Object.entries(traits) as [ConsumptionTrait, number][]).sort(
    (a, b) => b[1] - a[1],
  );
  const primary = sorted[0][0];
  const res = CONSUMPTION_RESULTS[primary];

  return {
    description: res.description,
    financialWisdom: res.wisdom,
    primaryStyle: primary,
    title: res.title,
    traits,
  };
}
