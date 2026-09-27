import { describe, expect, it } from 'vitest'
import { getCareerExamples } from './career-exploration'

describe('career exploration payload', () => {
  it('keeps all 308 distinct careers available in Korean without unverified market numbers', () => {
    const careers = getCareerExamples('ko')
    expect(careers).toHaveLength(308)
    expect(new Set(careers.map(career => career.id)).size).toBe(308)
    expect(careers.every(career => career.title && career.code && career.description)).toBe(true)
    expect(careers[0]).toEqual({
      id: expect.any(String),
      code: expect.any(String),
      title: expect.any(String),
      description: expect.any(String),
    })
  })

  it.each(['en', 'ja', 'zh', 'fr', 'es'] as const)('keeps the same career count for %s', locale => {
    expect(getCareerExamples(locale)).toHaveLength(308)
  })
})
