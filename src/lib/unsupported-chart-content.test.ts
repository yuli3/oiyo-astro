import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('unsupported quantitative comparisons must not return', () => {
  for (const locale of ['ko', 'en', 'ja', 'zh', 'fr', 'es']) {
    it(`${locale}: RIASEC interests are not invented ability or satisfaction scores`, () => {
      const source = readFileSync(`src/content/articles/${locale}/riasec-career-complete-guide.mdx`, 'utf8');
      expect(source).not.toContain('<BarChart');
      expect(source).not.toContain('<RadarChart');
      expect(source).not.toContain('<StatCards');
      expect(source).not.toContain('140+');
      expect(source).not.toContain('40%+');
      expect(source).not.toContain('```');
      expect(source).toContain('https://www.onetcenter.org/IP.html');
      expect(source).toContain('R → I → A → S → E → C → R');
      for (const section of [3, 4, 5]) expect(source).toContain(`## ${section}.`);
    });
  }
  for (const locale of ['ko', 'en']) {
    it(`${locale}: attachment labels do not establish ability scores or treatment success rates`, () => {
      const source = readFileSync(`src/content/articles/${locale}/attachment-style-relationship-guide.mdx`, 'utf8');
      expect(source).not.toContain('<BarChart');
      expect(source).not.toContain('<RadarChart');
      expect(source).not.toContain('values: [90, 88, 85');
      expect(source).not.toContain('<StatCards');
      expect(source).not.toContain('value: 85');
      expect(source).toContain('https://www.nimh.nih.gov/health/topics/psychotherapies');
      expect(source).toContain('## 4.');
      expect(source).toContain('## 5.');
    });
  }
});
