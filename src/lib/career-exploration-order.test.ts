import { describe, expect, it } from 'vitest'
import { orderCareerExamples } from './career-exploration-order'
import { buildRiasecProfile } from './riasec-profile'

const careers = [
  { id: 'z', title: 'Zebra work', code: 'R', description: 'Build things' },
  { id: 'a', title: 'Alpha work', code: 'I', description: 'Explore questions' },
]

describe('career exploration ordering', () => {
  it('uses alphabetical exploration rather than a forced interest winner for tied scores', () => {
    const profile = buildRiasecProfile({ R: 20, I: 20, A: 4, S: 4, E: 4, C: 4 }, { min: 4, max: 20 })
    expect(orderCareerExamples(careers, profile, 'en').map(row => row.id)).toEqual(['a', 'z'])
  })
  it('keeps low-flat and near-tie exploration neutral but retains clear interest grouping', () => {
    for (const scores of [
      { R: 5, I: 4, A: 4, S: 4, E: 4, C: 4 },
      { R: 20, I: 19, A: 4, S: 4, E: 4, C: 4 },
    ]) {
      expect(orderCareerExamples(careers, buildRiasecProfile(scores, { min: 4, max: 20 }), 'en').map(row => row.id)).toEqual(['a', 'z'])
    }
    expect(orderCareerExamples(careers, buildRiasecProfile({ R: 20, I: 10, A: 4, S: 4, E: 4, C: 4 }, { min: 4, max: 20 }), 'en').map(row => row.id)).toEqual(['z', 'a'])
    expect(careers.map(row => row.id)).toEqual(['z', 'a'])
  })
})
