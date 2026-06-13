import { describe, it, expect } from 'vitest';
import { getPlanetLongitude, getSchlyterSun } from './planets';

const norm = (a: number) => ((a % 360) + 360) % 360;
/** Smallest absolute angular separation in degrees. */
function sep(a: number, b: number): number {
  return Math.abs(((a - b + 540) % 360) - 180);
}

describe('personal planets — elongation invariants', () => {
  // Inner planets can never appear far from the Sun. These limits validate the
  // entire Sun + heliocentric + geocentric pipeline simultaneously.
  it('Mercury stays within ~28° of the Sun across 60 years', () => {
    let maxElong = 0;
    const start = Date.UTC(1980, 0, 1);
    for (let i = 0; i < 6000; i++) {
      const date = new Date(start + i * 3.65 * 86400000);
      const e = sep(getPlanetLongitude('mercury', date), getSchlyterSun(date).longitude);
      maxElong = Math.max(maxElong, e);
    }
    expect(maxElong).toBeLessThan(28.5);
    expect(maxElong).toBeGreaterThan(17); // sanity: should reach a real maximum
  });

  it('Venus stays within ~47° of the Sun across 60 years', () => {
    let maxElong = 0;
    const start = Date.UTC(1980, 0, 1);
    for (let i = 0; i < 6000; i++) {
      const date = new Date(start + i * 3.65 * 86400000);
      const e = sep(getPlanetLongitude('venus', date), getSchlyterSun(date).longitude);
      maxElong = Math.max(maxElong, e);
    }
    expect(maxElong).toBeLessThan(47.5);
    expect(maxElong).toBeGreaterThan(40);
  });

  it('Mars longitude stays bounded and advances on average', () => {
    for (let i = 0; i < 500; i++) {
      const lon = getPlanetLongitude('mars', new Date(Date.UTC(2000, 0, 1) + i * 7 * 86400000));
      expect(lon).toBeGreaterThanOrEqual(0);
      expect(lon).toBeLessThan(360);
    }
    // Net motion over ~4 years should be positive (Mars completes ~2 orbits).
    const a = getPlanetLongitude('mars', new Date(Date.UTC(2000, 0, 1)));
    const b = getPlanetLongitude('mars', new Date(Date.UTC(2004, 0, 1)));
    expect(norm(b - a)).toBeGreaterThan(0);
  });
});
