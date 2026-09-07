import { describe, expect, it } from 'vitest'
import { resultSymbolSrc } from './ResultSymbol'

describe('resultSymbolSrc', () => {
  it('resolves a top-level result symbol', () => {
    expect(resultSymbolSrc('mbti')).toBe('/images/result-symbols/mbti.webp')
  })

  it('resolves individual zodiac symbols', () => {
    expect(resultSymbolSrc('chinese-zodiac', 'rat')).toBe('/images/result-symbols/chinese-zodiac/rat.webp')
    expect(resultSymbolSrc('western-zodiac', 'scorpio')).toBe('/images/result-symbols/western-zodiac/scorpio.webp')
  })

  it('resolves an MBTI result without depending on input casing', () => {
    expect(resultSymbolSrc('mbti', 'INTJ')).toBe('/images/result-symbols/mbti/intj.webp')
  })

  it('resolves an Enneagram result', () => {
    expect(resultSymbolSrc('enneagram', '9')).toBe('/images/result-symbols/enneagram/type-9.webp')
  })

  it('resolves a blood-type result without medical imagery semantics', () => {
    expect(resultSymbolSrc('blood-type', 'AB')).toBe('/images/result-symbols/blood-type/ab.webp')
  })

  it('resolves a Five Elements result', () => {
    expect(resultSymbolSrc('five-elements', 'water')).toBe('/images/result-symbols/five-elements/water.webp')
  })

  it('maps the application pig key to the boar asset', () => {
    expect(resultSymbolSrc('chinese-zodiac', 'pig')).toBe('/images/result-symbols/chinese-zodiac/boar.webp')
  })

  it('falls back to the collection symbol for an unknown variant', () => {
    expect(resultSymbolSrc('western-zodiac', 'unknown')).toBe('/images/result-symbols/western-zodiac.webp')
  })
})
