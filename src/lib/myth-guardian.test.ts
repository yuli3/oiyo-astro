import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { castGuardian, GUARDIAN_IDS, mythNameFromTitle } from './myth-guardian';

describe('myth guardian', () => {
  it('every guardian has a dictionary article in all six locales', () => {
    for (const locale of ['ko', 'en', 'ja', 'zh', 'fr', 'es']) {
      const files = new Set(readdirSync(`src/content/articles/${locale}`));
      for (const id of GUARDIAN_IDS) expect(files.has(`meaning-of-myth-${id}.mdx`), `${locale}/${id}`).toBe(true);
    }
    expect(new Set(GUARDIAN_IDS).size).toBe(20);
  });

  it('picks the most chosen archetype and the last answer as the pantheon', () => {
    expect(castGuardian([1, 1, 0, 1, 4, 2, 1])).toMatchObject({ archetype: 'sage', pantheon: 'norse', id: 'odin' });
    expect(castGuardian([4, 4, 4, 0, 0, 3, 3])).toMatchObject({ archetype: 'trickster', pantheon: 'korean', id: 'dokkaebi' });
  });

  it('breaks ties by archetype order', () => {
    expect(castGuardian([0, 2, 0, 2, 1, 3, 0]).archetype).toBe('guardian');
  });

  it('rejects out-of-range answers', () => {
    expect(() => castGuardian([5, 0])).toThrow();
    expect(() => castGuardian([0, 4])).toThrow();
  });

  it('takes the figure name from a dictionary title', () => {
    expect(mythNameFromTitle('헤임달(Heimdall) — 북유럽 신화 인물 사전: 상징과 원형')).toBe('헤임달(Heimdall)');
  });
});
