import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('experiment comparison reading contract', () => {
  it('keeps fixed denominators, keyboard-native disclosure and visible numbers without JavaScript', () => {
    const source = readFileSync('src/components/mdx/ExperimentComparison.astro', 'utf8');
    expect(source).toContain('<details');
    expect(source).toContain('<summary');
    expect(source).toContain('min="0" max="100"');
    expect(source).toContain('experiment.outcome - experiment.baseline');
    expect(source).not.toContain('<script');
  });
  for (const locale of ['ko', 'en', 'ja', 'zh', 'fr', 'es']) {
    it(`${locale} keeps the two experiments separate and the source table available`, () => {
      const source = readFileSync(`src/content/articles/${locale}/social-proof-influence.mdx`, 'utf8');
      expect(source).toContain('<ExperimentComparison');
      expect(source).toContain('baseline: 35.1, outcome: 44.1');
      expect(source).toContain('baseline: 37.2, outcome: 49.3');
      expect(source).toContain('article08222012.pdf');
    });
  }
});
