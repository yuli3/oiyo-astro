import { describe, expect, it } from 'vitest';

import { newYearProfile, relationTo2027 } from './new-year-2027';

describe('newYearProfile', () => {
  it('uses the lunar new year for the animal', () => {
    // 1991-02-14 is before 1991 lunar new year (02-15): still a horse (1990).
    expect(newYearProfile(1991, 2, 14)).toMatchObject({ animal: 6, beforeLunarNewYear: true });
    expect(newYearProfile(1991, 2, 16)).toMatchObject({ animal: 7, beforeLunarNewYear: false });
  });

  it('gives sun sign and 2027 personal year', () => {
    const p = newYearProfile(1990, 5, 17);
    expect(p.sign).toBe(1); // Taurus
    // 5 + 8 + (2+0+2+7=11→2) = 15 → 6
    expect(p.personalYear).toBe(6);
  });

  it('rejects impossible dates', () => {
    expect(() => newYearProfile(2001, 2, 30)).toThrow();
  });

  it('maps the traditional goat-year relations', () => {
    expect(relationTo2027(7)).toBe('same');
    expect(relationTo2027(1)).toBe('clash');
    expect(relationTo2027(0)).toBe('harm');
    expect(relationTo2027(10)).toBe('punish');
    expect(relationTo2027(6)).toBe('harmony');
    expect(relationTo2027(2)).toBe('none');
  });
});
