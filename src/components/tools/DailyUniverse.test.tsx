import { afterEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { JSDOM } from 'jsdom';
import DailyUniverse from './DailyUniverse';
import type { Locale } from '../../i18n';
import golden from '../../lib/ontology/saju/solar-terms-kasi.json';

function renderedSunSign(instant: string) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(instant));
  const html = renderToStaticMarkup(createElement(DailyUniverse, { locale: 'ko' }));
  const dom = new JSDOM(html);
  const value = dom.window.document.querySelector('div.font-semibold.text-amber-100')?.textContent;
  dom.window.close();
  return value;
}

afterEach(() => vi.useRealTimers());

describe('DailyUniverse solar sign shown on the real rendered card', () => {
  it.each([
    ['2026-01-15T12:00:00Z', '염소자리'],
    ['2026-02-15T12:00:00Z', '물병자리'],
    ['2026-03-15T12:00:00Z', '물고기자리'],
    ['2026-04-15T12:00:00Z', '양자리'],
    ['2026-05-15T12:00:00Z', '황소자리'],
    ['2026-06-15T12:00:00Z', '쌍둥이자리'],
    ['2026-07-15T12:00:00Z', '게자리'],
    ['2026-08-15T12:00:00Z', '사자자리'],
    ['2026-09-15T12:00:00Z', '처녀자리'],
    ['2026-10-15T12:00:00Z', '천칭자리'],
    ['2026-11-15T12:00:00Z', '전갈자리'],
    ['2026-12-15T12:00:00Z', '사수자리'],
  ])('%s displays %s, not the last matching calendar row', (instant, expected) => {
    expect(renderedSunSign(instant)).toBe(expected);
  });
});

const entries: Record<string, [string, string]> = {
  춘분: ['물고기자리', '양자리'], 곡우: ['양자리', '황소자리'],
  소만: ['황소자리', '쌍둥이자리'], 하지: ['쌍둥이자리', '게자리'],
  대서: ['게자리', '사자자리'], 처서: ['사자자리', '처녀자리'],
  추분: ['처녀자리', '천칭자리'], 상강: ['천칭자리', '전갈자리'],
  소설: ['전갈자리', '사수자리'], 동지: ['사수자리', '염소자리'],
  대한: ['염소자리', '물병자리'], 우수: ['물병자리', '물고기자리'],
};
// KASI minute-resolution observations are independent of the shared calculation.
// A 60-minute margin tests sign transitions without pretending to second accuracy.
describe('KASI reference crossings on the rendered card', () => {
  for (const term of golden.terms.filter((term) => entries[term.name])) {
    it(`${term.date} ${term.name}: changes across the observed ingress`, () => {
      const instant = new Date(`${term.date}T${term.kst}:00+09:00`).getTime();
      const [before, after] = entries[term.name];
      expect(renderedSunSign(new Date(instant - 3600000).toISOString())).toBe(before);
      expect(renderedSunSign(new Date(instant + 3600000).toISOString())).toBe(after);
    });
  }
  it('uses the same instant regardless of the input offset', () => {
    expect(renderedSunSign('2026-03-20T12:00:00Z')).toBe(renderedSunSign('2026-03-20T21:00:00+09:00'));
  });
});

describe('localized method disclosure and calendar edges', () => {
  it.each(['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const)('%s includes the method and source on the card', (locale: Locale) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-05T12:00:00Z'));
    const dom = new JSDOM(renderToStaticMarkup(createElement(DailyUniverse, { locale })));
    const note = dom.window.document.querySelector('[data-sun-method="tropical-approximate"]');
    expect(note?.textContent?.length).toBeGreaterThan(40);
    expect(note?.querySelector('a')?.href).toBe('https://aa.usno.navy.mil/faq/asa_glossary');
    dom.window.close();
  });
  it.each([
    ['2025-12-31T23:59:00Z', '염소자리'],
    ['2026-01-01T00:01:00Z', '염소자리'],
    ['2024-02-29T12:00:00Z', '물고기자리'],
  ])('handles %s', (instant, expected) => expect(renderedSunSign(instant)).toBe(expected));
});
