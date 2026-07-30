import type { UniversalProfile } from "../engine/types";
import type { SajuAnalysis } from "../saju/types";

export type ChosunFaction =
  | "bukin"
  | "byeokpa"
  | "dongin"
  | "namin"
  | "noron"
  | "seoin"
  | "sipa"
  | "soron";

export interface FactionAnalysis {
  behavioralFaction: ChosunFaction;
  divergence: number; // 0 to 100
  faction: ChosunFaction;
  innateFaction: ChosunFaction;
  traits: string[];
}

/**
 * Maps user profile to Chosun Dynasty Faction.
 *
 * Logic:
 * - Innate: Based on Saju (Dominant Element & Day Master)
 * - Behavioral: Based on MBTI / Question results
 */
export function analyzeChosunFaction(
  profile: UniversalProfile,
  mbtiType: string = "INFP",
): FactionAnalysis | null {
  if (!profile.sajuAnalysis) return null;

  const innate = mapSajuToFaction(profile.sajuAnalysis);
  const behavioral = mapMbtiToFaction(mbtiType);

  // Final faction selection (weighted average or behavioral priority?)
  // User asked for "Innate traits vs Behavioral difference", so we show both.
  const finalFaction = behavioral; // Behavioral is usually what they "chose" to be

  const divergence = calculateDivergence(innate, behavioral);

  return {
    behavioralFaction: behavioral,
    divergence,
    faction: finalFaction,
    innateFaction: innate,
    traits: getFactionTraits(finalFaction),
  };
}

function calculateDivergence(a: ChosunFaction, b: ChosunFaction): number {
  if (a === b) return 0;
  // Simple mock divergence
  return 45;
}

function getFactionTraits(faction: ChosunFaction): string[] {
  const traitsMap: Record<ChosunFaction, string[]> = {
    bukin: ["determined", "reformist", "bold"],
    byeokpa: ["uncompromising", "integrity", "orthodox"],
    dongin: ["principled", "academic", "idealistic"],
    namin: ["moderate", "harmonious", "balanced"],
    noron: ["traditional", "conservative", "rigorous"],
    seoin: ["practical", "efficient", "stable"],
    sipa: ["adaptive", "timely", "pragmatic"],
    soron: ["flexible", "open", "inclusive"],
  };
  return traitsMap[faction] || [];
}

function mapMbtiToFaction(mbti: string): ChosunFaction {
  // Mapping MBTI to Factions
  // NF (Idealists) -> Dong-in / Nam-in
  // NT (Rationalists) -> Seo-in / Buk-in
  // SJ (Guardians) -> Noron / Byeok-pa
  // SP (Artisans) -> So-ron / Si-pa

  if (mbti.includes("NF")) return "dongin";
  if (mbti.includes("NT")) return "seoin";
  if (mbti.includes("SJ")) return "noron";
  if (mbti.includes("SP")) return "soron";

  return "sipa";
}

function mapSajuToFaction(saju: SajuAnalysis): ChosunFaction {
  const element = saju.dominantElement;

  // Mapping logic (Academic/Mock)
  // Wood/Fire (Idealism, Passion) -> Dong-in / Buk-in
  // Metal/Water (Realism, Logic) -> Seo-in / Noron
  // Earth (Neutrality, Stability) -> Nam-in

  switch (element) {
    case "earth":
      return "namin";
    case "fire":
      return "bukin";
    case "metal":
      return "noron";
    case "water":
      return "seoin";
    case "wood":
      return "dongin";
    default:
      return "seoin";
  }
}
