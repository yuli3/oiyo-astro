import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const slugs = ['sunk-cost-fallacy-investment','loss-aversion-choice-and-memory','looking-in-the-wrong-place-biases'];
for (const locale of ['ko','en','ja','zh','fr','es']) {
  for (const slug of slugs) {
    test(`${locale}/${slug}: readable static comparison, direct sources and locale`, () => {
      const html = readFileSync(new URL(`../dist/${locale}/${slug}/index.html`, import.meta.url), 'utf8');
      const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? '';
      assert.match(main, /data-bias-reading-guide/);
      assert.match(main, /<figcaption/);
      assert.match(main, /<dl/);
      assert.match(main, /<dt/);
      assert.match(main, /<dd/);
      assert.match(main, /href="https:\/\/doi.org\//);
      assert.doesNotMatch(main, /<pre\b/);
      assert.ok(html.includes(`https://oiyo.net/${locale}/${slug}/`));
      assert.equal((main.match(/<h1\b/g) ?? []).length, 1);
      const guide = main.match(/<figure[^>]+data-bias-reading-guide[\s\S]*?<\/figure>/)?.[0] ?? '';
      if (locale !== 'ko') assert.doesNotMatch(guide, /[가-힣]/);
      if (slug.startsWith('sunk')) {
        for (const value of ['90 − 60 = 30','20 − 5 = 15']) assert.ok(main.includes(value));
      }
      if (slug.startsWith('loss')) {
        assert.match(main, /https:\/\/scheibehenne.de\/ScheibehenneGreifenederTodd2010.pdf/);
        assert.match(main, /10.1086\/261737/);
      }
      if (slug.startsWith('looking')) assert.match(main, /10.1177\/0022427815576576/);
    });
  }
}
