import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { MINOR_ARCANA, tarotMinorImageSrc } from './tarot-minor-arcana';

const LOCALES = ['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const;

describe('tarot minor arcana', () => {
  it('has 56 cards with ids 22–77 in order, 14 per suit', () => {
    expect(MINOR_ARCANA).toHaveLength(56);
    MINOR_ARCANA.forEach((card, i) => expect(card.id).toBe(22 + i));
    for (const suit of ['wands', 'cups', 'swords', 'pentacles'] as const) {
      expect(MINOR_ARCANA.filter((c) => c.suit === suit).map((c) => c.rank)).toEqual(
        Array.from({ length: 14 }, (_, i) => i + 1),
      );
    }
  });

  it('fills every locale for name, keywords, upright and reversed', () => {
    for (const card of MINOR_ARCANA) {
      for (const field of ['name', 'keywords', 'upright', 'reversed'] as const) {
        for (const locale of LOCALES) expect(card[field][locale].trim(), `${card.id} ${field} ${locale}`).not.toBe('');
      }
      expect(card.upright.ko).not.toBe(card.reversed.ko);
    }
  });

  it('points every card at an image that exists', () => {
    for (const card of MINOR_ARCANA) expect(existsSync(`public${tarotMinorImageSrc(card)}`), card.name.en).toBe(true);
  });
});
