import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const article = (locale: string, slug: string) => readFileSync(new URL(`../content/articles/${locale}/${slug}.mdx`, import.meta.url), 'utf8');

// 2026-10-11: merging newer translations must not discard previously reviewed
// study boundaries. These are retention guards, not proof of scientific validity.
describe('deadline article reconciliation', () => {
  for (const locale of ['ko', 'en', 'ja', 'zh', 'fr', 'es']) {
    it(`${locale}: retains the study-specific explanation and direct sources`, () => {
      const source = article(locale, 'dday-goal-setting-guide');
      for (const value of ['96', '12', '95%', '254', '94']) expect(source).toContain(value);
      expect(source).toMatch(/d\s*=\s*0[.,]65/);
      for (const reference of ['Ariely---Wertenbroch-2002.pdf', '10.1509/jmkr.43.1.39', '10.1016/S0065-2601(06)38002-1', '10.1002/ejsp.674']) expect(source).toContain(reference);
    });
    it(`${locale}: does not offer a nonexistent D-day tool or an empty sixth section`, () => {
      const source = article(locale, 'dday-goal-setting-guide');
      expect(source).not.toContain('<ToolCTA tool="dday"');
      expect(source).not.toMatch(/^## 6\./m);
      expect(source).not.toContain('```');
    });
  }
});

describe('French and Spanish ten-gods reconciliation', () => {
  for (const locale of ['fr', 'es']) it(`${locale}: retains all ten categories and the reference example`, () => {
    const source = article(locale, 'saju-ten-gods-psychology');
    for (const name of ['比肩', '劫財', '食神', '傷官', '偏財', '正財', '偏官', '正官', '偏印', '正印', '甲', '壬', '癸']) expect(source).toContain(name);
    expect(source).toMatch(/^## 7\./m);
    expect(source).not.toContain('```');
  });
});
