import { COUNTRIES_DATABASE, COUNTRY_QUESTIONS } from "./data";
import type {
  CountryArchetype,
  CountryPreferenceResult,
  CountryProfile,
} from "./types";

// Manual mapping of Countries to Archetype Intensity (1-3)
const COUNTRY_ARCHETYPES: Record<
  string,
  Partial<Record<CountryArchetype, number>>
> = {
  canada: { modern: 2, mountainous: 3, nordic: 2 },
  italy: { coastal: 1, cultural: 3, mediterranean: 3 },
  japan: { coastal: 1, cultural: 3, modern: 3, mountainous: 1 },
  norway: { coastal: 2, modern: 1, mountainous: 3, nordic: 3 },
  singapore: { cosmopolitan: 3, modern: 3, tropical: 2 },
  sweden: { cosmopolitan: 1, modern: 3, nordic: 3 },
  thailand: { coastal: 2, cultural: 1, tropical: 3 },
};

export function calculateCountryPreference(
  answers: Record<string, string>,
): CountryPreferenceResult {
  // 1. Calculate User Archetype Scores
  const userScores: Record<CountryArchetype, number> = {
    coastal: 0,
    cosmopolitan: 0,
    cultural: 0,
    mediterranean: 0,
    modern: 0,
    mountainous: 0,
    nordic: 0,
    tropical: 0,
  };

  for (const q of COUNTRY_QUESTIONS) {
    const answerId = answers[q.id];
    const option = q.options.find((o) => o.id === answerId);
    if (option && option.scores) {
      Object.entries(option.scores).forEach(([archetype, score]) => {
        if (score) {
          userScores[archetype as CountryArchetype] += score;
        }
      });
    }
  }

  // 2. Determine Primary Archetype
  let maxScore = -1;
  let primaryArchetype: CountryArchetype = "cosmopolitan"; // Default

  Object.entries(userScores).forEach(([arch, score]) => {
    if (score > maxScore) {
      maxScore = score;
      primaryArchetype = arch as CountryArchetype;
    }
  });

  // 3. Match Countries
  // Score = Dot Product of User Vector and Country Vector
  const matches = Object.entries(COUNTRIES_DATABASE).map(([code, profile]) => {
    const countryArchetypes = COUNTRY_ARCHETYPES[code] || {};
    let matchScore = 0;

    // Dot product
    Object.entries(countryArchetypes).forEach(([arch, intensity]) => {
      const userValue = userScores[arch as CountryArchetype] || 0;
      matchScore += userValue * (intensity || 0);
    });

    // Normalize slightly based on max possible? No need, just relative rank.
    // Maybe boost if primary archetype matches?
    if (countryArchetypes[primaryArchetype]) {
      matchScore *= 1.2;
    }

    return {
      code,
      data: profile,
      match: Math.round(matchScore),
    };
  });

  const topCountries = matches.sort((a, b) => b.match - a.match).slice(0, 3);

  return {
    primaryArchetype,
    scores: userScores,
    topCountries,
  };
}
