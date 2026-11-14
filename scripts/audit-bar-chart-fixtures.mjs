import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

// Exercise the real compiler and public HTML contract, not a duplicated renderer.
const fixtureRoot = resolve('scripts/fixtures/bar-chart');
const output = resolve('.tmp/bar-chart-fixtures');
const require = createRequire(import.meta.url);
const astroCli = resolve(dirname(require.resolve('astro/package.json')), require('astro/package.json').bin.astro);
function build(outDir, invalidCase) {
  return spawnSync(process.execPath, [astroCli, 'build', '--root', fixtureRoot, '--outDir', outDir], {
    encoding: 'utf8',
    env: { ...process.env, OIYO_BAR_CHART_INVALID: invalidCase ?? '' },
  });
}
const valid = build(output);
assert.equal(valid.status, 0, valid.stdout + valid.stderr);
const document = new JSDOM(readFileSync(resolve(output, 'index.html'), 'utf8')).window.document;
const meters = [...document.querySelectorAll('#long-labels meter')];
assert.deepEqual(meters.map(m => m.getAttribute('aria-label')), [
  '긴 한국어 라벨도 생략하지 않고 모두 읽을 수 있어야 해요',
  'A full descriptive label must remain readable without hovering',
  '長い日本語のラベルも省略せずにすべて読めることを確認します',
  '较长的中文标签也应完整显示，不依赖悬停或省略号',
  'Une longue description reste entièrement lisible sans survol',
  'Una descripción larga sigue siendo legible sin pasar el cursor',
  'AnUnbrokenLabelThatMustWrapRatherThanOverflowTheNarrowMobileViewport',
]);
for (const meter of meters) {
  assert.equal(meter.value, 2.5);
  assert.equal(meter.min, 0);
  assert.equal(meter.max, 10);
  assert.ok(meter.parentElement.textContent.includes(meter.getAttribute('aria-label')));
  assert.doesNotMatch(meter.parentElement.outerHTML, /truncate|opacity-0|group-hover:/);
}
assert.match(document.querySelector('#long-labels').textContent, /0\s*–\s*10/);
assert.deepEqual([...document.querySelectorAll('#zero meter')].map(m => [m.value, m.min, m.max]), [[0,0,1],[0,0,1]]);
assert.equal(document.querySelectorAll('#empty figure, #empty meter').length, 0);
for (const invalidCase of ['negative', 'nan', 'above-max']) {
  const invalid = build(resolve(`.tmp/bar-chart-invalid-${invalidCase}`), invalidCase);
  assert.notEqual(invalid.status, 0, `${invalidCase}: invalid quantities must fail the build`);
  assert.match(invalid.stdout + invalid.stderr, /BarChart requires finite|BarChart max must be positive/);
}
console.log('Bar chart fixtures PASS: seven long labels, fractions, zero, empty, three invalid builds');
