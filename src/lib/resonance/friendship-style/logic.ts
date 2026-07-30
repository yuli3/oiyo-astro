import { FRIENDSHIP_QUESTIONS, FRIENDSHIP_STYLE_RESULTS } from "./data";
import type { FriendshipAttachmentType, FriendshipStyleResult } from "./types";

export function calculateFriendshipStyle(
  answers: Record<string, string>,
): FriendshipStyleResult {
  const scores: Record<FriendshipAttachmentType, number> = {
    anxious: 0,
    avoidant_dismissive: 0,
    avoidant_fearful: 0,
    secure: 0,
  };

  for (const q of FRIENDSHIP_QUESTIONS) {
    const answerId = answers[q.id];
    const option = q.options.find((o) => o.id === answerId);
    if (option && option.weights) {
      for (const [style, weight] of Object.entries(option.weights)) {
        scores[style as FriendshipAttachmentType] += weight as number;
      }
    }
  }

  const sorted = (
    Object.entries(scores) as [FriendshipAttachmentType, number][]
  ).sort((a, b) => b[1] - a[1]);

  const primary = sorted[0][0];
  const secondary = sorted[1][0];

  const resultData = FRIENDSHIP_STYLE_RESULTS[primary];

  return {
    connectionAdvice: resultData.connectionAdvice,
    description: resultData.description,
    primaryType: primary,
    scores,
    secondaryType: secondary,
    vulnerability: resultData.vulnerability,
  };
}
