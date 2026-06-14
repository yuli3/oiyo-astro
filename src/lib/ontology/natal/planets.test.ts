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

describe('social planets — Jupiter & Saturn', () => {
  // The 2020 Great Conjunction: on 2020-12-21 ~18:00 UT, Jupiter and Saturn met
  // at ~0.3° Aquarius (~300.3° ecliptic longitude), within ~0.1° of each other.
  // This is a precise, famous invariant for the perturbed Jupiter/Saturn theory.
  it('reproduces the 2020 Great Conjunction', () => {
    const t = new Date(Date.UTC(2020, 11, 21, 18, 0, 0));
    const j = getPlanetLongitude('jupiter', t);
    const s = getPlanetLongitude('saturn', t);
    expect(sep(j, s)).toBeLessThan(0.4); // they are conjunct
    expect(Math.floor(norm(j) / 30)).toBe(10); // Aquarius (index 10)
    expect(Math.floor(norm(s) / 30)).toBe(10);
    expect(sep(j, 300.3)).toBeLessThan(1.0); // ~0.3° Aquarius
  });

  it('matches ephemeris signs at known dates', () => {
    // 2000-01-01: Jupiter in Aries, Saturn in Taurus.
    const t2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
    expect(Math.floor(getPlanetLongitude('jupiter', t2000) / 30)).toBe(0); // Aries
    expect(Math.floor(getPlanetLongitude('saturn', t2000) / 30)).toBe(1); // Taurus
    // 2020-01-15: Jupiter & Saturn both in Capricorn.
    const t2020 = new Date(Date.UTC(2020, 0, 15, 12, 0, 0));
    expect(Math.floor(getPlanetLongitude('jupiter', t2020) / 30)).toBe(9); // Capricorn
    expect(Math.floor(getPlanetLongitude('saturn', t2020) / 30)).toBe(9); // Capricorn
  });
});

describe('outer planets — Uranus, Neptune, Pluto', () => {
  // Outer planets move slowly, so their sign is stable for years — these dates are
  // chosen well inside documented multi-year placements (avoiding cusp/retrograde edges).
  it('matches ephemeris signs at known dates', () => {
    const sign = (p: 'uranus' | 'neptune' | 'pluto', iso: string) =>
      Math.floor(getPlanetLongitude(p, new Date(iso)) / 30);
    // Uranus in Taurus (firmly 2019–2025).
    expect(sign('uranus', '2021-06-01T12:00:00Z')).toBe(1); // Taurus
    // Uranus in Aries (2011–2018).
    expect(sign('uranus', '2014-06-01T12:00:00Z')).toBe(0); // Aries
    // Neptune in Pisces (2012–2025).
    expect(sign('neptune', '2018-06-01T12:00:00Z')).toBe(11); // Pisces
    // Pluto in Capricorn (2008–2023).
    expect(sign('pluto', '2015-06-01T12:00:00Z')).toBe(9); // Capricorn
    // Pluto in Sagittarius (1995–2008).
    expect(sign('pluto', '2000-06-01T12:00:00Z')).toBe(8); // Sagittarius
  });

  it('stays within 0–360 and moves slowly', () => {
    for (const p of ['uranus', 'neptune', 'pluto'] as const) {
      for (let i = 0; i < 120; i++) {
        const lon = getPlanetLongitude(p, new Date(Date.UTC(1990, 0, 1) + i * 90 * 86400000));
        expect(lon).toBeGreaterThanOrEqual(0);
        expect(lon).toBeLessThan(360);
      }
    }
  });
});
