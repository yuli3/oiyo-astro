import { describe, expect, it } from 'vitest';
import type { Locale } from '../../i18n';
import { BURNOUT_GUIDE_SLUG, BURNOUT_WHO_SOURCE, burnoutTopicReading } from './burnout-topic';

const locales: Locale[] = ['ko', 'en', 'ja', 'zh', 'fr', 'es'];

describe('burnout topic reading navigation', () => {
  it.each(locales)('provides complete localized guidance only with an available guide: %s', (locale) => {
    const reading = burnoutTopicReading('burnout', locale, [BURNOUT_GUIDE_SLUG]);
    expect(reading).toBeDefined();
    expect(Object.values(reading!)).toHaveLength(12);
    for (const value of Object.values(reading!)) {
      expect(value.trim()).not.toBe('');
      if (locale !== 'ko') expect(value).not.toMatch(/[가-힣]/);
    }
    expect(reading!.personalBody).not.toBe(reading!.workBody);
  });

  it.each(locales)('does not manufacture a missing localized guide: %s', (locale) => {
    expect(burnoutTopicReading('burnout', locale, ['magazine-burnout-psychology'])).toBeUndefined();
    expect(burnoutTopicReading('burnout', locale, [])).toBeUndefined();
  });

  it('returns no burnout guidance for another topic', () => {
    expect(burnoutTopicReading('work', 'ko', [BURNOUT_GUIDE_SLUG])).toBeUndefined();
    expect(BURNOUT_WHO_SOURCE).toBe('https://www.who.int/news-room/fact-sheets/detail/mental-health-at-work');
  });
});
