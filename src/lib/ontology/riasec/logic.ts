import { CAREERS } from "@/lib/data-layer/shards/careers";
import { calculateWeightedScore } from "@/lib/engines/scoring-engine";

import { RIASEC_QUESTIONS, RIASEC_RESULTS } from "./data";
import { RIASEC_ORDER, RiasecResult, RiasecType } from "./types";

/**
 * Calculates RIASEC scores with Holland's Hexagon consistency logic.
 */
export function calculateRiasec(answers: Record<string, string>): RiasecResult {
  // 1. Calculate weighted scores
  const scores = calculateWeightedScore<RiasecType>(answers, RIASEC_QUESTIONS);

  // Initialize missing keys with 0
  const types = RIASEC_ORDER;
  types.forEach((t) => {
    if (scores[t] === undefined) scores[t] = 0;
  });

  // 2. Normalize to Percentage
  // Dynamic Max Score: sum of max possible weight per type from questions
  // For MVP we assume fixed max, but "Detailed" requires dynamic check.
  // We'll use the highest score found as baseline or fixed 12/48 depending on version.
  // Let's keep existing logic but warn if scores > MAX_SCORE.
  const MAX_SCORE = 12; // Update this if question set expands

  const percentages: Record<RiasecType, number> = {} as any;
  let maxVal = 0;
  let minVal = 100;

  for (const type of types) {
    const raw = scores[type];
    const pct = Math.round((raw / MAX_SCORE) * 100);
    percentages[type] = pct > 100 ? 100 : pct; // Cap at 100

    if (percentages[type] > maxVal) maxVal = percentages[type];
    if (percentages[type] < minVal) minVal = percentages[type];
  }

  // 3. Find Top Types & Hexagon Code
  const sorted = (Object.entries(percentages) as [RiasecType, number][]).sort(
    (a, b) => b[1] - a[1],
  );

  const topTypes = sorted.slice(0, 3).map(([type]) => type);
  const hexagonCode = topTypes.map((t) => t[0]).join(""); // e.g. "RIA"
  const dominantType = topTypes[0];

  // 4. Calculate Consistency (Hexagon Logic)
  // High: Adjacent (R-I, R-C...). Medium: Alternate (R-A, R-E). Low: Opposite (R-S).
  const primaryIdx = RIASEC_ORDER.indexOf(topTypes[0]);
  const secondaryIdx = RIASEC_ORDER.indexOf(topTypes[1]);

  let consistency: "High" | "Low" | "Medium" = "Low";
  let consistencyScore = 1;

  // Calculate distance on hexagon (0 to 3)
  let dist = Math.abs(primaryIdx - secondaryIdx);
  if (dist > 3) dist = 6 - dist; // Shortest path on ring

  if (dist <= 1) {
    consistency = "High";
    consistencyScore = 3;
  } else if (dist === 2) {
    consistency = "Medium";
    consistencyScore = 2;
  } else {
    consistency = "Low";
    consistencyScore = 1;
  }

  // 5. Calculate Differentiation
  // Gap between highest and lowest.
  const differentiation = maxVal - minVal;

  const resultData = RIASEC_RESULTS[dominantType];

  // 6. Integrate SSOT Careers
  // Map dominant type (e.g. "Realistic") to code ("R")
  const primaryCode = dominantType[0];

  // Filter careers that MATCH the primary code
  // We prioritize careers where the primary code is the FIRST letter of the career's riasecCode (e.g. "R" matches "RI", "RC")
  // Fallback to containing the code.

  const matchingCareers = CAREERS.filter((career) => {
    return career.riasecCode.includes(primaryCode);
  })
    .sort((a, b) => {
      // Sort logic: exact code match > starts with code > automation risk low > salary high
      const aStarts = a.riasecCode.startsWith(primaryCode) ? 1 : 0;
      const bStarts = b.riasecCode.startsWith(primaryCode) ? 1 : 0;
      if (aStarts !== bStarts) return bStarts - aStarts;

      // Tie-break: Low Automation Risk
      if (a.marketData && b.marketData) {
        return a.marketData.automationRisk - b.marketData.automationRisk;
      }
      return 0;
    })
    .slice(0, 3); // Take top 3

  return {
    careers: matchingCareers.length > 0 ? matchingCareers : resultData.careers, // Fallback to simple list if no match (unlikely)
    consistency,
    consistencyScore,
    description: resultData.description,
    differentiation,
    hexagonCode,
    scores: percentages,
    title: resultData.title,
    topTypes,
  };
}
