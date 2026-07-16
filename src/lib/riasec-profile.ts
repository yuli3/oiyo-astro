export const RIASEC_TYPES = ['R', 'I', 'A', 'S', 'E', 'C'] as const

export type RiasecType = (typeof RIASEC_TYPES)[number]
export type RiasecScores = Record<RiasecType, number>

export interface RiasecScale {
  min: number
  max: number
}

export interface RiasecProfile {
  code: string
  gap: number
  spread: number
  isTie: boolean
  isClose: boolean
  isFlat: boolean
  isLowFlat: boolean
  isMixed: boolean
  interpretationTypes: RiasecType[]
  ranked: Array<{ type: RiasecType; score: number; percent: number }>
}

/**
 * Builds a cautious reading of raw RIASEC scores. The thresholds prevent a
 * deterministic sort order from turning ties or nearly flat scores into a
 * strong career claim; they are reflection rules, not confidence intervals.
 */
export function buildRiasecProfile(scores: RiasecScores, scale: RiasecScale): RiasecProfile {
  if (!Number.isFinite(scale.min) || !Number.isFinite(scale.max) || scale.max <= scale.min) {
    throw new Error('RIASEC scale must have a finite max greater than min')
  }

  const ranked = RIASEC_TYPES.map((type) => {
    const raw = Number.isFinite(scores[type]) ? scores[type] : scale.min
    const score = Math.max(scale.min, Math.min(scale.max, raw))
    return { type, score, percent: Math.round((score / scale.max) * 100) }
  }).sort((a, b) => b.score - a.score)

  const gap = ranked[0].score - ranked[1].score
  const spread = ranked[0].score - ranked.at(-1)!.score
  const isTie = gap === 0
  const isClose = gap <= 1
  const isFlat = spread <= 2
  const lowCeiling = scale.min + (scale.max - scale.min) * 0.45
  const lowFlatSpread = Math.ceil((scale.max - scale.min) * 0.25)
  const isLowFlat = ranked[0].score <= lowCeiling && spread <= lowFlatSpread
  const isMixed = isClose || isFlat || isLowFlat

  return {
    code: ranked.slice(0, 3).map(({ type }) => type).join(''),
    gap,
    spread,
    isTie,
    isClose,
    isFlat,
    isLowFlat,
    isMixed,
    interpretationTypes: isLowFlat
      ? []
      : isMixed
        ? ranked.filter(({ score }) => ranked[0].score - score <= 2).slice(0, 3).map(({ type }) => type)
        : ranked.slice(0, 2).map(({ type }) => type),
    ranked,
  }
}
