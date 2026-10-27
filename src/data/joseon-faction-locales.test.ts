import { describe, expect, it } from 'vitest'
import { FACTIONS, getFactionCopy, type FactionKey } from './joseon-faction-locales'

describe('Joseon faction result language', () => {
  const keys = Object.keys(FACTIONS) as FactionKey[]
  for (const locale of ['ko', 'en', 'ja', 'zh', 'fr', 'es']) {
    it(`${locale}: all six results have stable, complete copy`, () => {
      for (const key of keys) {
        const copy = getFactionCopy(key, locale)
        expect(copy).toBe(getFactionCopy(key, locale))
        expect(copy.name.trim()).not.toBe('')
        expect(copy.desc.length).toBeGreaterThan(10)
        expect(copy.history.length).toBeGreaterThan(10)
        expect(copy.traits).toHaveLength(4)
        expect(copy.color).toBe(FACTIONS[key].ko.color)
        expect(copy.emoji).toBe(FACTIONS[key].ko.emoji)
        if (!['ko', 'en'].includes(locale)) {
          expect(copy.desc).not.toBe(FACTIONS[key].en.desc)
          expect(copy.history).not.toBe(FACTIONS[key].en.history)
          expect(copy.traits).not.toEqual(FACTIONS[key].en.traits)
        }
      }
    })
  }
  it('keeps the legacy cn alias and unknown-locale fallback deterministic', () => {
    for (const key of keys) {
      expect(getFactionCopy(key, 'cn')).toBe(getFactionCopy(key, 'zh'))
      expect(getFactionCopy(key, 'unknown')).toBe(FACTIONS[key].en)
    }
  })
})
