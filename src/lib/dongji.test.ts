import { describe, expect, it } from 'vitest';
import { BRING_IN, DONGJI_YEARS, dongjiKind, makeDongjiCard, saealsimCount, SEND_AWAY } from './dongji';

describe('dongji', () => {
  it('classifies 애·중·노동지 by lunar day', () => {
    expect(dongjiKind(1)).toBe('ae');
    expect(dongjiKind(10)).toBe('ae');
    expect(dongjiKind(11)).toBe('jung');
    expect(dongjiKind(20)).toBe('jung');
    expect(dongjiKind(21)).toBe('no');
    expect(() => dongjiKind(0)).toThrow();
  });

  it('2025 was 애동지 and 2026 is 중동지 on 12-22', () => {
    const y2025 = DONGJI_YEARS.find((y) => y.year === 2025)!;
    const y2026 = DONGJI_YEARS.find((y) => y.year === 2026)!;
    expect(dongjiKind(y2025.lunarDay)).toBe('ae');
    expect(y2026.day).toBe(22);
    expect(dongjiKind(y2026.lunarDay)).toBe('jung');
  });

  it('weekdays match the Gregorian calendar', () => {
    const names = ['일', '월', '화', '수', '목', '금', '토'];
    for (const y of DONGJI_YEARS) expect(names[new Date(Date.UTC(y.year, 11, y.day)).getUTCDay()]).toBe(y.weekday);
  });

  it('counts 새알심 as 2027 세는 나이', () => {
    expect(saealsimCount(1990)).toBe(38);
    expect(saealsimCount(2026)).toBe(2);
    expect(() => saealsimCount(1800)).toThrow();
  });

  it('builds a card with 1-2 things to send away and one to bring in', () => {
    const card = makeDongjiCard(1995, ['worry', 'night', 'worry'], 'rest');
    expect(card.count).toBe(33);
    expect(card.send.map((s) => s.id)).toEqual(['worry', 'night']);
    expect(card.bring.label).toBe('쉼');
    expect(card.kind).toBe('jung');
    expect(() => makeDongjiCard(1995, [], 'rest')).toThrow();
    expect(() => makeDongjiCard(1995, ['worry', 'night', 'tired'], 'rest')).toThrow();
    expect(() => makeDongjiCard(1995, ['worry'], 'nope')).toThrow();
  });

  it('has unique ids', () => {
    expect(new Set(SEND_AWAY.map((c) => c.id)).size).toBe(SEND_AWAY.length);
    expect(new Set(BRING_IN.map((c) => c.id)).size).toBe(BRING_IN.length);
  });
});
