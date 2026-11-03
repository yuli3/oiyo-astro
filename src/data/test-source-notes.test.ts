import { describe, expect, it } from 'vitest';
import { getCautionText, getLocalizedBasis, getTestSourceNote, TEST_SOURCE_NOTES } from './test-source-notes';
import { BASIS_KO } from './test-source-notes-basis-ko';

describe('typing measurement source note', () => {
  it('uses a measurement-specific explanation in all six languages', () => {
    const note = getTestSourceNote('/typing-speed-test/');
    expect(note?.caution).toBe('performance');
    for (const locale of ['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const) {
      expect(note?.basisByLocale?.[locale]).toHaveLength(2);
      expect(getCautionText('performance', locale)).toContain('WPM');
      expect(getCautionText('performance', locale)).not.toBe(getCautionText('style', locale));
    }
  });
  it('does not reclassify genuine style tests', () => {
    expect(getTestSourceNote('/conflict-style-test/')?.caution).toBe('style');
  });
});

describe('Korean source-note basis', () => {
  // 2026-11-03: 한국어 검사 페이지에 영어 근거 문장이 보이던 누출을 막는다.
  it('has a Korean line for every English basis line', () => {
    const missing = Object.entries(TEST_SOURCE_NOTES)
      .filter(([, note]) => !note.basisByLocale)
      .flatMap(([id, note]) => note.basis.filter((item) => !(item in BASIS_KO)).map((item) => `${id}: ${item}`));
    expect(missing).toEqual([]);
  });
  it('has no orphan keys left behind after an English edit', () => {
    const used = new Set(Object.values(TEST_SOURCE_NOTES).flatMap((note) => note.basis));
    expect(Object.keys(BASIS_KO).filter((key) => !used.has(key))).toEqual([]);
  });
  it('renders Korean for ko and keeps English for en', () => {
    const note = getTestSourceNote('/coffee-personality-test/')!;
    expect(getLocalizedBasis(note, 'ko')[0]).toContain('커피');
    expect(getLocalizedBasis(note, 'en')[0]).toContain('coffee');
  });
});
