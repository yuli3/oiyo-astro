import { COUNTRIES_DATABASE, COUNTRY_PREFERENCE_QUESTIONS } from "./data";
import {
  COUNTRY_PREFERENCE_DESCRIPTIONS,
  COUNTRY_PREFERENCE_TRAITS,
  type CountryData,
  type CountryMatch,
  type CountryPreferenceResult,
  type CountryPreferenceType,
} from "./types";

export function calculateCountryPreference(
  answers: Record<string, string>,
  locale = "en",
): CountryPreferenceResult {
  const scores: Record<CountryPreferenceType, number> = {
    coastal: 0,
    cosmopolitan: 0,
    cultural: 0,
    mediterranean: 0,
    modern: 0,
    mountainous: 0,
    nordic: 0,
    tropical: 0,
  };

  const questions =
    COUNTRY_PREFERENCE_QUESTIONS[
      locale as keyof typeof COUNTRY_PREFERENCE_QUESTIONS
    ] || COUNTRY_PREFERENCE_QUESTIONS.en;

  Object.entries(answers).forEach(([questionId, answerId]) => {
    const question = questions.find((q) => q.id === questionId);
    const option = question?.options.find((o) => o.id === answerId);
    if (option?.scores) {
      Object.entries(option.scores).forEach(([type, score]) => {
        if (score) {
          scores[type as CountryPreferenceType] += score;
        }
      });
    }
  });

  const totalScore = Object.values(scores).reduce(
    (sum, score) => sum + score,
    0,
  );
  const percentages = Object.entries(scores).reduce(
    (acc, [type, score]) => {
      acc[type as CountryPreferenceType] =
        totalScore > 0 ? Math.round((score / totalScore) * 100) : 0;
      return acc;
    },
    {} as Record<CountryPreferenceType, number>,
  );

  const sortedTypes = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([type]) => type as CountryPreferenceType);

  const primary = sortedTypes[0] || "modern";
  const secondary = sortedTypes[1] || "cosmopolitan";

  const recommendedCountries = getRecommendedCountries(
    primary,
    secondary,
    scores,
    answers,
    locale,
  );

  return {
    climate: "",
    culture: "",
    description: COUNTRY_PREFERENCE_DESCRIPTIONS[primary],
    economy: "",
    // Deprecated fields, will be removed after UI update
    lifestyle: "",
    percentages,
    primary,
    recommendedCountries,
    scores,
    secondary,
    traits: COUNTRY_PREFERENCE_TRAITS[primary],
  };
}

function getRecommendedCountries(
  primary: CountryPreferenceType,
  secondary: CountryPreferenceType,
  scores: Record<CountryPreferenceType, number>,
  answers: Record<string, string>,
  locale: string,
): CountryMatch[] {
  const countryTypeMapping: Record<string, CountryPreferenceType[]> = {
    argentina: ["mediterranean", "cultural", "cosmopolitan"],
    canada: ["modern", "mountainous", "cosmopolitan", "nordic"],
    costa_rica: ["tropical", "mountainous", "coastal"],
    denmark: ["nordic", "coastal", "modern"],
    germany: ["modern", "cultural", "nordic"],
    ireland: ["cultural", "coastal", "nordic"],
    italy: ["mediterranean", "cultural", "coastal"],
    japan: ["cultural", "modern", "mountainous"],
    mexico: ["tropical", "cultural", "coastal"],
    netherlands: ["cosmopolitan", "coastal", "modern"],
    new_zealand: ["mountainous", "coastal", "modern"],
    norway: ["nordic", "mountainous", "coastal"],
    portugal: ["coastal", "mediterranean", "cultural"],
    singapore: ["cosmopolitan", "modern", "coastal"],
    south_korea: ["modern", "cosmopolitan", "cultural"],
    spain: ["mediterranean", "cultural", "coastal"],
    sweden: ["nordic", "modern", "coastal"],
    switzerland: ["mountainous", "modern", "cultural"],
    thailand: ["tropical", "cultural", "coastal"],
  };

  const countryScores: { countryKey: string; score: number }[] = [];
  const db = (COUNTRIES_DATABASE[locale as keyof typeof COUNTRIES_DATABASE] ||
    COUNTRIES_DATABASE.en) as CountryData;

  Object.keys(db).forEach((countryKey) => {
    const types = countryTypeMapping[countryKey] || [];
    let matchScore = 0;

    // Base score from preference types
    types.forEach((type) => {
      matchScore += scores[type] || 0;
    });

    // Bonus for primary and secondary matches
    if (types.includes(primary)) matchScore *= 1.2;
    if (types.includes(secondary)) matchScore *= 1.1;

    // Metric-based adjustments based on specific answers
    const countryData = db[countryKey];
    if (!countryData) return;

    // Budget adjustments
    if (
      answers.budget === "budget_guardian" &&
      ["Low", "Medium"].includes(countryData.metrics.costOfLiving)
    )
      matchScore *= 1.2;
    if (
      answers.budget === "premium_quality" &&
      ["High", "Very High"].includes(countryData.metrics.costOfLiving)
    )
      matchScore *= 1.1;

    // Stability adjustments
    if (
      answers.risk_tolerance === "stability_first" &&
      countryData.metrics.safety > 8.5
    )
      matchScore *= 1.2;

    // Career adjustments
    if (
      answers.career === "innovation_tech" &&
      countryData.metrics.internetSpeed > 150
    )
      matchScore *= 1.15;

    // Work-life balance
    if (
      answers.work_life_balance === "strict_separation" &&
      ["nordic", "cultural"].some((t) =>
        types.includes(t as CountryPreferenceType),
      )
    )
      matchScore *= 1.1;

    countryScores.push({ countryKey, score: matchScore });
  });

  const maxScore = Math.max(...countryScores.map((item) => item.score));

  // Sort by score and return top 8
  return countryScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ countryKey, score }) => {
      const countryData = db[countryKey];
      const matchPercentage =
        maxScore > 0 ? Math.min(99, Math.round((score / maxScore) * 100)) : 0;
      return {
        ...countryData,
        matchPercentage,
      } as CountryMatch;
    });
}
