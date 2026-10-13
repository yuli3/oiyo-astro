import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

// WHY (2026-10-12): a future translation merge must retain the same uncertainty
// and source limits. These checks guard content structure, not astrological validity.
describe('rising guide six-locale retention', () => {
  for (const locale of ['ko', 'en', 'ja', 'zh', 'fr', 'es']) {
    it(`${locale}: preserves the complete optional prompt table and sources`, () => {
      const source = readFileSync(`src/content/articles/${locale}/zodiac-rising-sign-guide.mdx`, 'utf8');
      expect(source).toContain(`locale: ${locale}`);
      expect(source).toContain('2026-10-12');
      expect(source).toContain('https://www.astro.com/swisseph-download/doc/swephprg.pdf');
      expect(source).toContain('https://spaceplace.nasa.gov/starfinder/en/');
      expect(source).toContain('08:45');
      expect(source).toContain('09:15');
      expect(source).toContain('UTC');
      expect(source).toContain('OIYO');
      expect(source.match(/^\|/gm)).toHaveLength(19);
      expect(source.match(/<details>/g)).toHaveLength(1);
      expect(source.match(/<summary>/g)).toHaveLength(1);
      expect(source).not.toContain('```');
      expect(source).not.toContain('https://astro.com)');
    });
  }
});
