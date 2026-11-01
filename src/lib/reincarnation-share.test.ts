import { describe, expect, it } from 'vitest';
import { deliverReincarnationShare } from './reincarnation-share';
const payload = { title: 'draw', text: 'result', url: 'https://oiyo.net/ko/reincarnation-country/' };
describe('reincarnation share delivery', () => {
  it('does not copy after dismissal', async () => {
    let copies = 0;
    const result = await deliverReincarnationShare(payload, { share: async () => { throw new DOMException('dismissed', 'AbortError'); }, copy: async () => { copies++; } });
    expect(result).toBe('cancelled'); expect(copies).toBe(0);
  });
  it('reports native success and failure truthfully', async () => {
    expect(await deliverReincarnationShare(payload, { share: async () => {}, copy: async () => {} })).toBe('shared');
    expect(await deliverReincarnationShare(payload, { share: async () => { throw Error('denied'); }, copy: async () => {} })).toBe('failed');
  });
  it('uses clipboard only without native sharing and handles denial', async () => {
    let copied = '';
    expect(await deliverReincarnationShare(payload, { copy: async text => { copied = text; } })).toBe('copied');
    expect(copied).toBe('result\n' + payload.url);
    expect(await deliverReincarnationShare(payload, { copy: async () => { throw Error('denied'); } })).toBe('failed');
  });
});
