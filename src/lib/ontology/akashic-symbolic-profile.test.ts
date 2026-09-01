import { describe, expect, it } from 'vitest';
import { buildSymbolicProfile } from './akashic-symbolic-profile';

describe('buildSymbolicProfile', () => {
  it('preserves source values and only calls a motif resonant with two sources', () => {
    const profile = buildSymbolicProfile({
      mbti: { type: 'INTJ', traits: ['I', 'N', 'T', 'J'] },
      riasec: { code: 'IAC', scores: { I: 90, A: 80, C: 70 } },
      enneagram: '5',
    });
    expect(profile.branches.map((branch) => [branch.id, branch.value])).toEqual([
      ['mbti', 'INTJ'], ['riasec', 'IAC'], ['enneagram', '5'],
    ]);
    expect(profile.resonances).toEqual(expect.arrayContaining([
      { motif: 'possibility', sources: ['mbti', 'riasec'] },
      { motif: 'analysis', sources: ['mbti', 'riasec'] },
      { motif: 'structure', sources: ['mbti', 'riasec'] },
    ]));
    expect(profile.branches.find((branch) => branch.id === 'enneagram')?.motifs).toEqual([]);
  });

  it('surfaces opposing motifs without resolving them into one verdict', () => {
    const profile = buildSymbolicProfile({
      mbti: { type: 'INFP', traits: ['I', 'N', 'F', 'P'] },
      big5: { O: 30, C: 80, E: 70, A: 50, N: 50 },
    });
    expect(profile.tensions).toEqual(expect.arrayContaining([
      expect.objectContaining({ left: 'inward', right: 'outward' }),
      expect.objectContaining({ left: 'possibility', right: 'grounded' }),
      expect.objectContaining({ left: 'structure', right: 'exploration' }),
    ]));
  });

  it('returns an empty, stable profile when no local signals exist', () => {
    expect(buildSymbolicProfile({})).toEqual({ branches: [], resonances: [], tensions: [], sourceCount: 0 });
  });
});
