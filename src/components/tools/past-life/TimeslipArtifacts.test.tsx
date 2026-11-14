// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect } from 'vitest';
import { TIMESLIP_CARD_ART, TIMESLIP_ART_NOTE } from '../../../data/timeslip-ui-art';
import { EPISODES } from '../../../lib/past-life-1426';
import JoseonPastLife from './JoseonPastLife';
import SillaGolpum from './SillaGolpum';
import { SaveCard } from './timeslip';
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const locales = ['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const;
for (const locale of locales) {
  describe(locale + ' artifact integration', () => {
    it('preserves Joseon rank, robe, tablet and share URL while replacing the SVG', () => {
      window.history.replaceState(null, '', '/?j=yeonguijeong&p=gyeonggi');
      const el = document.createElement('div'); const root = createRoot(el);
      act(() => root.render(createElement(JoseonPastLife, { locale })));
      expect(el.querySelector('img[src$="robes/joseon-red.webp"]')).not.toBeNull();
      expect(el.querySelector('img[src$="tablets/ivory.webp"]')).not.toBeNull();
      expect(el.querySelector('.timeslip-hopae-text')?.textContent).toContain('領議政');
      expect(el.textContent).toContain(TIMESLIP_ART_NOTE[locale]);
      expect(window.location.search).toBe('?j=yeonguijeong&p=gyeonggi');
      expect(el.querySelector('svg[viewBox="0 0 160 360"]')).toBeNull();
      act(() => root.unmount());
    });
    it('uses the correct Silla robe for each rank and commoner clothes for a commoner', () => {
      for (const [query, colour] of [['g=jingol&d=1','purple'],['g=jingol&d=7','crimson'],['g=jingol&d=10','blue'],['g=sa&d=17','yellow'],['g=pyeongmin&d=1','commoner']]) {
        window.history.replaceState(null, '', '/?' + query);
        const el = document.createElement('div'); const root = createRoot(el);
        act(() => root.render(createElement(SillaGolpum, { locale })));
        expect(el.querySelector('img[src*="robes/silla-"]')?.getAttribute('src') ?? null)
          .toBe(`/images/timeslip-ui-v2/robes/silla-${colour}.webp`);
        act(() => root.unmount());
      }
    });
    it('shows readable card text even if the decorative paper cannot load', () => {
      for (const testId of EPISODES) {
        const el = document.createElement('div'); const root = createRoot(el);
        act(() => root.render(createElement(SaveCard, { l: locale, testId, filename: 'test', spec: { kicker:'OIYO', title:'Result', badge:'Rare', lines:['Details'], footer:'oiyo.net', accent:'#000' } })));
        const image = el.querySelector('img');
        expect(image?.getAttribute('src')).toBe('/images/timeslip-ui-v2/' + TIMESLIP_CARD_ART[testId]);
        act(() => image?.dispatchEvent(new Event('error')));
        expect(el.querySelector('img')).toBeNull();
        expect(el.textContent).toContain('Result'); expect(el.textContent).toContain('Details');
        expect(el.querySelector('button')).not.toBeNull();
        act(() => root.unmount());
      }
    });
  });
}
