/**
 * Geocentric ecliptic longitudes of the personal planets (Mercury, Venus, Mars).
 *
 * Uses Paul Schlyter's compact planetary theory ("Computing planetary positions"),
 * which gives ~1–2 arcminute accuracy from simple Keplerian elements — far finer
 * than the 30° zodiac-sign bins. Correctness is enforced by the elongation invariant
 * in planets.test.ts: Mercury must stay within ~28° of the Sun and Venus within ~47°,
 * which only holds if the full Sun + planet + geocentric conversion is right.
 *
 * Epoch: 2000 Jan 0.0 TT = JD 2451543.5. Inputs are UTC `Date` instants.
 */

import { normalizeAngle } from '../kernel/math';
import { getJulianDay } from '../kernel/time';

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;
const EPOCH_2000_JAN0 = 2451543.5;

export type Planet = 'mercury' | 'venus' | 'mars';

interface Elements {
  N: number; // longitude of ascending node (deg)
  i: number; // inclination (deg)
  w: number; // argument of perihelion (deg)
  a: number; // semi-major axis (AU)
  e: number; // eccentricity
  M: number; // mean anomaly (deg)
}

/** Days since the 2000 Jan 0.0 epoch. */
function daysSinceEpoch(date: Date): number {
  return getJulianDay(date) - EPOCH_2000_JAN0;
}

// Orbital elements as linear functions of d (Schlyter).
const PLANET_ELEMENTS: Record<Planet, (d: number) => Elements> = {
  mercury: (d) => ({
    N: 48.3313 + 3.24587e-5 * d,
    i: 7.0047 + 5.0e-8 * d,
    w: 29.1241 + 1.01444e-5 * d,
    a: 0.387098,
    e: 0.205635 + 5.59e-10 * d,
    M: 168.6562 + 4.0923344368 * d,
  }),
  venus: (d) => ({
    N: 76.6799 + 2.4659e-5 * d,
    i: 3.3946 + 2.75e-8 * d,
    w: 54.891 + 1.38374e-5 * d,
    a: 0.72333,
    e: 0.006773 - 1.302e-9 * d,
    M: 48.0052 + 1.6021302244 * d,
  }),
  mars: (d) => ({
    N: 49.5574 + 2.11081e-5 * d,
    i: 1.8497 - 1.78e-8 * d,
    w: 286.5016 + 2.92961e-5 * d,
    a: 1.523688,
    e: 0.093405 + 2.516e-9 * d,
    M: 18.6021 + 0.5240207766 * d,
  }),
};

/** Solve Kepler's equation; returns eccentric anomaly in radians. */
function eccentricAnomaly(Mdeg: number, e: number): number {
  const M = normalizeAngle(Mdeg) * D2R;
  let E = M + e * Math.sin(M) * (1 + e * Math.cos(M));
  for (let i = 0; i < 8; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-9) break;
  }
  return E;
}

/** Heliocentric ecliptic rectangular coordinates (AU) from orbital elements. */
function heliocentric(el: Elements): { x: number; y: number; z: number } {
  const E = eccentricAnomaly(el.M, el.e);
  const xv = el.a * (Math.cos(E) - el.e);
  const yv = el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E);
  const v = Math.atan2(yv, xv);
  const r = Math.sqrt(xv * xv + yv * yv);
  const N = el.N * D2R;
  const i = el.i * D2R;
  const vw = v + el.w * D2R;
  return {
    x: r * (Math.cos(N) * Math.cos(vw) - Math.sin(N) * Math.sin(vw) * Math.cos(i)),
    y: r * (Math.sin(N) * Math.cos(vw) + Math.cos(N) * Math.sin(vw) * Math.cos(i)),
    z: r * (Math.sin(vw) * Math.sin(i)),
  };
}

/**
 * The Sun's geocentric ecliptic longitude (deg) and rectangular coords (AU),
 * via Schlyter's solar elements — the reference frame for geocentric conversion.
 */
export function getSchlyterSun(date: Date): { longitude: number; x: number; y: number } {
  const d = daysSinceEpoch(date);
  const w = 282.9404 + 4.70935e-5 * d;
  const e = 0.016709 - 1.151e-9 * d;
  const M = 356.047 + 0.9856002585 * d;
  const E = eccentricAnomaly(M, e);
  const xv = Math.cos(E) - e;
  const yv = Math.sqrt(1 - e * e) * Math.sin(E);
  const v = Math.atan2(yv, xv) * R2D;
  const r = Math.sqrt(xv * xv + yv * yv);
  const lon = normalizeAngle(v + w);
  return { longitude: lon, x: r * Math.cos(lon * D2R), y: r * Math.sin(lon * D2R) };
}

/** Geocentric ecliptic longitude of a planet (deg, 0–360). */
export function getPlanetLongitude(planet: Planet, date: Date): number {
  const d = daysSinceEpoch(date);
  const helio = heliocentric(PLANET_ELEMENTS[planet](d));
  const sun = getSchlyterSun(date);
  const xg = helio.x + sun.x;
  const yg = helio.y + sun.y;
  return normalizeAngle(Math.atan2(yg, xg) * R2D);
}
