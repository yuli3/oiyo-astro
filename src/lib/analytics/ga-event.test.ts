import { afterEach, describe, expect, it, vi } from 'vitest';
import { gaEvent } from './ga-event';
afterEach(() => vi.unstubAllGlobals());
describe('reincarnation analytics transport', () => {
 it('forwards categorical reroll and share parameters unchanged', () => {
  const gtag=vi.fn();vi.stubGlobal('window',{gtag});
  const completed={test_id:'reincarnation-country',mode:'country',draws:'3',roll_type:'reroll'};
  gaEvent('test_completed',completed);
  const shared={test_id:'reincarnation-country',share_surface:'link',share_outcome:'copied'};
  gaEvent('share_completed',shared);
  expect(gtag.mock.calls).toEqual([['event','test_completed',completed],['event','share_completed',shared]]);
 });
 it('does not throw when analytics is unavailable during SSR or blocking',()=>{
  vi.stubGlobal('window',undefined);expect(()=>gaEvent('test_completed')).not.toThrow();
  vi.stubGlobal('window',{});expect(()=>gaEvent('share_click')).not.toThrow();
 });
});
