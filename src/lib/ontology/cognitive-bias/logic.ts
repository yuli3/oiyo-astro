import { biasDefinitions } from "./data";
import { BiasScoreResult, BiasType, TestAnswer } from "./types";

export function calculateResult(answers: TestAnswer[]): BiasScoreResult {
  const biasScores: Record<BiasType, number> = {
    "anchoring-bias": 0,
    "authority-bias": 0,
    "availability-heuristic": 0,
    "confirmation-bias": 0,
    "dunning-kruger": 0,
    "hindsight-bias": 0, // NEW
    "status-quo-bias": 0, // NEW
    "sunk-cost-fallacy": 0, // NEW
    "survivorship-bias": 0,
  };

  answers.forEach((answer) => {
    Object.entries(answer.biasContributions).forEach(([bias, score]) => {
      biasScores[bias as BiasType] += score || 0;
    });
  });

  const dominantBias = (Object.keys(biasScores) as BiasType[]).reduce((a, b) =>
    biasScores[a] > biasScores[b] ? a : b,
  );

  const totalScore = Object.values(biasScores).reduce(
    (sum, score) => sum + score,
    0,
  );
  const maxPossibleScore = answers.length * 3;
  const biasPercentage = (totalScore / maxPossibleScore) * 100;

  const riskLevel =
    biasPercentage > 60 ? "high" : biasPercentage > 30 ? "moderate" : "low";

  const awareness = generateAwareness(biasScores);
  const recommendations = generateRecommendations(dominantBias, biasScores);

  return {
    awareness,
    biasScores,
    dominantBias,
    recommendations,
    riskLevel,
  };
}

function generateAwareness(scores: Record<BiasType, number>): string[] {
  const awareness: string[] = [];
  Object.entries(scores).forEach(([bias, score]) => {
    if (score > 5) {
      awareness.push(`awareness.${bias}`);
    }
  });
  return awareness;
}

function generateRecommendations(
  dominant: BiasType,
  scores: Record<BiasType, number>,
): string[] {
  const recs = biasDefinitions[dominant].howToOvercome;
  const additional: string[] = [];

  Object.entries(scores).forEach(([bias, score]) => {
    if (bias !== dominant && score > 4) {
      additional.push(`recommendations.${bias}`);
    }
  });

  return [...recs, ...additional.slice(0, 2)];
}
