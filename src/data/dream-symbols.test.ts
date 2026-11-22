import { describe, expect, it } from 'vitest';
import { DREAM_SYMBOLS, DREAM_SYMBOL_BY_ID } from './dream-symbols';

const LOCALES = ['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const;

describe('dream symbols', () => {
  it('has 72 unique ids', () => {
    const ids = DREAM_SYMBOLS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBe(72);
  });

  it('every related id exists and links back', () => {
    for (const s of DREAM_SYMBOLS) {
      for (const r of s.related) {
        expect(DREAM_SYMBOL_BY_ID[r], `${s.id} -> ${r}`).toBeDefined();
        expect(DREAM_SYMBOL_BY_ID[r].related, `${r} <- ${s.id}`).toContain(s.id);
      }
    }
  });

  it('every symbol is complete in all six locales', () => {
    for (const s of DREAM_SYMBOLS) {
      for (const l of LOCALES) {
        const r = s.l10n[l];
        expect(r?.name, `${s.id}.${l}`).toBeTruthy();
        expect(r.traditional.length, `${s.id}.${l}`).toBeGreaterThan(10);
        expect(r.psych.length, `${s.id}.${l}`).toBeGreaterThan(10);
        expect(r.scenes.length, `${s.id}.${l}`).toBeGreaterThanOrEqual(3);
      }
    }
  });
});
