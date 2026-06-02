import { LifeCategory, UserResult } from "@/types/data-schema";

export interface ConstellationStar {
  createdAt: number;
  id: string;
  isPremium: boolean;
  score: number;
  subtype: string;
  title: string;
  type: LifeCategory;
}

export type SovereignLevel = "Constellation" | "Seed" | "Sprout" | "Sun";

export interface SovereignStats {
  categoryDeepDive: Record<LifeCategory, number>;
  constellationMap: ConstellationStar[];
  explorationPercentage: number;
  level: SovereignLevel;
  totalPoints: number;
  unlockedArtifacts: number;
}

const TOTAL_EXPECTED_FEATURES = 15; // Defining a target for 100% completion progress

export function analyzeSovereignIdentity(
  results: UserResult[],
): SovereignStats {
  const uniqueSubtypes = new Set(results.map((r) => r.subtype));
  const totalPoints =
    results.length * 10 + results.filter((r) => r.isPremium).length * 50;

  let level: SovereignLevel = "Seed";
  if (uniqueSubtypes.size >= 10) level = "Sun";
  else if (uniqueSubtypes.size >= 6) level = "Constellation";
  else if (uniqueSubtypes.size >= 3) level = "Sprout";

  const categoryDeepDive: Record<LifeCategory, number> = {
    career: 0,
    finance: 0,
    fortune: 0,
    lifestyle: 0,
    mental: 0,
    ontology: 0,
    relationship: 0,
  };

  results.forEach((r) => {
    if (categoryDeepDive[r.type] !== undefined) {
      categoryDeepDive[r.type]++;
    }
  });

  const constellationMap: ConstellationStar[] = results.map((r) => ({
    createdAt: r.createdAt,
    id: r.id,
    isPremium: !!r.isPremium,
    score: r.score || 0,
    subtype: r.subtype,
    title: r.title.en || r.title["en"] || r.title["ko"] || "Unknown",
    type: r.type,
  }));

  return {
    categoryDeepDive,
    constellationMap,
    explorationPercentage: Math.min(
      100,
      Math.round((uniqueSubtypes.size / TOTAL_EXPECTED_FEATURES) * 100),
    ),
    level,
    totalPoints,
    unlockedArtifacts: results.filter((r) => r.isPremium).length,
  };
}

export function getLevelLabel(level: SovereignLevel, locale: string): string {
  const labels = {
    Constellation: { en: "Eternal Constellation", ko: "영원한 성좌" },
    Seed: { en: "Sovereign Seed", ko: "제국의 씨앗" },
    Sprout: { en: "Radiant Sprout", ko: "찬란한 싹" },
    Sun: { en: "Universal Sun", ko: "우주의 태양" },
  };
  return labels[level][locale === "ko" ? "ko" : "en"];
}
