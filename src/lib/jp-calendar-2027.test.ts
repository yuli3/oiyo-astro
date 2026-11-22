import { describe, expect, it } from 'vitest';
import { dayKanshi, jpHolidays, rokuyo, tenshabi } from './jp-calendar-2027';

describe('jp-calendar-2027', () => {
  it('祝日と振替休日', () => {
    const hs = jpHolidays();
    const get = (n: string) => hs.filter((h) => h.name === n).map((h) => h.date);
    expect(get('成人の日')).toEqual(['2027-01-11']);
    expect(get('春分の日')).toEqual(['2027-03-21']);
    expect(get('秋分の日')).toEqual(['2027-09-23']);
    expect(get('海の日')).toEqual(['2027-07-19']);
    expect(get('敬老の日')).toEqual(['2027-09-20']);
    expect(get('スポーツの日')).toEqual(['2027-10-11']);
    // 春分の日(日) → 3/22 振替休日
    expect(get('振替休日')).toContain('2027-03-22');
    expect(hs.filter((h) => h.kind === 'holiday')).toHaveLength(16);
  });
  it('2026年の祝日(公表済み)とも一致', () => {
    const hs = jpHolidays(2026).map((h) => `${h.date} ${h.name}`);
    expect(hs).toContain('2026-03-20 春分の日');
    expect(hs).toContain('2026-09-22 国民の休日');
    expect(hs).toContain('2026-09-23 秋分の日');
    expect(hs).toContain('2026-05-06 振替休日');
  });
  it('六曜: 旧暦1月1日は先勝', () => {
    // 2027年の旧正月は2月7日
    expect(rokuyo('2027-02-07')).toBe('先勝');
    expect(rokuyo('2027-02-08')).toBe('友引');
  });
  it('干支と天赦日', () => {
    expect(dayKanshi('2000-01-07')).toBe('甲子');
    const t = tenshabi();
    expect(t.length).toBeGreaterThanOrEqual(5);
    expect(t.length).toBeLessThanOrEqual(7);
  });
});
