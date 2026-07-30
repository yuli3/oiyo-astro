/**
 * Vedic Nakshatra Calculator
 * The Grand Archive - Shard-O (Eastern Astrology)
 *
 * Calculates the Moon's Nakshatra based on birthdate.
 * Note: This is a simplified algorithm using lunar day approximation.
 * For precise results, ephemeris data would be required.
 */

import { normalizeAngle } from "../kernel/math";
import { getJulianDay } from "../kernel/time";
import { NAKSHATRAS, PADA_NAVAMSHA, RASHI_SIGNS } from "./data";
import type { Pada, VedicCoordinates } from "./types";

/**
 * Main calculator function
 */
export function calculateVedicCoordinates(date: Date): VedicCoordinates {
  const moonLongitude = approximateMoonLongitude(date);
  const { nakshatra, pada } = getNakshatraFromLongitude(moonLongitude);
  const moonSign = getMoonSign(moonLongitude);
  const tithi = calculateTithi(date);

  // Simplified Yoga and Karana
  const yoga = "Vishkumbha"; // Would need sun-moon calculation
  const karana = "Bava"; // Would need precise tithi fraction

  return {
    karana,
    moonDegree: parseFloat(moonLongitude.toFixed(2)),
    moonSign,
    nakshatra,
    pada,
    resonance: {
      key: "resonance.note",
      params: {
        deity: `${nakshatra.key}.deity`,
        moonSign,
        nakshatraName: `${nakshatra.key}.name`,
        // keywords are now handled by UI via `nakshatra.key` lookup if needed
      },
    },
    tithi,
    yoga,
  };
}

/**
 * Get Nakshatra from lunar longitude
 * Each Nakshatra spans 13°20' = 13.333...°
 */
export function getNakshatraFromLongitude(longitude: number): {
  nakshatra: (typeof NAKSHATRAS)[0];
  pada: Pada;
} {
  // Nakshatra span: 360° / 27 = 13.333...°
  const nakshatraSpan = 360 / 27;
  const padaSpan = nakshatraSpan / 4; // 3.333...°

  // Calculate nakshatra index (0-26)
  const nakshatraIndex = Math.floor(longitude / nakshatraSpan) % 27;
  const nakshatra = NAKSHATRAS[nakshatraIndex];

  // Calculate pada within nakshatra (1-4)
  const positionInNakshatra = longitude - nakshatraIndex * nakshatraSpan;
  const padaNumber = (Math.floor(positionInNakshatra / padaSpan) + 1) as
    | 1
    | 2
    | 3
    | 4;

  // Get navamsha sign for this pada
  const navamshaSign = PADA_NAVAMSHA[nakshatra.id]?.[padaNumber - 1] || "Aries";

  // Sound syllables (simplified - first letter based on pada)
  const soundSyllables: Record<number, string[]> = {
    1: ["Chu", "Che", "Cho", "La"],
    2: ["Li", "Lu", "Le", "Lo"],
    3: ["A", "I", "U", "E"],
    // ... would need full list
  };

  const pada: Pada = {
    navamshaSign,
    number: padaNumber,
    soundSyllable: soundSyllables[nakshatra.id]?.[padaNumber - 1] || "",
  };

  return { nakshatra, pada };
}

/**
 * Approximate lunar longitude from date.
 * The Moon moves approximately 13.176° per day.
 * This is a simplified estimation without full ephemeris.
 */
function approximateMoonLongitude(date: Date): number {
  // Days since J2000.0 (JD 2451545.0)
  const jd = getJulianDay(date);
  const daysSinceJ2000 = jd - 2451545.0;

  // Mean lunar elements (simplified)
  // Mean longitude at J2000: 218.3164477°
  // Mean daily motion: 13.17639648°
  const meanLongJ2000 = 218.3164477;
  const dailyMotion = 13.17639648;

  // Calculate mean longitude
  const moonLong = meanLongJ2000 + dailyMotion * daysSinceJ2000;

  return normalizeAngle(moonLong);
}

/**
 * Calculate Tithi (Lunar Day) - simplified
 * Based on Sun-Moon angular difference
 */
function calculateTithi(date: Date): string {
  const tithis = [
    "Shukla Pratipada",
    "Shukla Dwitiya",
    "Shukla Tritiya",
    "Shukla Chaturthi",
    "Shukla Panchami",
    "Shukla Shashthi",
    "Shukla Saptami",
    "Shukla Ashtami",
    "Shukla Navami",
    "Shukla Dashami",
    "Shukla Ekadashi",
    "Shukla Dwadashi",
    "Shukla Trayodashi",
    "Shukla Chaturdashi",
    "Purnima",
    "Krishna Pratipada",
    "Krishna Dwitiya",
    "Krishna Tritiya",
    "Krishna Chaturthi",
    "Krishna Panchami",
    "Krishna Shashthi",
    "Krishna Saptami",
    "Krishna Ashtami",
    "Krishna Navami",
    "Krishna Dashami",
    "Krishna Ekadashi",
    "Krishna Dwadashi",
    "Krishna Trayodashi",
    "Krishna Chaturdashi",
    "Amavasya",
  ];

  // Simplified: use lunar cycle approximation
  const newMoonRef = new Date(2000, 0, 6, 18, 14, 0); // Known new moon
  const lunarCycle = 29.530588853; // Synodic month in days
  const msPerDay = 86400000;

  const daysSinceRef = (date.getTime() - newMoonRef.getTime()) / msPerDay;
  const moonAge = ((daysSinceRef % lunarCycle) + lunarCycle) % lunarCycle;

  // Each tithi is ~0.984 days
  const tithiIndex = Math.floor(moonAge / (lunarCycle / 30));

  return tithis[tithiIndex % 30] || "Unknown";
}

/**
 * Get moon sign (Rashi) from longitude
 */
function getMoonSign(longitude: number): string {
  const signIndex = Math.floor(longitude / 30);
  return RASHI_SIGNS[signIndex];
}
