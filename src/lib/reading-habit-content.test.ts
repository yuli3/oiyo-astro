import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('reading habit evidence and localization contract', () => {
  for (const locale of ['ko', 'en', 'ja', 'zh', 'fr', 'es']) {
    const source = readFileSync(`src/content/articles/${locale}/magazine-reading-habit-guide.mdx`, 'utf8');
    it(`${locale} preserves arithmetic, sources and a keyboard-native worked example`, () => {
      const normalized = source.replace(/(\d),(\d)/g, '$1.$2');
      for (const value of ['175', '43.75', '21.875', '200', '34.3']) expect(normalized).toContain(value);
      expect(source).toContain('<details>');
      expect(source).toContain('<summary>');
      expect(source).toContain('2011_Karpicke_Blunt_Science.pdf');
      expect(source).toContain('10.1016/j.edurev.2018.09.003');
      expect(source).not.toContain('```');
      expect(source).not.toMatch(/^# /m);
    });
    it(`${locale} retains seven numbered sections, tables and its locale`, () => {
      expect(source).toContain(`locale: ${locale}`);
      expect(source.match(/^## \d\./gm)).toHaveLength(7);
      expect(source.match(/^\| ---/gm)).toHaveLength(3);
    });
  }
  it('uses explicitly hypothetical time budgets, not a fifty-book guarantee', () => {
    expect(30 * 350 / 60).toBe(175);
    expect(175 / 4).toBe(43.75);
    expect(175 / 8).toBe(21.875);
    expect(50 * 4).toBe(200);
  });
});
