import { describe, expect, it } from 'vitest'
import { getBigFiveResultSummary } from './big-five-result-summary'

const FIXED_SCORES = { O: 82, C: 68, E: 41, A: 57, N: 24 } as const

describe('Big Five result summary', () => {
  it('uses the two highest dimensions without changing score thresholds', () => {
    const summary = getBigFiveResultSummary(FIXED_SCORES, 'ko')

    expect(summary).toMatchObject({ dominant: 'O', secondary: 'C' })
    expect(summary.conclusion).toContain('개방성')
    expect(summary.conclusion).toContain('성실성')
  })

  it.each(['ko', 'en', 'ja', 'zh', 'fr', 'es'])('provides localized copy and a non-self primary action for %s', (locale) => {
    const summary = getBigFiveResultSummary(FIXED_SCORES, locale)

    expect(summary.conclusion.length).toBeGreaterThan(20)
    expect(summary.primaryAction.length).toBeGreaterThan(8)
    expect(summary.primaryHref).toBe(`/${locale}/inner-strength/test/`)
    expect(summary.primaryHref).not.toContain('/big5/test/')
  })
})
