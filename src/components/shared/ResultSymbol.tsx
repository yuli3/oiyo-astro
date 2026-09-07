import { useState } from 'react'

export type ResultSymbolId =
  | 'mbti'
  | 'big-five'
  | 'enneagram'
  | 'hexaco'
  | 'tci'
  | 'blood-type'
  | 'saju'
  | 'palja'
  | 'five-elements'
  | 'western-zodiac'
  | 'chinese-zodiac'
  | 'maya-inspired'
  | 'celtic-inspired'
  | 'akashic-records'
  | 'disc'
  | 'love-language'

const CHINESE_ZODIAC_FILES: Record<string, string> = {
  boar: 'boar', dog: 'dog', dragon: 'dragon', goat: 'goat', horse: 'horse',
  monkey: 'monkey', ox: 'ox', pig: 'boar', rabbit: 'rabbit', rat: 'rat',
  rooster: 'rooster', snake: 'snake', tiger: 'tiger',
}

const WESTERN_ZODIAC_FILES: Record<string, string> = {
  aquarius: 'aquarius', aries: 'aries', cancer: 'cancer', capricorn: 'capricorn',
  gemini: 'gemini', leo: 'leo', libra: 'libra', pisces: 'pisces',
  sagittarius: 'sagittarius', scorpio: 'scorpio', taurus: 'taurus', virgo: 'virgo',
}

const MBTI_FILES = new Set([
  'enfj', 'enfp', 'entj', 'entp',
  'esfj', 'esfp', 'estj', 'estp',
  'infj', 'infp', 'intj', 'intp',
  'isfj', 'isfp', 'istj', 'istp',
])

const ENNEAGRAM_FILES = new Set(['1', '2', '3', '4', '5', '6', '7', '8', '9'])
const BLOOD_TYPE_FILES = new Set(['a', 'b', 'o', 'ab'])
const FIVE_ELEMENT_FILES = new Set(['wood', 'fire', 'earth', 'metal', 'water'])
const DISC_FILES = new Set(['d', 'i', 's', 'c'])
const LOVE_LANGUAGE_FILES = new Set(['words', 'acts', 'gifts', 'time', 'touch'])

export function resultSymbolSrc(id: ResultSymbolId, variant?: string): string {
  if (id === 'disc' && variant) {
    const file = variant.toLowerCase()
    if (DISC_FILES.has(file)) return `/images/result-symbols/disc/${file}.webp`
  }
  if (id === 'love-language' && variant) {
    const file = variant.toLowerCase()
    if (LOVE_LANGUAGE_FILES.has(file)) return `/images/result-symbols/love-language/${file}.webp`
  }
  if (id === 'mbti' && variant) {
    const file = variant.toLowerCase()
    if (MBTI_FILES.has(file)) return `/images/result-symbols/mbti/${file}.webp`
  }
  if (id === 'enneagram' && variant && ENNEAGRAM_FILES.has(variant)) {
    return `/images/result-symbols/enneagram/type-${variant}.webp`
  }
  if (id === 'blood-type' && variant) {
    const file = variant.toLowerCase()
    if (BLOOD_TYPE_FILES.has(file)) return `/images/result-symbols/blood-type/${file}.webp`
  }
  if (id === 'five-elements' && variant) {
    const file = variant.toLowerCase()
    if (FIVE_ELEMENT_FILES.has(file)) return `/images/result-symbols/five-elements/${file}.webp`
  }
  if (id === 'chinese-zodiac' && variant) {
    const file = CHINESE_ZODIAC_FILES[variant]
    if (file) return `/images/result-symbols/chinese-zodiac/${file}.webp`
  }
  if (id === 'western-zodiac' && variant) {
    const file = WESTERN_ZODIAC_FILES[variant]
    if (file) return `/images/result-symbols/western-zodiac/${file}.webp`
  }
  return `/images/result-symbols/${id}.webp`
}

interface Props {
  alt?: string
  className?: string
  fallback?: string
  id: ResultSymbolId
  variant?: string
}

export default function ResultSymbol({ alt = '', className = '', fallback, id, variant }: Props) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return fallback ? <span aria-hidden="true" className={className}>{fallback}</span> : null
  }

  return (
    <img
      alt={alt}
      className={`object-contain ${className}`}
      decoding="async"
      draggable={false}
      height={96}
      loading="lazy"
      onError={() => setFailed(true)}
      src={resultSymbolSrc(id, variant)}
      width={96}
    />
  )
}
