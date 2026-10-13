import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

// 2026-10-11: a faithful translation can still repeat a mixed-experiment claim.
// Guard the reviewed conditions; these checks do not certify native fluency.
describe('social proof: six-locale experiment boundaries', () => {
  for (const locale of ['ko', 'en', 'ja', 'zh', 'fr', 'es']) {
    const source = readFileSync(new URL(`../content/articles/${locale}/social-proof-influence.mdx`, import.meta.url), 'utf8');
    it(`${locale}: preserves experiment labels alongside each outcome`, () => {
      const rows = source.split('\n').filter(line => /^\| [12] \|/.test(line));
      expect(rows.map(row => row.replace(/,(\d)/g, '.$1').match(/^\| (\d) \|.*\| (\d+\.\d+)% \|$/)?.slice(1))).toEqual([
        ['1', '35.1'], ['1', '44.1'], ['2', '37.2'], ['2', '49.3'],
      ]);
    });
    it(`${locale}: retains both direct primary sources and the safety context`, () => {
      expect(source).toContain('https://www.influenceatwork.com/wp-content/uploads/2012/08/article08222012.pdf');
      expect(source).toContain('https://pdodds.w3.uvm.edu/files/papers/others/1955/asch1955a.pdf');
      expect(source).toContain('https://www.who.int/publications/i/item/9789240076846');
      expect(source).toContain('75%');
      expect(source).not.toContain('```');
    });
  }
});
