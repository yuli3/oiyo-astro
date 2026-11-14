import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';

// 2026-10-12: run after build; the approved seam is HTML, not Astro source or snapshots.
// These literal units belong to the editorial N-shape example, not study data.
test('six-locale example charts expose every label, value and scale without hover', () => {
  for (const locale of ['ko', 'en', 'ja', 'zh', 'fr', 'es']) {
    const document = new JSDOM(readFileSync(`dist/${locale}/egogram-personality-guide/index.html`, 'utf8')).window.document;
    const chart = [...document.querySelectorAll('article figure')].find(figure => figure.querySelectorAll('meter').length === 5);
    assert.ok(chart, `${locale}: a labelled chart must be available in static HTML`);
    assert.ok(chart.querySelector('figcaption')?.textContent.trim(), `${locale}: chart title`);
    const meters = [...chart.querySelectorAll('meter')];
    const expected = [['CP', 8], ['NP', 5], ['A', 4], ['FC', 5], ['AC', 8]];
    for (const [index, [label, value]] of expected.entries()) {
      const meter = meters[index];
      assert.equal(meter.getAttribute('aria-label'), label, `${locale}: full label`);
      assert.equal(meter.min, 0, `${locale}: zero baseline`);
      assert.equal(meter.max, 8, `${locale}: example scale upper bound`);
      assert.equal(meter.value, value, `${locale}: example value`);
      const row = meter.parentElement;
      assert.match(row.textContent, new RegExp(`\\b${label}\\b`));
      assert.match(row.textContent, new RegExp(`\\b${value}\\b`));
      assert.equal(row.querySelector('[hidden], [aria-hidden="true"]')?.textContent.includes(String(value)) ?? false, false);
      assert.doesNotMatch(row.outerHTML, /(?:opacity-0|group-hover:|truncate)/, `${locale}: no hover-only values or clipped labels`);
    }
    assert.match(chart.textContent, /0\s*–\s*8/, `${locale}: the scale is also printed as text`);
  }
});
