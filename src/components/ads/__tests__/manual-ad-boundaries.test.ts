import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('../ManualAds.astro', import.meta.url), 'utf8');
const template = source.split('set:html={`')[1].split('`} />')[0];
const code = new Function('payload', 'return `' + template + '`;')(JSON.stringify({ articleMidSlot: '7654190271' }));
function run(options: { long?: boolean; interactive?: boolean; near?: boolean; local?: boolean } = {}) {
  const prose = `<article class="prose">${options.interactive ? '<form><input /></form>' : ''}${Array.from({ length: 6 }, (_, i) => `<h2>Chapter ${i}</h2><p>${'Reading '.repeat(options.long === false ? 3 : 100)}</p>`).join('')}</article>`;
  const dom = new JSDOM(`<main id="main-content">${prose}</main><aside data-manual-ad="oiyo-result-below"><ins class="adsbygoogle" data-ad-slot="9017730065"></ins></aside>`, { url: options.local ? 'https://example.test' : 'https://oiyo.net/ko/article/', runScripts: 'outside-only' });
  const { window } = dom;
  Object.defineProperty(window.HTMLElement.prototype, 'getBoundingClientRect', { value() { return { top: this.tagName === 'H2' ? (options.near ? 200 : 1200) : 0, bottom: 3000 }; } });
  let notify: (entries: { isIntersecting: boolean; target: Element }[]) => void = () => {};
  const observed: Element[] = [];
  Object.defineProperty(window, 'IntersectionObserver', { value: class { constructor(cb: typeof notify) { notify = cb; } observe(el: Element) { observed.push(el); } unobserve() {} } });
  window.eval(code);
  return { dom, window, observed, enter() { notify(observed.map(target => ({ target, isIntersecting: true }))); } };
}

describe('manual reading ad boundaries', () => {
  it('adds one distinct mid unit for long static prose and requests each once', () => {
    const page = run();
    expect(page.observed).toHaveLength(2);
    expect(page.window.document.querySelector('[data-manual-ad="oiyo-article-mid"] ins')?.getAttribute('data-ad-slot')).toBe('7654190271');
    page.enter(); page.enter();
    expect((page.window as unknown as { adsbygoogle: unknown[] }).adsbygoogle).toHaveLength(2);
    page.dom.window.close();
  });
  it.each([{ long: false }, { interactive: true }, { near: true }])('keeps only the end unit for %j', opts => {
    const page = run(opts);
    expect(page.observed).toHaveLength(1);
    page.dom.window.close();
  });
  it('never requests ads on a foreign preview host', () => {
    const page = run({ local: true });
    expect(page.observed).toHaveLength(0);
    page.dom.window.close();
  });
  it('collapses an unfilled additional unit', async () => {
    const page = run();
    const mid = page.window.document.querySelector<HTMLElement>('[data-manual-ad="oiyo-article-mid"]')!;
    mid.querySelector('ins')!.setAttribute('data-ad-status', 'unfilled');
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(mid.hidden).toBe(true);
    page.dom.window.close();
  });
});
