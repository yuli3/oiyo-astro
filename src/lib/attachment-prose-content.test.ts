import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('attachment prose distinguishes explanation from diagnosis', () => {
  for (const locale of ['ko', 'en', 'ja', 'zh', 'fr', 'es']) {
    const source = readFileSync(`src/content/articles/${locale}/attachment-style-relationship-guide.mdx`, 'utf8');
    it(`${locale} retains dimensional sources and a non-diagnostic observation exercise`, () => {
      expect(source).toContain('~rcfraley/attachment.htm');
      expect(source).toContain('~rcfraley/measures/measures.html');
      expect(source).toContain('<details>');
      expect(source).toContain('<summary>');
      expect(source).toContain('<ToolCTA tool="attachment-style"');
      expect(source).toContain(`locale="${locale}"`);
      expect(source).toContain('https://www.nimh.nih.gov/health/topics/psychotherapies');
      expect(source.match(/^## [1-8]\./gm)).toHaveLength(8);
      expect(source.match(/^\| ---/gm)).toHaveLength(4);
    });
    it(`${locale} does not restore unsupported brain, compatibility or workplace claims`, () => {
      for (const phrase of ['amygdala', '편도체', 'most amenable', 'Consistent high performance', 'natural leadership', 'High potential, high turnover', 'the healthiest, most stable', '생후 2년간']) {
        expect(source).not.toContain(phrase);
      }
      expect(source).not.toContain('```');
      expect(source).not.toContain('<RadarChart');
      expect(source).not.toContain('<BarChart');
    });
  }
});
