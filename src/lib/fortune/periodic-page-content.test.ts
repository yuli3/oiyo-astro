import { describe, expect, it } from 'vitest';
import { getPeriodicPageCopy, periodDateLabel } from './periodic-page-content';

describe('periodic page date label', () => {
  const oct = new Date('2026-10-06T03:00:00Z');

  it('names the month in each language and nothing for today or weekly', () => {
    expect(periodDateLabel('monthly', 'ja', oct)).toBe('2026年10月');
    expect(periodDateLabel('monthly', 'ko', oct)).toBe('2026년 10월');
    expect(periodDateLabel('monthly', 'en', oct)).toBe('October 2026');
    expect(periodDateLabel('monthly', 'es', oct)).toBe('octubre de 2026');
    expect(periodDateLabel('yearly', 'zh', oct)).toBe('2026年');
    expect(periodDateLabel('today', 'ko', oct)).toBe('');
    expect(periodDateLabel('weekly', 'en', oct)).toBe('');
  });

  it('turns the month over on Korean time', () => {
    expect(periodDateLabel('monthly', 'ko', new Date('2026-10-31T14:59:00Z'))).toBe('2026년 10월');
    expect(periodDateLabel('monthly', 'ko', new Date('2026-10-31T15:00:00Z'))).toBe('2026년 11월');
    expect(periodDateLabel('yearly', 'en', new Date('2026-12-31T15:00:00Z'))).toBe('2027');
  });

  it('puts the date in the title and heading of monthly and yearly pages only', () => {
    expect(getPeriodicPageCopy('zodiac', 'monthly', 'ja', oct).title.startsWith('2026年10月 ')).toBe(true);
    expect(getPeriodicPageCopy('zodiac', 'monthly', 'ja', oct).h1.startsWith('2026年10月 ')).toBe(true);
    expect(getPeriodicPageCopy('saju', 'yearly', 'ko', oct).title.startsWith('2026년 ')).toBe(true);
    expect(getPeriodicPageCopy('zodiac', 'monthly', 'fr', oct).h1.endsWith('(octobre 2026)')).toBe(true);
    expect(getPeriodicPageCopy('zodiac', 'today', 'ja', oct).title).not.toMatch(/2026/);
    expect(getPeriodicPageCopy('zodiac', 'weekly', 'en', oct).h1).not.toMatch(/2026/);
  });
});
