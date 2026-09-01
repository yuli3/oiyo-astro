import type { BigFiveScoreMap } from '@/assessments'

type Dim = 'O' | 'C' | 'E' | 'A' | 'N'
type ResultLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'

const RESULT_DIM_LABELS: Record<ResultLang, Record<Dim, string>> = {
  ko: { O: '개방성', C: '성실성', E: '외향성', A: '친화성', N: '신경성' },
  en: { O: 'openness', C: 'conscientiousness', E: 'extraversion', A: 'agreeableness', N: 'neuroticism' },
  ja: { O: '開放性', C: '誠実性', E: '外向性', A: '協調性', N: '神経症的傾向' },
  zh: { O: '开放性', C: '尽责性', E: '外向性', A: '宜人性', N: '神经质' },
  fr: { O: 'ouverture', C: 'conscienciosité', E: 'extraversion', A: 'agréabilité', N: 'neuroticisme' },
  es: { O: 'apertura', C: 'responsabilidad', E: 'extraversión', A: 'amabilidad', N: 'neuroticismo' },
}

const RESULT_COPY: Record<ResultLang, {
  conclusion: (dominant: string, secondary: string) => string
  primaryAction: string
}> = {
  ko: {
    conclusion: (dominant, secondary) => `가장 두드러진 특성은 ${dominant}입니다. 그다음은 ${secondary}입니다.`,
    primaryAction: '내면 강점 테스트로 이어서 보기',
  },
  en: {
    conclusion: (dominant, secondary) => `Your profile is led by ${dominant}, with ${secondary} as the next most prominent trait.`,
    primaryAction: 'Continue to the inner strengths test',
  },
  ja: {
    conclusion: (dominant, secondary) => `最も際立つ特性は${dominant}で、次に${secondary}がプロフィールを形づくっています。`,
    primaryAction: '内面の強みテストへ進む',
  },
  zh: {
    conclusion: (dominant, secondary) => `你的性格画像以${dominant}最为突出，其次是${secondary}。`,
    primaryAction: '继续进行内在优势测试',
  },
  fr: {
    conclusion: (dominant, secondary) => `Trait le plus marqué : ${dominant}. Vient ensuite : ${secondary}.`,
    primaryAction: 'Continuer avec le test des forces intérieures',
  },
  es: {
    conclusion: (dominant, secondary) => `Rasgo más destacado: ${dominant}. Le sigue: ${secondary}.`,
    primaryAction: 'Continuar con el test de fortalezas internas',
  },
}

function resultLang(locale: string): ResultLang {
  return (['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const).includes(locale as ResultLang)
    ? (locale as ResultLang)
    : 'en'
}

export function getBigFiveResultSummary(scores: BigFiveScoreMap, locale: string) {
  const l = resultLang(locale)
  const dimensions: Dim[] = ['O', 'C', 'E', 'A', 'N']
  const sorted = [...dimensions].sort((a, b) => scores[b] - scores[a])
  const dominant = sorted[0]
  const secondary = sorted[1]

  return {
    dominant,
    secondary,
    conclusion: RESULT_COPY[l].conclusion(RESULT_DIM_LABELS[l][dominant], RESULT_DIM_LABELS[l][secondary]),
    primaryAction: RESULT_COPY[l].primaryAction,
    primaryHref: `/${l}/inner-strength/test/`,
  }
}
