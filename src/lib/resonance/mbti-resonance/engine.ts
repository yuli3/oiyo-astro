import {
  MBTI_GOOD_MATCHES,
  MBTI_IDEAL_MATCHES,
  MBTI_PROFILES,
  MBTIType,
} from "@/lib/mbti/data";
import {
  calculateWeightedAverage,
  normalizeScore,
  WeightedValue,
} from "@/lib/system/utils/normalization";
import { LocalizedText } from "@/types/manifest";

export interface MBTIResonanceResult {
  dimensions: {
    communication: number;
    friendship: number;
    romance: number;
    workplace: number;
  };
  insights: {
    challenges: LocalizedText[];
    strengths: LocalizedText[];
    summary: LocalizedText;
    title: LocalizedText;
  };
  relationshipType:
    | "complementary"
    | "conflicting"
    | "golden"
    | "mirror"
    | "same";
  score: number;
}

/**
 * Calculates MBTI resonance between two types.
 */
export function calculateMBTIResonance(
  type1: MBTIType,
  type2: MBTIType,
): MBTIResonanceResult {
  const profile1 = MBTI_PROFILES[type1];
  const profile2 = MBTI_PROFILES[type2];

  // 1. Determine Relationship Type
  let relationshipType: MBTIResonanceResult["relationshipType"] =
    "complementary";
  if (type1 === type2) relationshipType = "same";
  else if (MBTI_IDEAL_MATCHES[type1]?.includes(type2))
    relationshipType = "golden";
  else if (MBTI_GOOD_MATCHES[type1]?.includes(type2))
    relationshipType = "mirror"; // Simplified mapping

  // 2. Calculate Dimension Scores
  const communication = calculateDimensionScore(
    type1,
    type2,
    "communication",
    relationshipType,
  );
  const romance = calculateDimensionScore(
    type1,
    type2,
    "romance",
    relationshipType,
  );
  const friendship = calculateDimensionScore(
    type1,
    type2,
    "friendship",
    relationshipType,
  );
  const workplace = calculateDimensionScore(
    type1,
    type2,
    "workplace",
    relationshipType,
  );

  // 3. Overall Score
  const score = Math.round(
    (communication + romance + friendship + workplace) / 4,
  );

  return {
    dimensions: { communication, friendship, romance, workplace },
    insights: generateInsights(type1, type2, relationshipType, score),
    relationshipType,
    score,
  };
}

function calculateDimensionScore(
  t1: MBTIType,
  t2: MBTIType,
  dim: string,
  relType: string,
): number {
  let score = 50;

  // Base logic based on letters
  if (t1[0] !== t2[0]) score += 5; // E/I synergy
  if (t1[1] === t2[1]) score += 20; // S/N similarity is huge
  if (t1[2] === t2[2]) score += 10; // T/F similarity helps understanding
  if (t1[3] !== t2[3]) score += 5; // J/P synergy

  // Relationship type bonus
  if (relType === "golden") score += 15;
  if (relType === "same") score += 10;

  return normalizeScore(score, 30, 110);
}

function generateInsights(
  t1: MBTIType,
  t2: MBTIType,
  relType: string,
  score: number,
): MBTIResonanceResult["insights"] {
  // Placeholder insights - in a real scenario, these would come from a localized bundle or the data shard
  const p1 = MBTI_PROFILES[t1];
  const p2 = MBTI_PROFILES[t2];

  return {
    challenges: [],
    strengths: [],
    summary: {
      zh: `${t1}与${t2}之间的${score}%共鸣。`,
      en: `A resonance of ${score}% between ${t1} and ${t2}.`,
      es: `Una resonancia del ${score}% entre ${t1} y ${t2}.`,
      fr: `Une résonance de ${score}% entre ${t1} et ${t2}.`,
      ja: `${t1}と${t2}の間の${score}%の共鳴です。`,
      ko: `${t1}와 ${t2} 사이의 ${score}% 공명입니다.`,
    },
    title: {
      zh: relType === "golden" ? "神圣纽带" : "和谐连接",
      en: relType === "golden" ? "Sacred Bond" : "Harmonious Connection",
      es: relType === "golden" ? "Vínculo Sagrado" : "Conexión Armoniosa",
      fr: relType === "golden" ? "Lien Sacré" : "Connexion Harmonieuse",
      ja: relType === "golden" ? "聖なる絆" : "調和のとれたつながり",
      ko: relType === "golden" ? "신성한 결속" : "조화로운 연결",
    },
  };
}
