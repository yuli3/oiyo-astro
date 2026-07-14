/**
 * Universal Chronos Engine
 * The Grand Archive - Core Time Coordinate System
 *
 * "We are not oracles. We are observers recording the probabilistic trajectory
 * of existence using the wisdom of all humanity."
 *
 * This engine converts any moment in time (birthdate) into coordinates
 * across ALL major mythological and astrological traditions.
 */

import type {
  ChronosInput,
  UniversalChronosCoordinates,
  WesternZodiac,
} from "./types";

import { calculateCelticTree } from "../celtic/calculator";
import { CelticTreeSign } from "../celtic/types";
import { calculateEgyptianCoordinates } from "../egyptian/calculator";
import { calculateHellenisticCoordinates } from "../hellenistic/calculator";
import { calculateKabbalahCoordinates } from "../kabbalah/calculator";
import { normalizeAngle } from "../kernel/math";
import { civilDateToLocalNoon } from "../kernel/civil-date";
import { getJulianDay } from "../kernel/time";
import { calculateMayanKin } from "../mayan/calculator";
import { MayanKin } from "../mayan/types";
import { calculateNordicRune } from "../nordic/calculator";
import { calculateNumerology } from "../numerology/logic";
import { calculateSaju } from "../saju/logic";
import { calculateVedicCoordinates } from "../vedic/calculator";
import { calculateZiWeiCoordinates } from "../ziwei/calculator";
import { ResonanceEngine } from "./resonance";

// Legacy interface for backwards compatibility
export interface ChronosCoordinates {
  celtic: CelticTreeSign;
  date: Date;
  mayan: MayanKin | null;
  zodiac: {
    element: string;
    sign: string;
  };
}

// ============================================================================
// ZODIAC HELPERS
// ============================================================================

interface ZodiacData {
  element: "Air" | "Earth" | "Fire" | "Water";
  endDay: number;
  endMonth: number;
  modality: "Cardinal" | "Fixed" | "Mutable";
  rulingPlanet: string;
  sign: string;
  startDay: number;
  startMonth: number;
}

const ZODIAC_DATA: ZodiacData[] = [
  {
    element: "Fire",
    endDay: 19,
    endMonth: 4,
    modality: "Cardinal",
    rulingPlanet: "Mars",
    sign: "Aries",
    startDay: 21,
    startMonth: 3,
  },
  {
    element: "Earth",
    endDay: 20,
    endMonth: 5,
    modality: "Fixed",
    rulingPlanet: "Venus",
    sign: "Taurus",
    startDay: 20,
    startMonth: 4,
  },
  {
    element: "Air",
    endDay: 20,
    endMonth: 6,
    modality: "Mutable",
    rulingPlanet: "Mercury",
    sign: "Gemini",
    startDay: 21,
    startMonth: 5,
  },
  {
    element: "Water",
    endDay: 22,
    endMonth: 7,
    modality: "Cardinal",
    rulingPlanet: "Moon",
    sign: "Cancer",
    startDay: 21,
    startMonth: 6,
  },
  {
    element: "Fire",
    endDay: 22,
    endMonth: 8,
    modality: "Fixed",
    rulingPlanet: "Sun",
    sign: "Leo",
    startDay: 23,
    startMonth: 7,
  },
  {
    element: "Earth",
    endDay: 22,
    endMonth: 9,
    modality: "Mutable",
    rulingPlanet: "Mercury",
    sign: "Virgo",
    startDay: 23,
    startMonth: 8,
  },
  {
    element: "Air",
    endDay: 22,
    endMonth: 10,
    modality: "Cardinal",
    rulingPlanet: "Venus",
    sign: "Libra",
    startDay: 23,
    startMonth: 9,
  },
  {
    element: "Water",
    endDay: 21,
    endMonth: 11,
    modality: "Fixed",
    rulingPlanet: "Mars/Pluto",
    sign: "Scorpio",
    startDay: 23,
    startMonth: 10,
  },
  {
    element: "Fire",
    endDay: 21,
    endMonth: 12,
    modality: "Mutable",
    rulingPlanet: "Jupiter",
    sign: "Sagittarius",
    startDay: 22,
    startMonth: 11,
  },
  {
    element: "Earth",
    endDay: 19,
    endMonth: 1,
    modality: "Cardinal",
    rulingPlanet: "Saturn",
    sign: "Capricorn",
    startDay: 22,
    startMonth: 12,
  },
  {
    element: "Air",
    endDay: 18,
    endMonth: 2,
    modality: "Fixed",
    rulingPlanet: "Saturn/Uranus",
    sign: "Aquarius",
    startDay: 20,
    startMonth: 1,
  },
  {
    element: "Water",
    endDay: 20,
    endMonth: 3,
    modality: "Mutable",
    rulingPlanet: "Jupiter/Neptune",
    sign: "Pisces",
    startDay: 19,
    startMonth: 2,
  },
];

export interface ResonanceReport {
  archetype: string;
  cosmicSynthesis: string;
  overallResonance: number;
  synergies: Array<{ description: string; pair: string; score: number }>;
  tags: string[];
  visualState: {
    complexity?: number;
    primaryColor: string;
    pulseRate?: number;
  };
}

export interface UniversalProfile {
  saju: {
    dayMasterElement: string;
    monthBranch: string;
  };
  tci: {
    harmAvoidance: number;
    noveltySeeking: number;
    persistence: number;
    rewardDependence: number;
  };
}

// ============================================================================
// UNIVERSAL CHRONOS ENGINE (The Grand Archive)
// ============================================================================

export class UniversalCorrelationEngine {
  /**
   * Compute Resonance Report from a Universal Profile
   */
  static computeResonance(
    profile: UniversalProfile,
    locale: string,
  ): ResonanceReport {
    // Deterministic stub logic for "Great Purge" stabilization
    const score = (profile.tci.noveltySeeking + profile.tci.persistence) % 100;

    return {
      archetype: score > 50 ? "The Radiant Catalyst" : "The Deep Seer",
      cosmicSynthesis:
        score > 50
          ? "Your energy resonates with the spark of creation, driving change and innovation."
          : "Your energy resonates with the stillness of the deep ocean, observing truth and wisdom.",
      overallResonance: score,
      synergies: [
        {
          description: "Dynamic interplay of Fire and Wood",
          pair: "Saju Day Master + TCI Novelty",
          score: 85,
        },
        {
          description: "Harmonious balance of persistence",
          pair: "TCI Persistence + Saju Earth",
          score: 92,
        },
      ],
      tags: ["Innovation", "Depth", "Resonance"],
      visualState: {
        complexity: score / 100,
        primaryColor: score > 50 ? "#f59e0b" : "#3b82f6", // Amber or Blue
        pulseRate: score > 50 ? 2 : 0.5,
      },
    };
  }

  /**
   * Generate Semantic Tags based on Chronos Context
   * This logic is now part of the Universal Chronos Engine (UCE).
   */
  static generateSemanticTags(context: any): string[] {
    // In a real implementation, this would analyze the context (GrandArchiveResult)
    // and extract meaningful tags. For now, it returns a default set.
    const tags = ["General", "Destiny"];

    // Example logic expansion:
    if (context?.zodiac?.element === "Fire") tags.push("Passion", "Dynamic");
    if (context?.mayan?.seal?.name) tags.push(context.mayan.seal.name);

    return tags;
  }
}

/**
 * Legacy Chronos Coordinates
 * @deprecated Use getUniversalChronosCoordinates for full archive access
 */
export function getChronosCoordinates(date: Date): ChronosCoordinates {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new RangeError("Chronos date must be valid");
  }
  const civilDate = [
    String(date.getUTCFullYear()).padStart(4, "0"),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
  const calendarDate = civilDateToLocalNoon(civilDate);
  const mayan = calculateMayanKin(calendarDate);
  const celtic = calculateCelticTree(calendarDate);
  const zodiac = getWesternZodiac(calendarDate);

  return {
    celtic,
    date: calendarDate,
    mayan,
    zodiac: {
      element: zodiac.element,
      sign: zodiac.sign,
    },
  };
}

// ============================================================================
// UNIVERSAL CHRONOS ENGINE (The Grand Archive)
// ============================================================================

/**
 * Get Universal Chronos Coordinates
 *
 * Maps a single moment in time to coordinates across ALL wisdom traditions:
 * - Western: Zodiac (sign, element, modality, decan)
 * - Mesoamerican: Mayan Dreamspell (Kin, Seal, Tone)
 * @param input - Birth data including date, optional time, name, etc.
 * @returns Universal coordinates across all systems
 */
export function getUniversalChronosCoordinates(
  input: ChronosInput,
): UniversalChronosCoordinates {
  const { civilDate, instant } = input;
  const calendarDate = civilDateToLocalNoon(civilDate);

  if (!(instant instanceof Date) || Number.isNaN(instant.getTime())) {
    throw new RangeError("ChronosInput.instant must be a valid Date");
  }

  // Calculate all coordinate systems
  const mayan = calculateMayanKin(calendarDate);
  const celtic = calculateCelticTree(calendarDate);
  const zodiac = getWesternZodiac(calendarDate);
  const vedic = calculateVedicCoordinates(instant);
  const egyptian = calculateEgyptianCoordinates(calendarDate);
  const hellenistic = calculateHellenisticCoordinates(
    instant,
    zodiac.element,
    input.longitude,
  );
  const ziwei = calculateZiWeiCoordinates(instant, input.longitude);
  const kabbalah = calculateKabbalahCoordinates(calendarDate);
  const julianDay = getJulianDay(instant);

  // Conditionally calculate Name/Time dependent systems
  // Conditionally calculate Name/Time dependent systems
  const saju = calculateSaju(
    instant,
    input.isLunarCalendar,
    input.gender,
    input.longitude,
  );
  const numerology = input.fullName
    ? calculateNumerology({ birthDate: calendarDate, fullName: input.fullName })
    : undefined;

  // Construct base coordinates (without prophecy first)
  const baseCoords = {
    celtic,
    civilDate,
    egyptian,
    gregorian: instant,
    hellenistic,
    instant,
    julianDay,
    kabbalah,
    mayan,
    nordic: calculateNordicRune(calendarDate),
    numerology,
    saju,
    vedic,
    ziwei,
    zodiac,
  };

  // Generate Prophecy
  // We cast baseCoords to UniversalChronosCoordinates because 'prophecy' is missing but not used by the generator yet
  const prophecy = ResonanceEngine.generateProphecy(
    baseCoords as any as UniversalChronosCoordinates,
  );

  return {
    ...baseCoords,
    prophecy,
  };
}

// ============================================================================
// RESONANCE LOGIC (Absorbed from UniversalCorrelationEngine)
// ============================================================================

function calculateDecan(date: Date, zodiac: ZodiacData): 1 | 2 | 3 {
  // Each sign spans ~30 days, divided into 3 decans of ~10 days each
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Calculate day within sign
  let dayInSign: number;
  if (month === zodiac.startMonth) {
    dayInSign = day - zodiac.startDay + 1;
  } else {
    // Days remaining in start month + days in current month
    const daysInStartMonth = new Date(
      date.getFullYear(),
      zodiac.startMonth,
      0,
    ).getDate();
    dayInSign = daysInStartMonth - zodiac.startDay + 1 + day;
  }

  if (dayInSign <= 10) return 1;
  if (dayInSign <= 20) return 2;
  return 3;
}

function getWesternZodiac(date: Date): WesternZodiac {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  for (const zodiac of ZODIAC_DATA) {
    const inRange = isInZodiacRange(month, day, zodiac);
    if (inRange) {
      // Calculate decan (1, 2, or 3 based on position in sign)
      const decan = calculateDecan(date, zodiac);
      return {
        decan,
        element: zodiac.element,
        modality: zodiac.modality,
        rulingPlanet: zodiac.rulingPlanet,
        sign: zodiac.sign,
      };
    }
  }

  // Default fallback
  return {
    decan: 1,
    element: "Earth",
    modality: "Cardinal",
    rulingPlanet: "Saturn",
    sign: "Capricorn",
  };
}

function isInZodiacRange(
  month: number,
  day: number,
  zodiac: ZodiacData,
): boolean {
  if (month === zodiac.startMonth && day >= zodiac.startDay) return true;
  if (month === zodiac.endMonth && day <= zodiac.endDay) return true;
  return false;
}
