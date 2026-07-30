/**
 * Egyptian Astrology Calculator
 * The Grand Archive - Shard-M (Mythology)
 *
 * Determines patron deity and decan based on birthdate.
 */

import { getDayOfYear } from "../kernel/time";
import { EGYPTIAN_DEITIES, EGYPTIAN_DEITY_DATES, RA_DEITY } from "./data";
import type { EgyptianCoordinates, EgyptianDecan } from "./types";

/**
 * Main calculator function
 */
export function calculateEgyptianCoordinates(date: Date): EgyptianCoordinates {
  const patronDeity = getPatronDeity(date);
  const decan = calculateDecan(date);
  const luckyColors = getLuckyColors(patronDeity);
  const luckyNumbers = getLuckyNumbers(patronDeity);

  // Determine sacred animal from deity symbol
  const sacredAnimal = patronDeity.symbol;

  return {
    decan,
    luckyColors,
    luckyNumbers,
    patronDeity,
    resonance: {
      key: "resonance.note",
      params: {
        deity: `deities.${patronDeity.id}.name`,
        domain: `deities.${patronDeity.id}.domain`,
        traits: `deities.${patronDeity.id}.traits`,
      },
    },
    sacredAnimal: patronDeity.symbol,
  };
}

/**
 * Calculate Egyptian Decan (36 decans, each 10° of ecliptic)
 * Each decan is approximately 10 days.
 */
function calculateDecan(date: Date): EgyptianDecan {
  const dayOfYear = getDayOfYear(date);

  // Each decan is ~10.14 days (365.25 / 36)
  const decanNumber = Math.min(36, Math.ceil(dayOfYear / 10.14));

  // Zodiac signs for reference (each has 3 decans)
  const signs = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
  ];

  // Decan rulers (Egyptian version - uses 7 planets)
  const decanRulers = [
    "Mars",
    "Sun",
    "Venus", // Aries
    "Mercury",
    "Moon",
    "Saturn", // Taurus
    "Jupiter",
    "Mars",
    "Sun", // Gemini
    "Venus",
    "Mercury",
    "Moon", // Cancer
    "Saturn",
    "Jupiter",
    "Mars", // Leo
    "Sun",
    "Venus",
    "Mercury", // Virgo
    "Moon",
    "Saturn",
    "Jupiter", // Libra
    "Mars",
    "Sun",
    "Venus", // Scorpio
    "Mercury",
    "Moon",
    "Saturn", // Sagittarius
    "Jupiter",
    "Mars",
    "Sun", // Capricorn
    "Venus",
    "Mercury",
    "Moon", // Aquarius
    "Saturn",
    "Jupiter",
    "Mars", // Pisces
  ];

  // Egyptian decan names (simplified - using deity associations)
  const decanNames = [
    "Chontamenti",
    "Aroueris",
    "Siket",
    "Thuban",
    "Agny",
    "Sopdet",
    "Eregbuo",
    "Tepiabt",
    "Situla",
    "Sesheta",
    "Akhet",
    "Hery-ib-Wia",
    "Thermouthis",
    "Khentet",
    "Sepa",
    "Tpa-n-khent",
    "Khery",
    "Tpahent",
    "Smat",
    "Qed",
    "Seshmetet",
    "Ksenty",
    "Khau",
    "Arat",
    "Remen-hru",
    "Sah",
    "Tepy-a",
    "Khau",
    "Teymu",
    "Mestcher",
    "Tepa-khent",
    "Hntw",
    "Knm",
    "Shesmetet",
    "Baba",
    "Kheprer",
  ];

  const signIndex = Math.floor((decanNumber - 1) / 3);
  const zodiacSign = signs[signIndex] || "Aries";

  return {
    decanRuler: decanRulers[decanNumber - 1] || "Sun",
    deity:
      EGYPTIAN_DEITIES[decanNumber % EGYPTIAN_DEITIES.length]?.name || "Ra",
    endDegree: decanNumber * 10,
    name: decanNames[decanNumber - 1] || `Decan ${decanNumber}`,
    number: decanNumber,
    startDegree: (decanNumber - 1) * 10,
    zodiacSign,
  };
}

// getDayOfYear removed: Moved to kernel

/**
 * Determine lucky colors based on deity
 */
function getLuckyColors(deity: typeof RA_DEITY): string[] {
  const elementColors: Record<string, string[]> = {
    Air: ["Azure", "Silver", "White"],
    Earth: ["Brown", "Green", "Amber"],
    Fire: ["Gold", "Crimson", "Orange"],
    Water: ["Deep Blue", "Turquoise", "Sea Green"],
  };

  return elementColors[deity.element] || ["Gold"];
}

/**
 * Determine lucky numbers based on deity
 */
function getLuckyNumbers(deity: typeof RA_DEITY): number[] {
  // Numerological associations with Egyptian deities
  const deityNumbers: Record<string, number[]> = {
    anubis: [4, 13, 22],
    bastet: [6, 15, 24],
    geb: [4, 13, 22],
    hathor: [6, 15, 24],
    horus: [9, 18, 27],
    isis: [2, 11, 20],
    nut: [7, 16, 25],
    osiris: [8, 17, 26],
    ra: [1, 10, 19],
    sekhmet: [3, 12, 21],
    seth: [7, 16, 25],
    thoth: [5, 14, 23],
    wadjet: [3, 12, 21],
  };

  return deityNumbers[deity.id] || [1, 10, 19];
}

/**
 * Get patron deity for a given date
 */
function getPatronDeity(date: Date) {
  for (const deityDate of EGYPTIAN_DEITY_DATES) {
    for (const range of deityDate.ranges) {
      if (isDateInRange(date, range)) {
        const deity = EGYPTIAN_DEITIES.find((d) => d.id === deityDate.deityId);
        if (deity) return deity;
      }
    }
  }

  // Fallback to Ra for uncovered dates
  return RA_DEITY;
}

/**
 * Check if a date falls within a given range
 */
function isDateInRange(
  date: Date,
  range: {
    endDay: number;
    endMonth: number;
    startDay: number;
    startMonth: number;
  },
): boolean {
  const month = date.getMonth() + 1; // 1-indexed
  const day = date.getDate();

  // Handle year wrap-around (e.g., Dec to Jan)
  if (range.startMonth > range.endMonth) {
    return (
      month > range.startMonth ||
      (month === range.startMonth && day >= range.startDay) ||
      month < range.endMonth ||
      (month === range.endMonth && day <= range.endDay)
    );
  }

  // Standard range within same year
  const afterStart =
    month > range.startMonth ||
    (month === range.startMonth && day >= range.startDay);
  const beforeEnd =
    month < range.endMonth || (month === range.endMonth && day <= range.endDay);

  return afterStart && beforeEnd;
}
