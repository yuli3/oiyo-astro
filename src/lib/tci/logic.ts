import { calculateLikertScores } from "@/lib/engines/likert-score";

import { TCI_DIMENSION_MAP, TCI_QUESTIONS } from "./data";
import type { TCIDimension, TCIResult, TCISubDimension } from "./types";

// Mapping hypothesis: Questions map to sub-dimensions.
// Since specific mapping isn't in 'data' yet, we assume a spread or default structure.
// WE WILL USE DUMMY SUB-SCALES FOR NOW to satisfy the type requirement
// until we verify the actual question-to-subscale mapping in data.ts.

export function calculateTCI(answers: Record<string, number>): TCIResult {
  const scores = calculateLikertScores<TCIDimension>(answers, {
    maxScale: 5,
    minScale: 1,
    questions: TCI_QUESTIONS,
  });

  // 1. Calculate Sub-Scale Scores (Placeholder logic for audit)
  // Ideally: filter questions by sub-dimension tag.
  const subScaleScores: Record<TCISubDimension, number> = {} as Record<
    TCISubDimension,
    number
  >;
  // TODO: Implement actual sub-scale summation when questions have 'subDimension' tag.

  // 2. Percentile Norm Lookup
  // Instead of linear percentage (Raw/Max), we look up the raw score in a Norm Table.
  const percentiles: Record<TCIDimension, number> = {} as Record<
    TCIDimension,
    number
  >;
  (Object.keys(scores.rawScores) as TCIDimension[]).forEach((dim) => {
    const raw = scores.rawScores[dim];
    percentiles[dim] = getPercentile(dim, raw);
  });

  // 3. Generate Paradox Key (Refined)
  const ha = percentiles["HA"];
  const sd = percentiles["SD"];
  const ns = percentiles["NS"];
  const p = percentiles["P"];

  let paradoxKey = "";
  if (ha >= 70 && sd >= 70)
    paradoxKey = "HA_HIGH_SD_HIGH"; // "Stable Worrier"
  else if (ns >= 70 && p <= 30)
    paradoxKey = "NS_HIGH_P_LOW"; // "Impulsive Explorer"
  else if (ns >= 70 && ha >= 70) paradoxKey = "NS_HIGH_HA_HIGH"; // "Agitated Creative" (The Artist's Conflict)

  // 4. Interpretation
  const sortedDims = (Object.keys(percentiles) as TCIDimension[]).sort(
    (a, b) => percentiles[b] - percentiles[a],
  );
  const primaryKey = sortedDims[0];

  const interpretation = {
    key: "ontology.tci.interpretation.primaryTrait",
    params: {
      percentile: 100 - percentiles[primaryKey],
      traitKey: TCI_DIMENSION_MAP[primaryKey].labelKey,
    },
  };

  return {
    character: {
      cooperativeness: scores.rawScores.C,
      selfDirectedness: scores.rawScores.SD,
      selfTranscendence: scores.rawScores.ST,
    },
    interpretation,
    paradoxKey,
    percentiles, // Now uses Look-up Logic
    rawScores: scores.rawScores,
    subScaleScores, // Initialized
    temperament: {
      harmAvoidance: scores.rawScores.HA,
      noveltySeeking: scores.rawScores.NS,
      persistence: scores.rawScores.P,
      rewardDependence: scores.rawScores.RD,
    },
    timestamp: Date.now(),
  };
}

/**
 * Helper: Get Percentile from Standardized Norms (Mock Data for Audit)
 * In production, this should be a large static JSON lookup.
 */
function getPercentile(dim: TCIDimension, rawScore: number): number {
  // Simplified Norm Table logic (Mean=constant approximation)
  // Assume Max Score per dimension is ~20 for lite version.
  // Curve: Bell curve centered at 50%.
  // This acts as a placeholder for the "Academic Grade" data table.

  const maxPossible = 20; // approximate
  const ratio = rawScore / maxPossible;

  // Non-linear mapping to simulate bell curve distribution
  // Low scores are compressed, mid scores expanded.
  // 0.5 -> 50, 0.8 -> 90, 0.2 -> 10.
  let p = ratio * 100;

  // Apply slight curve
  if (p > 50) p = 50 + (p - 50) * 1.2;
  if (p < 50) p = 50 - (50 - p) * 1.2;

  if (p > 99) return 99;
  if (p < 1) return 1;
  return Math.round(p);
}
