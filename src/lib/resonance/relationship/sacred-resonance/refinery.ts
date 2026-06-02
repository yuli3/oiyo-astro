import {
  calculateWeightedAverage as genericCalculateWeightedAverage,
  normalizeScore as genericNormalizeScore,
  WeightedValue,
} from "@/lib/system/utils/normalization";
import { LocalizedText } from "@/types/manifest";

import { DimensionResult, ResonanceDimensionId, TotalResonance } from "./types";

/**
 * Generates a confidence score for the entire analysis (0-100).
 */
export function calculateOverallConfidence(
  dimensions: DimensionResult[],
): number {
  if (dimensions.length === 0) return 0;

  const actualStrength = dimensions.reduce(
    (acc, d) => acc + (d.isSimulated ? 0 : d.strength),
    0,
  );
  const possibleStrength = dimensions.length; // Max strength is 1.0 per dimension

  return Math.round((actualStrength / possibleStrength) * 100);
}

/**
 * Calculates the total resonance score using a weighted average.
 */
export function calculateWeightedAverage(
  dimensions: DimensionResult[],
): number {
  const weightedValues: WeightedValue[] = dimensions.map((dim) => ({
    value: dim.score,
    weight: dim.isSimulated ? dim.strength * 0.2 : dim.strength,
  }));

  return genericCalculateWeightedAverage(weightedValues);
}

/**
 * Normalizes scores from various systems into a single 0-100 scale.
 */
export function normalizeScore(
  rawScore: number,
  dimensionId: ResonanceDimensionId,
): number {
  // Dimension specific adjustments could be added here if needed,
  // but for now we lean on the generic normalizer.
  return genericNormalizeScore(rawScore);
}

/**
 * Refines raw dimension results into a finalized Resonance report.
 */
export function refineResonance(
  profileName: string,
  partnerName: string,
  dimensions: DimensionResult[],
  ichingOracle?: any,
): TotalResonance {
  const totalScore = calculateWeightedAverage(dimensions);
  const confidence = calculateOverallConfidence(dimensions);

  // Simple synthesis logic (to be expanded in synthesis-data.ts)
  const synthesis = generateSynthesis(totalScore, dimensions);

  return {
    confidence,
    createdAt: new Date().toISOString(),
    dimensions,
    iching: ichingOracle,
    synthesis,
    totalScore,
    uuid: generateId(),
  };
}

/**
 * Generates a unique identifier for the resonance result.
 */
function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `resonance_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function generateSynthesis(
  score: number,
  dimensions: DimensionResult[],
): {
  counselorAdvice: LocalizedText;
  description: LocalizedText;
  title: LocalizedText;
} {
  // Fallback synthesis
  if (score >= 90) {
    return {
      counselorAdvice: {
        cn: "珍惜这段缘分；这是命运的馈赠。",
        en: "Nurture this connection; it is a gift of fate.",
        es: "Nutre esta conexión; es un regalo del destino.",
        fr: "Cultivez cette connexion ; c'est un cadeau du destin.",
        ja: "この縁を大切にしてください。運命がくれた贈り物です。",
        ko: "이 인연을 소중히 여기세요. 운명이 준 선물입니다.",
      },
      description: {
        cn: "在所有维度上都发现了罕见且强大的共鸣。",
        en: "A rare and powerful resonance across all dimensions.",
        es: "Una resonancia rara y poderosa en todas las dimensiones.",
        fr: "Une résonance rare et puissante à travers toutes les dimensions.",
        ja: "全ての次元で稀に見る強力な共鳴が発見されました。",
        ko: "모든 차원에서 드물고 강력한 공명이 발견되었습니다.",
      },
      title: {
        cn: "神圣灵魂伴侣",
        en: "Sacred Soulmates",
        es: "Almas Gemelas Sagradas",
        fr: "Âmes Sœurs Sacrées",
        ja: "聖なるソウルメイト",
        ko: "신성한 소울메이트",
      },
    };
  }

  // Neutral fallback
  return {
    counselorAdvice: {
      cn: "沟通是加深这段纽带的关键。",
      en: "Communication is the key to deepening this bond.",
      es: "La comunicación es la clave para profundizar este vínculo.",
      fr: "La communication est la clé pour approfondir ce lien.",
      ja: "コミュニケーションがこの絆を深める鍵です。",
      ko: "소통이 이 유대감을 깊게 만드는 열쇠입니다.",
    },
    description: {
      cn: "一段稳定且有成长空间的关系。",
      en: "A stable connection with room for growth.",
      es: "Una conexión estable con espacio para el crecimiento.",
      fr: "Une connexion stable avec un potentiel de croissance.",
      ja: "成長の余地がある安定した関係です。",
      ko: "성장의 여지가 있는 안정적인 관계입니다.",
    },
    title: {
      cn: "和谐共鸣",
      en: "Harmonious Resonance",
      es: "Resonancia Armoniosa",
      fr: "Résonance Harmonieuse",
      ja: "調和のとれた共鳴",
      ko: "조화로운 공명",
    },
  };
}
