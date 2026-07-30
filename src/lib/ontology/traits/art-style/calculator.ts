import type { Locale } from "@/i18n";

import { getArtStyleProfile, getArtStyleQuestions } from "./data";
import type { ArtStyle, ArtStyleResult } from "./types";

export function calculateArtStyleResult(
  answers: Record<string, string>,
  locale: Locale = "en",
): ArtStyleResult {
  const scores: Record<ArtStyle, number> = {
    "abstract-expressionist": 0,
    "classical-realist": 0,
    "modern-minimalist": 0,
    "nature-impressionist": 0,
    "pop-culture-vibrant": 0,
    "surreal-dreamer": 0,
  };

  // Calculate scores based on answers
  const questions = getArtStyleQuestions(locale);
  Object.entries(answers).forEach(([questionId, optionId]) => {
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      const option = question.options.find((o) => o.id === optionId);
      if (option) {
        scores[option.style] += option.weight;
      }
    }
  });

  // Calculate percentages
  const totalScore = Object.values(scores).reduce(
    (sum, score) => sum + score,
    0,
  );
  const percentages: Record<ArtStyle, number> = {} as Record<ArtStyle, number>;

  Object.entries(scores).forEach(([style, score]) => {
    percentages[style as ArtStyle] = Math.round((score / totalScore) * 100);
  });

  // Find primary and secondary styles
  const sortedStyles = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([style]) => style as ArtStyle);

  const primary = sortedStyles[0];
  const secondary = sortedStyles[1];

  const profile = getArtStyleProfile(primary, locale);

  return {
    artRecommendations: profile.artRecommendations,
    colorPalette: profile.colorPalette,
    creativeExpressions: profile.creativeExpressions,
    description: profile.description,
    famousArtists: profile.famousArtists,
    museumSuggestions: profile.museumSuggestions,
    percentages,
    primary,
    scores,
    secondary,
    traits: profile.traits,
  };
}
