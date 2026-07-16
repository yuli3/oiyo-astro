import { describe, expect, it } from 'vitest'
import { buildRiasecProfile, type RiasecScores } from './riasec-profile'

const quick = { min: 3, max: 15 }
const full = { min: 4, max: 20 }

function scores(values: Partial<RiasecScores>): RiasecScores {
  return { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3, ...values }
}

describe('RIASEC profile interpretation', () => {
  it('keeps an exact tie mixed instead of inventing a dominant code', () => {
    expect(buildRiasecProfile(scores({ R: 13, I: 13, A: 9 }), quick)).toMatchObject({
      code: 'RIA', isTie: true, isClose: true, isMixed: true,
      interpretationTypes: ['R', 'I'],
    })
  })

  it('treats a one-point lead as a close mixed profile', () => {
    expect(buildRiasecProfile(scores({ S: 14, A: 13, I: 8 }), quick)).toMatchObject({
      gap: 1, isClose: true, isMixed: true, interpretationTypes: ['S', 'A'],
    })
  })

  it('keeps high flat and low flat profiles mixed', () => {
    expect(buildRiasecProfile({ R: 18, I: 17, A: 18, S: 17, E: 16, C: 17 }, full)).toMatchObject({
      isFlat: true, isMixed: true,
    })
    expect(buildRiasecProfile({ R: 7, I: 6, A: 5, S: 6, E: 4, C: 5 }, full)).toMatchObject({
      isLowFlat: true, isMixed: true, interpretationTypes: [],
    })
  })

  it('allows a clear lead and reports raw-score percentages', () => {
    const profile = buildRiasecProfile(scores({ I: 15, R: 11, A: 8 }), quick)
    expect(profile).toMatchObject({ isMixed: false, code: 'IRA', gap: 4 })
    expect(profile.ranked[0]).toEqual({ type: 'I', score: 15, percent: 100 })
  })

  it('clamps invalid score values to the declared raw range', () => {
    const profile = buildRiasecProfile({ R: 99, I: -2, A: 7, S: 7, E: 7, C: Number.NaN }, full)
    expect(profile.ranked.find(({ type }) => type === 'R')?.score).toBe(20)
    expect(profile.ranked.find(({ type }) => type === 'I')?.score).toBe(4)
    expect(profile.ranked.find(({ type }) => type === 'C')?.score).toBe(4)
  })
})
