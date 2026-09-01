import { describe, expect, it } from 'vitest';

import { LOCALES } from '../../../i18n';
import { JOURNEY_IDS, journeyNavigation } from './navigation';

describe('journeyNavigation', () => {
  it.each(LOCALES)('keeps the %s locale in the full-map return link', (locale) => {
    for (const journeyId of JOURNEY_IDS) {
      const navigation = journeyNavigation(locale, journeyId);
      expect(navigation.mapHref).toBe(`/${locale}/ontology/`);
      expect(navigation.mapLabel.trim()).not.toBe('');
      expect(navigation.zoneLabel.trim()).not.toBe('');
    }
  });

  it('gives every journey a distinct Korean zone label', () => {
    const labels = JOURNEY_IDS.map((journeyId) => journeyNavigation('ko', journeyId).zoneLabel);
    expect(new Set(labels).size).toBe(JOURNEY_IDS.length);
  });
});
