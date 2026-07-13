import type {
  AssessmentClassification,
  AssessmentLocale,
  AssessmentLocaleBundle,
  AssessmentPlugin,
  CanonicalAssessmentResult,
  InterpretationFragment,
} from "../../core";
import { BIG5_DIMENSIONS, BIG5_INSTRUMENT, bigFiveScorer, type BigFiveDimension } from "./scoring";

const DIMENSION_NAMES: Record<BigFiveDimension, string> = {
  O: "Openness",
  C: "Conscientiousness",
  E: "Extraversion",
  A: "Agreeableness",
  N: "Neuroticism",
};

export function bigFiveLevel(score: number): "low" | "medium" | "high" {
  return score >= 65 ? "high" : score >= 35 ? "medium" : "low";
}

export function bigFiveClassifications(scores: Record<string, number>): AssessmentClassification[] {
  const ranked = [...BIG5_DIMENSIONS].sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0));
  return [
    ...BIG5_DIMENSIONS.map((dimension) => ({
      constructId: `psychology.big5.${dimension}`,
      id: `big5-${dimension}-${bigFiveLevel(scores[dimension] ?? 0)}`,
      label: `${DIMENSION_NAMES[dimension]} ${Math.round(scores[dimension] ?? 0)}%`,
      level: bigFiveLevel(scores[dimension] ?? 0),
    })),
    { constructId: `psychology.big5.${ranked[0]}`, id: "big5-primary", label: DIMENSION_NAMES[ranked[0]] },
    { constructId: `psychology.big5.${ranked[1]}`, id: "big5-secondary", label: DIMENSION_NAMES[ranked[1]] },
  ];
}

function localeBundle(): AssessmentLocaleBundle {
  const content: Record<AssessmentLocale, { name: string; description: string; disclaimer: string }> = {
    ko: { name: "Big Five 성격 테스트", description: "OCEAN 다섯 차원을 연속 점수로 살펴봅니다.", disclaimer: "자기이해용 간편 검사이며 임상 진단이나 채용 판단을 대체하지 않습니다." },
    en: { name: "Big Five Personality Test", description: "Explore the five OCEAN dimensions as continuous scores.", disclaimer: "A brief self-reflection assessment, not a clinical diagnosis or hiring instrument." },
    ja: { name: "Big Five 性格テスト", description: "OCEANの5次元を連続スコアで確認します。", disclaimer: "自己理解用の簡易テストで、臨床診断や採用判断の代わりではありません。" },
    zh: { name: "大五人格测试", description: "以连续分数查看 OCEAN 五个维度。", disclaimer: "这是自我理解用的简短测试，不能替代临床诊断或招聘判断。" },
    fr: { name: "Test de personnalité Big Five", description: "Explorez les cinq dimensions OCEAN sous forme de scores continus.", disclaimer: "Outil bref de réflexion, sans valeur de diagnostic clinique ou de recrutement." },
    es: { name: "Test de personalidad Big Five", description: "Explora las cinco dimensiones OCEAN como puntuaciones continuas.", disclaimer: "Prueba breve de autoconocimiento; no sustituye un diagnóstico ni una decisión laboral." },
  };
  return Object.fromEntries(
    Object.entries(content).map(([locale, value]) => [locale, {
      content: {
        ...value,
        seoDescription: value.description,
        seoTitle: value.name,
        strings: {},
      },
      status: (["ko", "en", "ja"] as string[]).includes(locale) ? "reviewed" : "draft",
    }]),
  ) as AssessmentLocaleBundle;
}

function compose(result: CanonicalAssessmentResult): InterpretationFragment[] {
  return BIG5_DIMENSIONS.map((dimension) => ({
    bodyKey: `big5.interpretation.${dimension}.${bigFiveLevel(result.scores.normalized[dimension] ?? 0)}.body`,
    caveatKey: "big5.caveat.brief-research-inspired",
    evidenceTier: "research-inspired",
    id: `big5-${dimension}-${bigFiveLevel(result.scores.normalized[dimension] ?? 0)}`,
    priority: 50,
    scope: "dimension",
    sourceRefs: ["big-five-model"],
    titleKey: `big5.interpretation.${dimension}.title`,
  }));
}

export const bigFivePlugin: AssessmentPlugin = {
  exportPolicy: {
    allowedFormats: ["json", "csv", "markdown", "soul", "png", "permalink"],
    includeResponsesByDefault: false,
    permalinkConstructs: BIG5_DIMENSIONS.map((dimension) => `psychology.big5.${dimension}`),
    sensitiveConstructs: [],
  },
  id: "big5",
  instrument: BIG5_INSTRUMENT,
  interpreter: { compose, version: "big5-ocean-20-interpretation-v1" },
  locale: localeBundle(),
  manifest: {
    analyticsId: "big5",
    category: "personality",
    clinical: false,
    evidenceTier: "research-inspired",
    estimatedMinutes: 3,
    id: "big5",
    indexable: true,
    kind: "psychometric",
    routes: {
      blog: "https://blog.oiyo.net/{locale}/psychology-big-five-test/",
      execution: "/{locale}/big5/test",
      wiki: "https://wiki.oiyo.net/{locale}/meaning-of-big5/",
    },
    status: "review",
    tags: ["personality", "big-five", "ocean"],
  },
  migrations: [],
  ontology: {
    edges: [],
    nodes: BIG5_DIMENSIONS.map((dimension) => ({ id: `psychology.big5.${dimension}`, kind: "trait", labelKey: `big5.dimension.${dimension}` })),
    toSignals: (result) => BIG5_DIMENSIONS.map((dimension) => ({
      confidence: 0.6,
      constructId: `psychology.big5.${dimension}`,
      evidenceTier: "research-inspired",
      id: `${result.resultId}:${dimension}`,
      observedAt: result.completedAt,
      provenance: { instrumentVersion: result.versions.instrument, resultId: result.resultId, scoringVersion: result.versions.scoring },
      scale: { min: 0, max: 100 },
      sourceAssessmentId: "big5",
      value: result.scores.normalized[dimension] ?? 0,
    })),
  },
  schemaVersion: 2,
  scorer: bigFiveScorer,
  sources: {
    itemRefs: [],
    license: { note: "Current OIYO 20-item brief instrument; item provenance review required before validated-scale promotion.", status: "original" },
    normRefs: [],
    records: [{
      accessedAt: "2026-07-13",
      citation: "International Personality Item Pool: Big-Five factor markers (theory reference only; not the provenance of OIYO's current items)",
      id: "big-five-model",
      kind: "original-theory",
      reviewedAt: "2026-07-13",
      url: "https://ipip.ori.org/",
    }],
    scoringRefs: [],
    theoryRefs: ["big-five-model"],
  },
};
