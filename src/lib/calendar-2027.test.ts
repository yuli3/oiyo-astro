import { describe, expect, it } from 'vitest';
import { fromLunar, holidays, longWeekends, monthGrid, solarTerms, toLunar } from './calendar-2027';

describe('calendar-2027', () => {
  it('lunar dates match the KASI-published 2027 holidays', () => {
    expect(fromLunar(1, 1)).toBe('2027-02-07'); // 설날
    expect(fromLunar(4, 8)).toBe('2027-05-13'); // 부처님오신날
    expect(fromLunar(8, 15)).toBe('2027-09-15'); // 추석
    expect(fromLunar(1, 15)).toBe('2027-02-21'); // 정월대보름
    expect(toLunar('2027-01-01')).toEqual({ month: 11, day: 24, leap: false });
    expect(toLunar('2027-12-22')).toEqual({ month: 11, day: 25, leap: false }); // 동지
  });

  it('has 24 solar terms with known dates', () => {
    const t = solarTerms();
    expect(t).toHaveLength(24);
    expect(t.find((x) => x.name === '입춘')!.date).toBe('2027-02-04');
    expect(t.find((x) => x.name === '동지')!.date).toBe('2027-12-22');
    expect(t.find((x) => x.name === '춘분')!.date).toBe('2027-03-21');
  });

  it('holidays incl. substitutes match tools-oiyo kr-calendar 2027 fixture', () => {
    const subs = holidays().filter((h) => h.substitute).map((h) => `${h.date} ${h.name}`);
    expect(subs).toEqual([
      '2027-02-09 설날 대체공휴일',
      '2027-07-19 제헌절 대체공휴일',
      '2027-08-16 광복절 대체공휴일',
      '2027-10-04 개천절 대체공휴일',
      '2027-10-11 한글날 대체공휴일',
      '2027-12-27 기독탄신일 대체공휴일',
    ]);
    const all = holidays().map((h) => h.date);
    for (const d of ['2027-01-01', '2027-02-06', '2027-02-07', '2027-02-08', '2027-03-01', '2027-05-01', '2027-05-05', '2027-05-13', '2027-06-06', '2027-09-14', '2027-09-15', '2027-09-16'])
      expect(all).toContain(d);
  });

  it('finds the long weekends', () => {
    const lw = longWeekends();
    const seol = lw.find((s) => s.names.includes('설날'))!;
    expect(seol).toMatchObject({ start: '2027-02-06', end: '2027-02-09', days: 4 });
    expect(lw.find((s) => s.start === '2027-10-09')!.days).toBe(3);
  });

  it('builds month grids starting on the right weekday', () => {
    const jan = monthGrid(1);
    expect(jan.slice(0, 5).every((c) => c === null)).toBe(true); // 1/1 금요일
    expect(jan[5]!.holiday).toBe('신정');
    expect(jan.length % 7).toBe(0);
  });
});
