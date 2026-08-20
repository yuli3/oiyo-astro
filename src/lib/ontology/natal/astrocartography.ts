/**
 * Astrocartography MC/IC meridians from a birth instant.
 * Vertical world-map lines: where each planet was on the Midheaven / IC.
 * ASC/DSC curves are not in v1 (latitude-dependent).
 * Symbolic locality map — not relocation advice.
 */
import { normalizeAngle } from '../kernel/math';
import { getSolarLongitude } from '../kernel/astronomy';
import { getGMST, getLunarLongitude, getObliquity } from './calculator';
import { getPlanetLongitude } from './planets';

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

export type CartoBody = 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn';

export interface CartoMeridian {
  body: CartoBody;
  /** Geographic east-longitude of the MC line, −180…180. */
  mcLon: number;
  /** IC = MC + 180°, wrapped to −180…180. */
  icLon: number;
}

function wrap180(deg: number): number {
  const n = ((deg + 180) % 360 + 360) % 360 - 180;
  return n;
}

/** Right ascension (degrees) from ecliptic longitude, β ≈ 0. */
export function eclipticLongitudeToRA(lambdaDeg: number, date: Date): number {
  const eps = getObliquity(date) * D2R;
  const lam = lambdaDeg * D2R;
  const ra = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam)) * R2D;
  return normalizeAngle(ra);
}

export function mcLongitudeEast(raDeg: number, gmstDeg: number): number {
  return wrap180(raDeg - gmstDeg);
}

const BODIES: CartoBody[] = [
  'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn',
];

function eclipticOf(body: CartoBody, date: Date): number {
  if (body === 'sun') return getSolarLongitude(date);
  if (body === 'moon') return getLunarLongitude(date);
  return getPlanetLongitude(body, date);
}

export function computeAstroCartoMeridians(date: Date): CartoMeridian[] {
  const gmst = getGMST(date);
  return BODIES.map((body) => {
    const ra = eclipticLongitudeToRA(eclipticOf(body, date), date);
    const mcLon = mcLongitudeEast(ra, gmst);
    return { body, mcLon, icLon: wrap180(mcLon + 180) };
  });
}
