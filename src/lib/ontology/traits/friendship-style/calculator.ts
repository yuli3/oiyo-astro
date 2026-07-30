import type { Locale } from "@/i18n";

import { FRIENDSHIP_STYLE_QUESTIONS } from "./data";
import {
  FRIENDSHIP_STYLE_COMPATIBILITY,
  FRIENDSHIP_STYLE_DESCRIPTIONS,
  FRIENDSHIP_STYLE_TRAITS,
  type FriendshipStyle,
  type FriendshipStyleResult,
} from "./types";

export function calculateFriendshipStyleResult(
  answers: Record<string, string>,
  locale: Locale = "en",
): FriendshipStyleResult {
  const scores: Record<FriendshipStyle, number> = {
    adventurer: 0,
    entertainer: 0,
    organizer: 0,
    supporter: 0,
    thinker: 0,
  };

  FRIENDSHIP_STYLE_QUESTIONS.forEach((question) => {
    const answer = answers[question.id];
    if (answer) {
      const option = question.options.find((o) => o.id === answer);
      if (option) {
        scores[option.style] += option.weight;
      }
    }
  });

  const totalScore =
    Object.values(scores).reduce((sum, score) => sum + score, 0) || 1;
  const percentages: Record<FriendshipStyle, number> = {} as Record<
    FriendshipStyle,
    number
  >;

  Object.entries(scores).forEach(([style, score]) => {
    percentages[style as FriendshipStyle] = Math.round(
      (score / totalScore) * 100,
    );
  });

  const sortedStyles = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([style]) => style as FriendshipStyle);

  const primary = sortedStyles[0];
  const secondary = sortedStyles[1];

  return {
    compatibility: FRIENDSHIP_STYLE_COMPATIBILITY[primary],
    description: FRIENDSHIP_STYLE_DESCRIPTIONS[primary][locale],
    percentages,
    primary,
    scores,
    secondary,
    traits: FRIENDSHIP_STYLE_TRAITS[primary][locale],
  };
}
