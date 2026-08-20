import { describe, it, expect } from 'vitest';
import { computeAstroCartoMeridians, computeHorizonCurves, bodyAltitude, eclipticLongitudeToRA, mcLongitudeEast } from './astrocartography';
import { getGMST } from './calculator';
import { getSolarLongitude } from '../kernel/astronomy';

const wrap = (a: number) => ((a + 180) % 360 + 360) % 360 - 180;

describe('astrocartography meridians', () => {
  it('IC is 180° from MC', () => {
    const date = new Date(Date.UTC(1990, 4, 20, 6, 30, 0));
    for (const line of computeAstroCartoMeridians(date)) {
      const d = Math.abs(wrap(line.icLon - line.mcLon));
      expect(d).toBeCloseTo(180, 5);
    }
  });

  it('MC longitude is RA minus GMST (wrapped)', () => {
    const date = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
    const gmst = getGMST(date);
    const ra = eclipticLongitudeToRA(0, date);
    expect(mcLongitudeEast(ra, gmst)).toBeCloseTo(wrap(ra - gmst), 6);
  });

  it('returns seven bodies', () => {
    const lines = computeAstroCartoMeridians(new Date(Date.UTC(2020, 5, 21, 0, 0, 0)));
    expect(lines.map((l) => l.body)).toEqual([
      'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn',
    ]);
  });
});

describe('astrocartography horizon curves', () => {
  it('ASC/DSC points sit on the horizon', () => {
    const date = new Date(Date.UTC(1990, 4, 20, 6, 30, 0));
    const lam = getSolarLongitude(date);
    const sun = computeHorizonCurves(date).find((c) => c.body === 'sun');
    expect(sun).toBeTruthy();
    expect(sun!.asc.length).toBeGreaterThan(20);
    let max = 0;
    for (const p of [...sun!.asc, ...sun!.dsc]) {
      max = Math.max(max, Math.abs(bodyAltitude(lam, date, p.lat, p.lon)));
    }
    expect(max).toBeLessThan(0.05);
  });
});
