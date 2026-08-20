/**
 * Astrocartography MC/IC meridians + ASC/DSC horizon curves from a birth instant.
 * MC/IC: vertical meridians. ASC/DSC: latitude-dependent rising/setting loci.
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

export interface GeoPoint {
  lat: number;
  lon: number;
}

export interface CartoHorizon {
  body: CartoBody;
  /** Rising (ASC) locus, south → north. */
  asc: GeoPoint[];
  /** Setting (DSC) locus, south → north. */
  dsc: GeoPoint[];
}

function wrap180(deg: number): number {
  return ((deg + 180) % 360 + 360) % 360 - 180;
}

export function eclipticToEquatorial(lambdaDeg: number, date: Date): { ra: number; dec: number } {
  const eps = getObliquity(date) * D2R;
  const lam = lambdaDeg * D2R;
  const ra = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam)) * R2D;
  const dec = Math.asin(Math.sin(eps) * Math.sin(lam)) * R2D;
  return { ra: normalizeAngle(ra), dec };
}

/** Right ascension (degrees) from ecliptic longitude, β ≈ 0. */
export function eclipticLongitudeToRA(lambdaDeg: number, date: Date): number {
  return eclipticToEquatorial(lambdaDeg, date).ra;
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

/**
 * ASC/DSC: for each latitude, lon where the body is on the horizon at birth.
 * HA_rise = −H0, HA_set = +H0, lon = HA − GMST + RA.
 * Polar/circumpolar latitudes ( |tan φ tan δ| ≥ 1 ) are omitted.
 */
export function computeHorizonCurves(date: Date): CartoHorizon[] {
  const gmst = getGMST(date);
  return BODIES.map((body) => {
    const { ra, dec } = eclipticToEquatorial(eclipticOf(body, date), date);
    const tanDec = Math.tan(dec * D2R);
    const asc: GeoPoint[] = [];
    const dsc: GeoPoint[] = [];
    for (let lat = -66; lat <= 66; lat += 2) {
      const arg = -Math.tan(lat * D2R) * tanDec;
      if (Math.abs(arg) >= 0.999) continue;
      const H0 = Math.acos(arg) * R2D;
      const lonRise = wrap180(-H0 - gmst + ra);
      const lonSet = wrap180(H0 - gmst + ra);
      asc.push({ lat, lon: lonRise });
      dsc.push({ lat, lon: lonSet });
    }
    return { body, asc, dsc };
  });
}

/** Geocentric altitude (deg) of an ecliptic-longitude body at a geographic point. */
export function bodyAltitude(lambdaDeg: number, date: Date, lat: number, lonEast: number): number {
  const { ra, dec } = eclipticToEquatorial(lambdaDeg, date);
  const ramc = normalizeAngle(getGMST(date) + lonEast);
  const H = normalizeAngle(ramc - ra);
  const alt = Math.asin(
    Math.sin(lat * D2R) * Math.sin(dec * D2R)
    + Math.cos(lat * D2R) * Math.cos(dec * D2R) * Math.cos(H * D2R),
  ) * R2D;
  return alt;
}
