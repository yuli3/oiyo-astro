import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import { getCareerSkillBridge } from './career-skill-links'
import { CAREER_SKILL_SAMPLE } from './career-skill-sample'
import CareerSkillBridge from '../components/career/CareerSkillBridge'
import { getCareerExamples } from './career-exploration'

describe('source-linked career comparison sample', () => {
  it('keeps the two source importance values separate instead of producing a fit score', () => {
    const result = getCareerSkillBridge(['software-engineer', 'data-analyst'])
    const programming = result?.shared.find(skill => skill.id === 'onet:2.B.3.e')
    expect(programming?.left.importance).toBe(4)
    expect(programming?.right.importance).toBe(2.5)
    expect(programming?.left.date).toBe('08/2025')
    expect(programming?.right.date).toBe('08/2024')
  })
  it('matches ESCO URI identity without inventing numeric importance', () => {
    const result = getCareerSkillBridge(['data-analyst', 'data-scientist'])
    const esco = result?.shared.filter(skill => skill.kind === 'esco')
    expect(esco).toHaveLength(3)
    expect(esco?.every(skill => skill.id.startsWith('http://data.europa.eu/esco/skill/') && skill.left.importance === null && skill.right.importance === null)).toBe(true)
    expect(result?.profiles[1].skills.filter(skill => skill.kind === 'onet')).toHaveLength(0)
  })
  it('does not fill unsupported or identical career pairs with fabricated matches', () => {
    expect(getCareerSkillBridge(['software-engineer', 'nurse'])).toBeNull()
    expect(getCareerSkillBridge(['software-engineer', 'software-engineer'])).toBeNull()
    expect(getCareerSkillBridge(['data-analyst'])).toBeNull()
  })
  it.each(['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const)('renders the same sourced sample and a missing-data notice in %s', locale => {
    const careers = getCareerExamples(locale).filter(career => ['data-analyst', 'data-scientist'].includes(career.id))
    const html = renderToStaticMarkup(createElement(CareerSkillBridge, { careers, locale }))
    expect(html).toContain('O*NET® 30.3')
    expect(html).toContain('1.2.1')
    expect(html).toContain('08/2024')
    expect(html).toContain('https://creativecommons.org/licenses/by/4.0/')
    expect(html).not.toContain('undefined')
    for (const profile of CAREER_SKILL_SAMPLE) expect(profile.skills.every(skill => Boolean(skill.label[locale]))).toBe(true)
  })
})
