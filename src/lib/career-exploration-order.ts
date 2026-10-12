import type { CareerExample } from './career-exploration'
import type { RiasecProfile, RiasecType } from './riasec-profile'

export function orderCareerExamples(careers: readonly CareerExample[], profile: RiasecProfile, locale: string): CareerExample[] {
  const types = profile.ranked.map(row => row.type)
  // 2026-10-12 rediscovery PRD: tied/flat responses must not manufacture a career winner.
  return [...careers].sort((a, b) => {
    const interestOrder = profile.isMixed ? 0 : types.indexOf(a.code[0] as RiasecType) - types.indexOf(b.code[0] as RiasecType)
    return interestOrder || a.title.localeCompare(b.title, locale) || a.id.localeCompare(b.id)
  })
}
