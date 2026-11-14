import { CAREER_SKILL_SAMPLE } from './career-skill-sample'

export function getCareerSkillBridge(ids: readonly string[]) {
  if (ids.length !== 2 || ids[0] === ids[1]) return null
  const left = CAREER_SKILL_SAMPLE.find(profile => profile.careerId === ids[0])
  const right = CAREER_SKILL_SAMPLE.find(profile => profile.careerId === ids[1])
  if (!left || !right) return null
  // WHY 2026-10-29: compare identical source identifiers only; translated names
  // cannot establish ontology equivalence. Keep IM values and essential links apart.
  const shared = left.skills.flatMap(first => {
    const second = right.skills.find(skill => skill.kind === first.kind && skill.id === first.id)
    return second ? [{ id: first.id, kind: first.kind, label: first.label, left: first, right: second }] : []
  })
  return { profiles: [left, right], shared }
}
