import { describe, it, expect } from 'vitest';
import {
  computeNatalChart,
  getAscendantLongitude,
  getGMST,
  getLunarLongitude,
  getObliquity,
  toPlacement,
} from './calculator';

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;
const norm = (a: number) => ((a % 360) + 360) % 360;

/**
 * The decisive Ascendant test: the returned ecliptic point must lie exactly on the
 * observer's horizon (altitude ≈ 0) AND on the rising (eastern) side. This validates
 * the formula independently of any external ephemeris.
 */
function altitudeOfAscendant(date: Date, lat: number, lonEast: number) {
  const lam = getAscendantLongitude(date, lat, lonEast);
  const eps = getObliquity(date);
  const dec = Math.asin(Math.sin(eps * D2R) * Math.sin(lam * D2R));
  const ra = Math.atan2(Math.cos(eps * D2R) * Math.sin(lam * D2R), Math.cos(lam * D2R)) * R2D;
  const ramc = norm(getGMST(date) + lonEast);
  const H = norm(ramc - ra); // hour angle, 0–360
  const alt = Math.asin(
    Math.sin(lat * D2R) * Math.sin(dec) + Math.cos(lat * D2R) * Math.cos(dec) * Math.cos(H * D2R),
  ) * R2D;
  return { alt, hourAngle: H };
}

describe('natal ascendant', () => {
  it('always lands on the eastern horizon (altitude 0, rising side)', () => {
    let maxAltErr = 0;
    for (let i = 0; i < 4000; i++) {
      const date = new Date(Date.UTC(1900 + Math.floor(Math.random() * 150), 0, 1)
        + Math.random() * 150 * 365.25 * 86400000);
      const lat = Math.random() * 130 - 65; // avoid polar extremes near ±66.5
      const lon = Math.random() * 360 - 180;
      const { alt, hourAngle } = altitudeOfAscendant(date, lat, lon);
      maxAltErr = Math.max(maxAltErr, Math.abs(alt));
      // Eastern horizon ⇒ hour angle in (180°, 360°).
      expect(hourAngle).toBeGreaterThan(180);
      expect(hourAngle).toBeLessThan(360);
    }
    expect(maxAltErr).toBeLessThan(1e-6);
  });
});

describe('natal moon', () => {
  it('moves at the expected mean rate (~13.176°/day) and stays bounded', () => {
    const t0 = new Date(Date.UTC(2010, 5, 15, 0, 0, 0));
    const t1 = new Date(t0.getTime() + 86400000);
    const l0 = getLunarLongitude(t0);
    const l1 = getLunarLongitude(t1);
    const motion = norm(l1 - l0);
    expect(motion).toBeGreaterThan(11);
    expect(motion).toBeLessThan(15);
    for (let i = 0; i < 200; i++) {
      const d = new Date(t0.getTime() + i * 86400000 * 1.7);
      const lon = getLunarLongitude(d);
      expect(lon).toBeGreaterThanOrEqual(0);
      expect(lon).toBeLessThan(360);
    }
  });
});

describe('natal chart shape', () => {
  it('returns three placements with valid signs and in-sign degrees', () => {
    const chart = computeNatalChart({
      date: new Date(Date.UTC(1990, 4, 20, 6, 30, 0)),
      latitude: 37.5665,
      longitude: 126.978,
    });
    for (const p of [chart.sun, chart.moon, chart.ascendant]) {
      expect(p.longitude).toBeGreaterThanOrEqual(0);
      expect(p.longitude).toBeLessThan(360);
      expect(p.degreeInSign).toBeGreaterThanOrEqual(0);
      expect(p.degreeInSign).toBeLessThan(30);
    }
  });

  it('toPlacement maps boundaries correctly', () => {
    expect(toPlacement(0).sign).toBe('aries');
    expect(toPlacement(29.9).sign).toBe('aries');
    expect(toPlacement(30).sign).toBe('taurus');
    expect(toPlacement(359.9).sign).toBe('pisces');
  });
});
