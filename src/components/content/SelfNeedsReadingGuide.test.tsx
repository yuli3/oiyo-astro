import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SelfNeedsReadingGuide } from './SelfNeedsReadingGuide';

describe('self-concept reading guide', () => {
  for (const locale of ['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const) {
    it(`keeps the example, five unscored needs and source statically visible in ${locale}`, () => {
      const html = renderToStaticMarkup(<SelfNeedsReadingGuide locale={locale} />);
      expect(html).toContain(`data-self-needs-guide="${locale}"`);
      expect(html.match(/<figure/g)).toHaveLength(2);
      expect(html.match(/<li /g)).toHaveLength(8);
      expect(html).toContain('https://psychclassics.yorku.ca/Maslow/motivation.htm');
      expect(html).not.toMatch(/<input|<button|<canvas|<script|\*\*/);
      expect(html).not.toContain('undefined');
    });
    it(`uses the guide without hydration in the existing ${locale} article`, () => {
      const mdx = readFileSync(new URL(`../../content/articles/${locale}/self-concept-and-human-needs.mdx`, import.meta.url), 'utf8');
      expect(mdx).toContain(`<SelfNeedsReadingGuide locale="${locale}" />`);
      expect(mdx).not.toMatch(/SelfNeedsReadingGuide[^>]+client:/);
      expect(mdx).toContain(`/${locale}/self-concept-clarity-test/`);
    });
  }
});
