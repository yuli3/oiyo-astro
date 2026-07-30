import type { DaySymbols } from "@/hooks/useAlmanac";
import { FiveElement, HeavenlyStem } from "@/lib/ontology/saju/types"; // Import legacy types

import { getMoonPhase, getRetrogrades, type MoonPhaseData } from "./astro-lookup";
import { type DailyPillar, type Element, getDailyPillar } from "./saju-math";
import { WISDOM_ARTICLES } from "./wisdom-data";

export interface DailyCosmicState {
  almanac: DaySymbols | null;
  cosmicMessage: string;
  dailyWisdomSlug: string;
  date: Date;
  moon: MoonPhaseData;
  resonanceScore: number;
  retrogrades: string[];
  saju: DailyPillar;
}

// Mapping from Legacy Saju Enum to Almanac Element String
const SAJU_ELEMENT_MAP: Record<HeavenlyStem, Element> = {
  [HeavenlyStem.BYEONG]: "Fire",
  [HeavenlyStem.EUL]: "Wood",
  [HeavenlyStem.GAP]: "Wood",
  [HeavenlyStem.GI]: "Earth",
  [HeavenlyStem.GYE]: "Water",
  [HeavenlyStem.GYEONG]: "Metal",
  [HeavenlyStem.IM]: "Water",
  [HeavenlyStem.JEONG]: "Fire",
  [HeavenlyStem.MU]: "Earth",
  [HeavenlyStem.SIN]: "Metal",
};

const ELEMENT_SUPPORT_MAP: Record<Element, Element> = {
  Earth: "Metal", // Earth bears Metal
  Fire: "Earth", // Fire creates Earth
  Metal: "Water", // Metal holds Water
  Water: "Wood", // Water nourishes Wood
  Wood: "Fire", // Wood feeds Fire
};

const ELEMENT_CONTROL_MAP: Record<Element, Element> = {
  Earth: "Water",
  Fire: "Metal",
  Metal: "Wood",
  Water: "Fire",
  Wood: "Earth",
};

export function calculateDailyEnergy(
  date: Date = new Date(),
): DailyCosmicState {
  const saju = getDailyPillar(date);
  const moon = getMoonPhase(date);
  const retrogrades = getRetrogrades(date); // Now simply returns string[]

  // Placeholder - will serve as default until provider injects value
  const resonanceScore = 50;
  const almanac = null;

  // Generate a synthesized message
  let message = `Today is a ${saju.labelEn} day.`;

  if (retrogrades.includes("Mercury")) {
    message += " Mercury is Retrograde—double check your communications.";
  }

  if (moon.phase === "Full") {
    message += " The Full Moon illuminates hidden truths.";
  } else if (moon.phase === "New") {
    message += " The New Moon supports new beginnings.";
  }

  // Deterministic index based on date
  const dayIndex = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  const wisdomSlug = WISDOM_ARTICLES[dayIndex % WISDOM_ARTICLES.length];

  return {
    almanac,
    cosmicMessage: message,
    dailyWisdomSlug: wisdomSlug,
    date,
    moon,
    resonanceScore,
    retrogrades,
    saju,
  };
}

export function calculateResonanceScore(
  userDayMaster: HeavenlyStem,
  dailyElement: Element,
  moonPhase: string,
): number {
  if (!userDayMaster) return 50; // Neutral baseline

  let score = 50;
  const userElement = SAJU_ELEMENT_MAP[userDayMaster];

  // 1. Element Interaction
  if (userElement === dailyElement) {
    score += 15; // Same energy (Resonance)
  } else if (ELEMENT_SUPPORT_MAP[dailyElement] === userElement) {
    score += 25; // Daily supports User (Nourishment)
  } else if (ELEMENT_SUPPORT_MAP[userElement] === dailyElement) {
    score -= 5; // User supports Daily (Draining) - mild penalty
  } else if (ELEMENT_CONTROL_MAP[dailyElement] === userElement) {
    score -= 10; // Daily controls User (Pressure/Growth)
  } else if (ELEMENT_CONTROL_MAP[userElement] === dailyElement) {
    score += 10; // User controls Daily (Conquest)
  }

  // 2. Moon Phase Bonus
  if (moonPhase === "Full") score += 10;
  if (moonPhase === "New") score += 5;

  return Math.min(100, Math.max(0, score));
}
