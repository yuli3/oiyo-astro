import { describe, expect, it } from 'vitest';
import { BUREOM, DAEBOREUM_DATE, DAEBOREUM_YEAR, makeDaeboreumCard, MOON_WISHES } from './daeboreum';

describe('daeboreum', () => {
  it('2027 정월대보름 is Sunday 21 February', () => {
    const d = new Date(Date.UTC(DAEBOREUM_YEAR, DAEBOREUM_DATE.month - 1, DAEBOREUM_DATE.day));
    expect(d.getUTCDay()).toBe(0);
    expect(DAEBOREUM_DATE.weekday).toBe('일');
  });

  it('makes a card from one nut and one wish', () => {
    const c = makeDaeboreumCard('walnut', 'health');
    expect(c.bureom.label).toBe('호두');
    expect(c.wish.label).toBe('건강');
    expect(() => makeDaeboreumCard('x', 'health')).toThrow();
    expect(() => makeDaeboreumCard('walnut', 'x')).toThrow();
  });

  it('has unique ids', () => {
    expect(new Set(BUREOM.map((b) => b.id)).size).toBe(BUREOM.length);
    expect(new Set(MOON_WISHES.map((w) => w.id)).size).toBe(MOON_WISHES.length);
  });
});
