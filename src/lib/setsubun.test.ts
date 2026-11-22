import { describe, expect, it } from 'vitest';
import { beanCount, ehouFor, makeSetsubunCard, ONI, SETSUBUN_DATE, SETSUBUN_YEAR } from './setsubun';

describe('setsubun', () => {
  it('恵方 by year stem (known years)', () => {
    expect(ehouFor(2024).name).toBe('東北東'); // 甲辰
    expect(ehouFor(2025).name).toBe('西南西'); // 乙巳
    expect(ehouFor(2026).name).toBe('南南東'); // 丙午
    expect(ehouFor(2027)).toMatchObject({ name: '北北西', stem: '丁', degree: 345 });
    expect(ehouFor(2028).name).toBe('南南東'); // 戊申
  });

  it('2027 節分 is Wednesday 3 February', () => {
    expect(new Date(Date.UTC(SETSUBUN_YEAR, 1, SETSUBUN_DATE.day)).getUTCDay()).toBe(3);
  });

  it('beans = age on 節分 + 1', () => {
    expect(beanCount(1990, 1, 1)).toBe(38);
    expect(beanCount(1990, 2, 3)).toBe(38);
    expect(beanCount(1990, 2, 4)).toBe(37);
    expect(beanCount(2027, 1, 1)).toBe(1);
    expect(() => beanCount(1800, 1, 1)).toThrow();
  });

  it('makes a card', () => {
    const c = makeSetsubunCard('green', 2000, 6, 1);
    expect(c.oni.label).toBe('緑鬼');
    expect(c.beans).toBe(27);
    expect(c.ehou.name).toBe('北北西');
    expect(() => makeSetsubunCard('x', 2000, 6, 1)).toThrow();
    expect(new Set(ONI.map((o) => o.id)).size).toBe(ONI.length);
  });
});
