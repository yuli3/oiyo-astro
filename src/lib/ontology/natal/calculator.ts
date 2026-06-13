/**
 * Natal chart kernel — the "Big Three": Sun sign, Moon sign, and Ascendant (Rising).
 *
 * Built on the shared ontology kernel:
 *  - Sun longitude reuses the validated `getSolarLongitude` (kernel/astronomy).
 *  - Moon longitude uses an abridged ELP/Meeus series (Astronomical Algorithms, ch. 47),
 *    accurate to well under 0.1° — far finer than the 30° sign bins.
 *  - The Ascendant uses the standard ecliptic/horizon intersection. The formula is
 *    verified by the altitude-zero invariant (the returned point sits exactly on the
 *    eastern horizon) in calculator.test.ts.
 *
 * Time handling: all inputs are UTC `Date` instants (callers convert local birth time
 * with the birthplace's UTC offset before calling here). The kernel's `getJulianDay`
 * derives the Julian Day from the Date's UTC fields.
 */

import { normalizeAngle } from '../kernel/math';
import { getJulianCenturies, getJulianDay, J2000_EPOCH } from '../kernel/time';
import { getSolarLongitude } from '../kernel/astronomy';

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

export type SignKey =
  | 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo'
  | 'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

export const SIGN_KEYS: SignKey[] = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

export interface Placement {
  /** Ecliptic longitude, 0–360°. */
  longitude: number;
  /** Zodiac sign the longitude falls in. */
  sign: SignKey;
  /** Degrees within the sign, 0–30. */
  degreeInSign: number;
}

/** Map an ecliptic longitude to a sign placement. */
export function toPlacement(longitude: number): Placement {
  const lon = normalizeAngle(longitude);
  const idx = Math.floor(lon / 30) % 12;
  return { longitude: lon, sign: SIGN_KEYS[idx], degreeInSign: lon - idx * 30 };
}

/** Mean obliquity of the ecliptic (degrees), Meeus 22.2 (low-order). */
export function getObliquity(date: Date): number {
  const T = getJulianCenturies(date);
  return 23.439291 - 0.0130042 * T - 1.64e-7 * T * T + 5.04e-7 * T * T * T;
}

// Abridged lunar longitude series (Meeus ch. 47, table 47.A — main terms).
// Each row: [D, M, M', F, coefficient(1e-6 deg)].
const MOON_TERMS: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [0, 0, 1, 0, 6288774], [2, 0, -1, 0, 1274027], [2, 0, 0, 0, 658314],
  [0, 0, 2, 0, 213618], [0, 1, 0, 0, -185116], [0, 0, 0, 2, -114332],
  [2, 0, -2, 0, 58793], [2, -1, -1, 0, 57066], [2, 0, 1, 0, 53322],
  [2, -1, 0, 0, 45758], [0, 1, -1, 0, -40923], [1, 0, 0, 0, -34720],
  [0, 1, 1, 0, -30383], [2, 0, 0, -2, 15327], [0, 0, 1, 2, -12528],
  [0, 0, 1, -2, 10980], [4, 0, -1, 0, 10675], [0, 0, 3, 0, 10034],
  [4, 0, -2, 0, 8548], [2, 1, -1, 0, -7888], [2, 1, 0, 0, -6766],
  [1, 0, -1, 0, -5163], [1, 1, 0, 0, 4987], [2, -1, 1, 0, 4036],
  [2, 0, 2, 0, 3994], [4, 0, 0, 0, 3861], [2, 0, -3, 0, 3665],
  [0, 1, -2, 0, -2689], [2, 0, -1, 2, -2602], [2, -1, -2, 0, 2390],
  [1, 0, 1, 0, -2348], [2, -2, 0, 0, 2236], [0, 1, 2, 0, -2120],
  [0, 2, 0, 0, -2069], [2, -2, -1, 0, 2048],
];

/**
 * Geocentric apparent ecliptic longitude of the Moon (degrees, 0–360).
 * Abridged Meeus series; better than ~0.1° — comfortably sign-accurate.
 */
export function getLunarLongitude(date: Date): number {
  const T = getJulianCenturies(date);

  const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T
    + (T * T * T) / 538841 - (T * T * T * T) / 65194000;
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T
    + (T * T * T) / 545868 - (T * T * T * T) / 113065000;
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T
    + (T * T * T) / 24490000;
  const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T
    + (T * T * T) / 69699 - (T * T * T * T) / 14712000;
  const F = 93.272095 + 483202.0175233 * T - 0.0036539 * T * T
    - (T * T * T) / 3526000 + (T * T * T * T) / 863310000;

  // Eccentricity correction for terms involving the Sun's anomaly M.
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;

  let sumL = 0;
  for (const [cd, cm, cmp, cf, coeff] of MOON_TERMS) {
    const arg = (cd * D + cm * M + cmp * Mp + cf * F) * D2R;
    let term = coeff * Math.sin(arg);
    if (cm === 1 || cm === -1) term *= E;
    else if (cm === 2 || cm === -2) term *= E * E;
    sumL += term;
  }

  return normalizeAngle(Lp + sumL / 1_000_000);
}

/**
 * Greenwich Mean Sidereal Time in degrees (Meeus 12.4), 0–360.
 */
export function getGMST(date: Date): number {
  const jd = getJulianDay(date);
  const T = (jd - J2000_EPOCH) / 36525.0;
  const gmst = 280.46061837
    + 360.98564736629 * (jd - J2000_EPOCH)
    + 0.000387933 * T * T
    - (T * T * T) / 38710000;
  return normalizeAngle(gmst);
}

/**
 * Ascendant (Rising) ecliptic longitude in degrees, 0–360.
 * @param longitudeEast Observer longitude, east-positive degrees.
 * @param latitude Observer latitude, north-positive degrees.
 *
 * Formula: λ = atan2( cos(RAMC), −(sin ε · tan φ + cos ε · sin RAMC) ),
 * where RAMC (local sidereal time) = GMST + observer longitude. Verified by the
 * altitude-zero / eastern-horizon invariant in the test suite.
 */
export function getAscendantLongitude(date: Date, latitude: number, longitudeEast: number): number {
  const ramc = normalizeAngle(getGMST(date) + longitudeEast);
  const eps = getObliquity(date);
  const y = Math.cos(ramc * D2R);
  const x = -(Math.sin(eps * D2R) * Math.tan(latitude * D2R) + Math.cos(eps * D2R) * Math.sin(ramc * D2R));
  return normalizeAngle(Math.atan2(y, x) * R2D);
}

export interface NatalInput {
  /** UTC instant of birth. */
  date: Date;
  /** Observer latitude, north-positive degrees. */
  latitude: number;
  /** Observer longitude, east-positive degrees. */
  longitude: number;
}

export interface NatalChart {
  sun: Placement;
  moon: Placement;
  ascendant: Placement;
}

/** Compute the Big Three placements for a precise UTC birth instant + location. */
export function computeNatalChart({ date, latitude, longitude }: NatalInput): NatalChart {
  return {
    sun: toPlacement(getSolarLongitude(date)),
    moon: toPlacement(getLunarLongitude(date)),
    ascendant: toPlacement(getAscendantLongitude(date, latitude, longitude)),
  };
}
