import { describe, it, expect } from 'vitest';
import { periodKey, animalOf, signOf, elementOf, FIVE_ELEMENTS, reading, type Period } from './periodic';

describe('periodic fortune — deterministic seeds', () => {
  it('periodKey is stable within a period and changes across periods', () => {
    const a = new Date(Date.UTC(2026, 6, 1)); // Wed 2026-07-01
    const b = new Date(Date.UTC(2026, 6, 2)); // Thu 2026-07-02 (same ISO week)
    const c = new Date(Date.UTC(2026, 6, 8)); // next week
    expect(periodKey('weekly', a)).toBe(periodKey('weekly', b));
    expect(periodKey('weekly', a)).not.toBe(periodKey('weekly', c));
    expect(periodKey('monthly', a)).toBe('2026-M7');
    expect(periodKey('today', a)).toBe('2026-7-1');
  });

  it('animalOf / signOf / elementOf map to valid indices', () => {
    expect(animalOf(2020)).toBe(0); // 2020 = Rat (index 0)
    expect(animalOf(2021)).toBe(1); // Ox
    expect(signOf(3, 25)).toBe(0);  // Aries
    expect(signOf(1, 5)).toBe(9);   // Capricorn (before Jan 20 cut)
    expect(FIVE_ELEMENTS[elementOf(2020)]).toBeDefined();
    for (let y = 1980; y <= 2030; y++) {
      expect(elementOf(y)).toBeGreaterThanOrEqual(0);
      expect(elementOf(y)).toBeLessThan(5);
      expect(animalOf(y)).toBeGreaterThanOrEqual(0);
      expect(animalOf(y)).toBeLessThan(12);
    }
  });

  it('reading is deterministic for identical inputs and localized', () => {
    const d = new Date(Date.UTC(2026, 6, 1));
    const periods: Period[] = ['today', 'weekly', 'monthly'];
    for (const p of periods) {
      const r1 = reading(0, p, 'saju-1990', 'ko', d);
      const r2 = reading(0, p, 'saju-1990', 'ko', d);
      expect(r1).toEqual(r2); // same seed → same reading
      expect(r1.opening).toBeTruthy();
      expect(r1.focus).toBeTruthy();
      expect(r1.advice).toBeTruthy();
      // locale switch changes the string, not the selection
      const en = reading(0, p, 'saju-1990', 'en', d);
      expect(en.opening).not.toBe(r1.opening);
    }
  });
});
