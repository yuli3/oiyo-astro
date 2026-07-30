import {
  ENNEAGRAM_TYPES,
  type EnneagramType,
  type EnneagramTypeDetail,
} from "@/lib/data-layer/shards/personality-enneagram";

export interface EnneagramResult {
  primaryType: number;
  scores: EnneagramScores;
  traits: EnneagramTypeDetail;
  wing?: number;
}

export interface EnneagramScores {
  [key: number]: number; // Type (1-9) -> Score
}

/**
 * Calculates Enneagram result based on scores.
 */
export function calculateEnneagram(scores: EnneagramScores): EnneagramResult {
  let maxScore = -1;
  let primaryType = 1;

  for (let t = 1; t <= 9; t++) {
    if ((scores[t] || 0) > maxScore) {
      maxScore = scores[t];
      primaryType = t;
    }
  }

  // Basic wing determination (highest neighbor)
  const leftNeighbor = primaryType === 1 ? 9 : primaryType - 1;
  const rightNeighbor = primaryType === 9 ? 1 : primaryType + 1;

  const wing =
    (scores[leftNeighbor] || 0) >= (scores[rightNeighbor] || 0)
      ? leftNeighbor
      : rightNeighbor;

  const typeKey = `type${primaryType}` as EnneagramType;

  return {
    primaryType,
    scores,
    traits: ENNEAGRAM_TYPES[typeKey],
    wing,
  };
}
