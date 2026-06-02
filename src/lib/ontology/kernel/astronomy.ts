/**
 * Ontology Kernel - Astronomy
 * Standardized astronomical calculations for Earth-based observations.
 */

import { normalizeAngle } from "./math";
import { getJulianCenturies, getJulianDay } from "./time";

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

/**
 * Calculates the Equation of Time (EoT) in minutes.
 * Precision: ~15 seconds.
 */
export function calculateEoT(date: Date): number {
  const T = getJulianCenturies(date);

  // Geometric Mean Longitude of Sun (L0)
  const L0 = normalizeAngle(280.46646 + 36000.76983 * T + 0.0003032 * T * T);

  // Mean Anomaly of Sun (M)
  const M = normalizeAngle(357.52911 + 35999.05029 * T - 0.0001537 * T * T);

  // Eccentricity of Earth's orbit (e)
  const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;

  // Obliquity of Ecliptic (epsilon)
  const epsilon0 = 23 + 26 / 60 + 21.448 / 3600 - (46.815 / 3600) * T;
  const epsilon = epsilon0 + (9.2 / 3600) * Math.cos((125 - 1934.1 * T) * D2R);

  const y = Math.pow(Math.tan((epsilon / 2) * D2R), 2);

  const eot =
    y * Math.sin(2 * L0 * D2R) -
    2 * e * Math.sin(M * D2R) +
    4 * e * y * Math.sin(M * D2R) * Math.cos(2 * L0 * D2R) -
    0.5 * y * y * Math.sin(4 * L0 * D2R) -
    1.25 * e * e * Math.sin(2 * M * D2R);

  return eot * R2D * 4;
}

/**
 * Calculates Solar Longitude at a given moment.
 */
export function getSolarLongitude(date: Date): number {
  const T = getJulianCenturies(date);

  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;

  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * D2R) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M * D2R) +
    0.000289 * Math.sin(3 * M * D2R);

  return normalizeAngle(L0 + C);
}

/**
 * Calculates the date of a specific Solar Term for a given year.
 * termIndex: 0 (Ipchun/Lichun) to 23 (Daehan).
 * Precision: ~10-15 minutes.
 */
export function getSolarTermDate(year: number, termIndex: number): Date {
  // Rough estimate of the term date
  const baseDate = new Date(year, 0, 1);
  const daysOffset = (termIndex * 15 + 315) % 360; // 0 starts at 315 deg (Ipchun)
  const estimatedDate = new Date(
    baseDate.getTime() + (daysOffset + 30) * 24 * 60 * 60 * 1000,
  );

  // Refine using solar longitude (simplified iteration)
  let refinedDate = estimatedDate;
  const targetLongitude = (termIndex * 15 + 315) % 360;

  for (let i = 0; i < 3; i++) {
    const currentLon = getSolarLongitude(refinedDate);
    const diff = ((targetLongitude - currentLon + 540) % 360) - 180;
    refinedDate = new Date(
      refinedDate.getTime() + diff * (365.2425 / 360) * 24 * 60 * 60 * 1000,
    );
  }

  return refinedDate;
}

/**
 * Calculates True Solar Time (TST) based on Local Clock Time and Longitude.
 */
export function getTrueSolarTime(date: Date, longitude: number): Date {
  const timezoneOffsetMin = -date.getTimezoneOffset();
  const standardMeridian = (timezoneOffsetMin / 60) * 15;
  const longitudeCorrection = (longitude - standardMeridian) * 4;
  const eot = calculateEoT(date);
  const totalCorrectionMs = (longitudeCorrection + eot) * 60 * 1000;

  return new Date(date.getTime() + totalCorrectionMs);
}
