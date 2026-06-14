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

export type Planet = 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto';

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
  jupiter: (d) => ({
    N: 100.4542 + 2.76854e-5 * d,
    i: 1.303 - 1.557e-7 * d,
    w: 273.8777 + 1.64505e-5 * d,
    a: 5.20256,
    e: 0.048498 + 4.469e-9 * d,
    M: 19.895 + 0.0830853001 * d,
  }),
  saturn: (d) => ({
    N: 113.6634 + 2.3898e-5 * d,
    i: 2.4886 - 1.081e-7 * d,
    w: 339.3939 + 2.97661e-5 * d,
    a: 9.55475,
    e: 0.055546 - 9.499e-9 * d,
    M: 316.967 + 0.0334442282 * d,
  }),
  uranus: (d) => ({
    N: 74.0005 + 1.3978e-5 * d,
    i: 0.7733 + 1.9e-8 * d,
    w: 96.6612 + 3.0565e-5 * d,
    a: 19.18171 - 1.55e-8 * d,
    e: 0.047318 + 7.45e-9 * d,
    M: 142.5905 + 0.011725806 * d,
  }),
  neptune: (d) => ({
    N: 131.7806 + 3.0173e-5 * d,
    i: 1.77 - 2.55e-7 * d,
    w: 272.8461 - 6.027e-6 * d,
    a: 30.05826 + 3.313e-8 * d,
    e: 0.008606 + 2.15e-9 * d,
    M: 260.2471 + 0.005995147 * d,
  }),
  // Pluto is handled by a dedicated periodic-term formula (plutoHeliocentric), not Keplerian elements.
  pluto: () => ({ N: 0, i: 0, w: 0, a: 0, e: 0, M: 0 }),
};

// Mean anomalies (deg) — arguments for mutual perturbations.
function jupiterMeanAnomaly(d: number): number { return 19.895 + 0.0830853001 * d; }
function saturnMeanAnomaly(d: number): number { return 316.967 + 0.0334442282 * d; }
function uranusMeanAnomaly(d: number): number { return 142.5905 + 0.011725806 * d; }

/**
 * Pluto's heliocentric ecliptic rectangular coordinates (AU) via Schlyter's special
 * periodic-term series (valid ~1800–2050). Pluto's orbit is too eccentric/inclined
 * for the simple Keplerian model, so it gets its own treatment.
 */
function plutoHeliocentric(d: number): { x: number; y: number; z: number } {
  const S = (50.03 + 0.033459652 * d) * D2R;
  const P = (238.95 + 0.003968789 * d) * D2R;

  const lonecl = 238.9508 + 0.00400703 * d
    - 19.799 * Math.sin(P) + 19.848 * Math.cos(P)
    + 0.897 * Math.sin(2 * P) - 4.956 * Math.cos(2 * P)
    + 0.610 * Math.sin(3 * P) + 1.211 * Math.cos(3 * P)
    - 0.341 * Math.sin(4 * P) - 0.190 * Math.cos(4 * P)
    + 0.128 * Math.sin(5 * P) - 0.034 * Math.cos(5 * P)
    - 0.038 * Math.sin(6 * P) + 0.031 * Math.cos(6 * P)
    + 0.020 * Math.sin(S - P) - 0.010 * Math.cos(S - P);
  const latecl = -3.9082
    - 5.453 * Math.sin(P) - 14.975 * Math.cos(P)
    + 3.527 * Math.sin(2 * P) + 1.673 * Math.cos(2 * P)
    - 1.051 * Math.sin(3 * P) + 0.328 * Math.cos(3 * P)
    + 0.179 * Math.sin(4 * P) - 0.292 * Math.cos(4 * P)
    + 0.019 * Math.sin(5 * P) + 0.100 * Math.cos(5 * P)
    - 0.031 * Math.sin(6 * P) - 0.026 * Math.cos(6 * P)
    + 0.011 * Math.cos(S - P);
  const r = 40.72
    + 6.68 * Math.sin(P) + 6.90 * Math.cos(P)
    - 1.18 * Math.sin(2 * P) - 0.03 * Math.cos(2 * P)
    + 0.15 * Math.sin(3 * P) - 0.14 * Math.cos(3 * P);

  const lon = lonecl * D2R;
  const lat = latecl * D2R;
  return {
    x: r * Math.cos(lon) * Math.cos(lat),
    y: r * Math.sin(lon) * Math.cos(lat),
    z: r * Math.sin(lat),
  };
}

/**
 * Schlyter perturbation correction to a planet's heliocentric ecliptic longitude
 * (degrees). Significant only for Jupiter and Saturn (mutual perturbations).
 */
function longitudePerturbation(planet: Planet, d: number): number {
  if (planet === 'uranus') {
    const Mj = jupiterMeanAnomaly(d) * D2R;
    const Ms = saturnMeanAnomaly(d) * D2R;
    const Mu = uranusMeanAnomaly(d) * D2R;
    return (
      0.040 * Math.sin(Ms - 2 * Mu + 6 * D2R)
      + 0.035 * Math.sin(Ms - 3 * Mu + 33 * D2R)
      - 0.015 * Math.sin(Mj - Mu + 20 * D2R)
    );
  }
  if (planet !== 'jupiter' && planet !== 'saturn') return 0;
  const Mj = jupiterMeanAnomaly(d) * D2R;
  const Ms = saturnMeanAnomaly(d) * D2R;
  if (planet === 'jupiter') {
    return (
      -0.332 * Math.sin(2 * Mj - 5 * Ms - 67.6 * D2R)
      - 0.056 * Math.sin(2 * Mj - 2 * Ms + 21 * D2R)
      + 0.042 * Math.sin(3 * Mj - 5 * Ms + 21 * D2R)
      - 0.036 * Math.sin(Mj - 2 * Ms)
      + 0.022 * Math.cos(Mj - Ms)
      + 0.023 * Math.sin(2 * Mj - 3 * Ms + 52 * D2R)
      - 0.016 * Math.sin(Mj - 5 * Ms - 69 * D2R)
    );
  }
  // saturn
  return (
    0.812 * Math.sin(2 * Mj - 5 * Ms - 67.6 * D2R)
    - 0.229 * Math.cos(2 * Mj - 4 * Ms - 2 * D2R)
    + 0.119 * Math.sin(Mj - 2 * Ms - 3 * D2R)
    + 0.046 * Math.sin(2 * Mj - 6 * Ms - 69 * D2R)
    + 0.014 * Math.sin(Mj - 3 * Ms + 32 * D2R)
  );
}

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
  let helio = planet === 'pluto' ? plutoHeliocentric(d) : heliocentric(PLANET_ELEMENTS[planet](d));

  // Apply Jupiter/Saturn mutual perturbations to the heliocentric longitude.
  const dLon = longitudePerturbation(planet, d);
  if (dLon !== 0) {
    const r = Math.sqrt(helio.x * helio.x + helio.y * helio.y + helio.z * helio.z);
    const lon = Math.atan2(helio.y, helio.x) * R2D + dLon;
    const lat = Math.atan2(helio.z, Math.sqrt(helio.x * helio.x + helio.y * helio.y)) * R2D;
    const lonR = lon * D2R;
    const latR = lat * D2R;
    helio = {
      x: r * Math.cos(lonR) * Math.cos(latR),
      y: r * Math.sin(lonR) * Math.cos(latR),
      z: r * Math.sin(latR),
    };
  }

  const sun = getSchlyterSun(date);
  const xg = helio.x + sun.x;
  const yg = helio.y + sun.y;
  return normalizeAngle(Math.atan2(yg, xg) * R2D);
}
