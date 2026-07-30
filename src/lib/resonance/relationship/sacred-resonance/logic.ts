import { differenceInDays } from "date-fns";

import type { EnneagramTypeId } from "./data/shards/personality-enneagram";

/**
 * MAYAN KIN CALCULATION
 * Uses Dec 21, 2012 (Kin 207 - Blue Crystal Hand in Dreamspell / Kin 160 variant)
 * as a reference for Tzolkin calculation.
 * Standard Tzolkin (GMT): Kin = (JD - 584283) % 260.
 */
export function calculateMayanKin(birthDate: Date): {
  kin: number;
  seal: number;
  tone: number;
} {
  // Reference: Dec 21, 2012 was Kin 207 (Blue Crystal Hand)
  const referenceDate = new Date(2012, 11, 21); // Month is 0-indexed
  const daysDiff = differenceInDays(birthDate, referenceDate);

  // Modulo 260 for the Tzolkin cycle
  let kin = (207 + (daysDiff % 260) + 260) % 260;
  if (kin === 0) kin = 260;

  const seal = kin % 20 === 0 ? 20 : kin % 20; // 1-20
  const tone = kin % 13 === 0 ? 13 : kin % 13; // 1-13

  return { kin, seal, tone };
}

/**
 * ENNEAGRAM CORRELATION LOGIC
 * Analyzes integration (growth) and disintegration (stress) paths.
 */
export const ENNEAGRAM_PATHS: Record<
  EnneagramTypeId,
  { disintegration: EnneagramTypeId; integration: EnneagramTypeId }
> = {
  type1: { disintegration: "type4", integration: "type7" },
  type2: { disintegration: "type8", integration: "type4" },
  type3: { disintegration: "type9", integration: "type6" },
  type4: { disintegration: "type2", integration: "type1" },
  type5: { disintegration: "type7", integration: "type8" },
  type6: { disintegration: "type3", integration: "type9" },
  type7: { disintegration: "type1", integration: "type5" },
  type8: { disintegration: "type5", integration: "type2" },
  type9: { disintegration: "type6", integration: "type3" },
};

/**
 * Calculates a correlation bonus/penalty based on Enneagram growth paths.
 */
export function analyzeEnneagramCorrelation(
  typeA: EnneagramTypeId,
  typeB: EnneagramTypeId,
): number {
  let score = 0;

  const pathA = ENNEAGRAM_PATHS[typeA];
  const pathB = ENNEAGRAM_PATHS[typeB];

  // If A grows toward B or B grows toward A
  if (pathA.integration === typeB) score += 15;
  if (pathB.integration === typeA) score += 15;

  // If A stresses toward B or B stresses toward A
  if (pathA.disintegration === typeB) score -= 10;
  if (pathB.disintegration === typeA) score -= 10;

  return score;
}

/**
 * CELTIC TREE CALCULATION
 * Maps birth date to Celtic Tree signs.
 */
export function getCelticSignId(birthDate: Date): string {
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();

  // Simplified mapping (approximate)
  if ((month === 12 && day >= 24) || (month === 1 && day <= 20)) return "birch";
  if ((month === 1 && day >= 21) || (month === 2 && day <= 17)) return "rowan";
  if ((month === 2 && day >= 18) || (month === 3 && day <= 17)) return "ash";
  if ((month === 3 && day >= 18) || (month === 4 && day <= 14)) return "alder";
  if ((month === 4 && day >= 15) || (month === 5 && day <= 12)) return "willow";
  if ((month === 5 && day >= 13) || (month === 6 && day <= 9))
    return "hawthorn";
  if ((month === 6 && day >= 10) || (month === 7 && day <= 7)) return "oak";
  if ((month === 7 && day >= 8) || (month === 8 && day <= 4)) return "holly";
  if ((month === 8 && day >= 5) || (month === 9 && day <= 1)) return "hazel";
  if ((month === 9 && day >= 2) || (month === 9 && day <= 29)) return "vine";
  if ((month === 9 && day >= 30) || (month === 10 && day <= 27)) return "ivy";
  if ((month === 10 && day >= 28) || (month === 11 && day <= 24)) return "reed";
  if ((month === 11 && day >= 25) || (month === 12 && day <= 23))
    return "elder";

  return "birch"; // Fallback
}
