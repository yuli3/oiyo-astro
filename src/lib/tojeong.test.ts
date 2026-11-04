import solarlunar from 'solarlunar';
import { describe, expect, it } from 'vitest';

import { castTojeong, dayGanzhiOf, lunarMonthDays2027 } from './tojeong';

describe('tojeong 2027', () => {
  it('uses Korean lunar month lengths (solarlunar is the Chinese calendar)', () => {
    expect(Array.from({ length: 12 }, (_, i) => lunarMonthDays2027(i + 1))).toEqual([29, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30, 30]);
  });

  it('day stems/branches agree with solarlunar on solar dates', () => {
    for (const [y, m, d] of [[2027, 2, 6], [2027, 6, 14], [2027, 12, 31]] as const) {
      const ref = solarlunar.solar2lunar(y, m, d);
      if (ref === -1) throw new Error('ref');
      expect(dayGanzhiOf(y, m, d)).toBe(ref.gzDay);
    }
  });

  it('casts a three-digit code within range and shows its arithmetic', () => {
    const r = castTojeong({ year: 1990, month: 5, day: 15 });
    expect(r.age).toBe(38);
    expect(r.upper.sum).toBe(38 + 14);
    expect(r.upper.value).toBe(52 % 8 || 8);
    expect(r.monthGanzhi).toBe('丙午');
    expect(r.code).toMatch(/^[1-8][1-6][1-3]$/);
  });

  it('every input lands on one of 144 codes', () => {
    const seen = new Set<string>();
    for (let year = 1940; year <= 2020; year++) for (let month = 1; month <= 12; month++) for (const day of [1, 9, 17, 25, 30]) {
      seen.add(castTojeong({ year, month, day }).code);
    }
    expect(seen.size).toBeLessThanOrEqual(144);
    expect(seen.size).toBeGreaterThan(100);
  });

  it('clamps day 30 in a short 2027 month for the day pillar only', () => {
    const r = castTojeong({ year: 1985, month: 1, day: 30 });
    expect(r.dayClamped).toBe(true);
    expect(r.lower.parts[0].value).toBe(30);
  });
});
