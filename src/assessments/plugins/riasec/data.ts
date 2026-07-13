import type { AssessmentLocale, AssessmentLocaleBundle, InstrumentDefinition } from "../../core";

export const RIASEC_DIMENSIONS = ["R", "I", "A", "S", "E", "C"] as const;
export type RiasecDimension = (typeof RIASEC_DIMENSIONS)[number];

export const RIASEC_DIMENSION_NAMES: Record<RiasecDimension, string> = {
  R: "Realistic",
  I: "Investigative",
  A: "Artistic",
  S: "Social",
  E: "Enterprising",
  C: "Conventional",
};

export const RIASEC_FULL_ITEM_IDS = RIASEC_DIMENSIONS.flatMap((dimension) =>
  Array.from({ length: 4 }, (_, index) => `${dimension}${index + 1}`),
);

const QUICK_EXCLUDED_ITEMS = new Set(["R2", "I3", "A4", "S4", "E4", "C2"]);
export const RIASEC_QUICK_ITEM_IDS = RIASEC_FULL_ITEM_IDS.filter((id) => !QUICK_EXCLUDED_ITEMS.has(id));

function instrument(ids: string[], version: string): InstrumentDefinition {
  return {
    items: ids.map((id) => ({
      constructId: `vocation.riasec.${id[0]}`,
      id,
      promptKey: `items.${id}`,
      required: true,
      responseScaleId: "likert-5",
    })),
    responseScales: [{ id: "likert-5", kind: "likert", min: 1, max: 5 }],
    version,
  };
}

export const RIASEC_FULL_INSTRUMENT = instrument(
  RIASEC_FULL_ITEM_IDS,
  "riasec-oiyo-24-v1",
);

export const RIASEC_QUICK_INSTRUMENT = instrument(
  RIASEC_QUICK_ITEM_IDS,
  "riasec-oiyo-18-v1",
);

const COPY: Record<
  AssessmentLocale,
  { description: string; disclaimer: string; full: string; quick: string }
> = {
  ko: { description: "여섯 가지 직업 흥미 차원을 살펴봅니다.", disclaimer: "OIYO 자체 문항으로 구성한 자기이해용 간편 검사이며 표준화된 직업심리검사를 대체하지 않습니다.", full: "RIASEC 직업 흥미 검사", quick: "RIASEC 빠른 검사" },
  en: { description: "Explore six dimensions of vocational interest.", disclaimer: "A brief self-reflection instrument with OIYO-authored items; it does not replace a standardized vocational assessment.", full: "RIASEC Career Interest Test", quick: "RIASEC Quick Test" },
  ja: { description: "6つの職業興味次元を確認します。", disclaimer: "OIYO独自項目による自己理解用の簡易検査で、標準化された職業心理検査の代わりではありません。", full: "RIASEC 職業興味検査", quick: "RIASEC クイック検査" },
  zh: { description: "探索六种职业兴趣维度。", disclaimer: "这是由 OIYO 自编题目组成的简短自我了解工具，不能替代标准化职业测评。", full: "RIASEC 职业兴趣测试", quick: "RIASEC 快速测试" },
  fr: { description: "Explorez six dimensions des intérêts professionnels.", disclaimer: "Outil bref composé d'items originaux OIYO; il ne remplace pas une évaluation professionnelle standardisée.", full: "Test d'intérêts RIASEC", quick: "Test RIASEC rapide" },
  es: { description: "Explora seis dimensiones de intereses profesionales.", disclaimer: "Instrumento breve con ítems originales de OIYO; no sustituye una evaluación vocacional estandarizada.", full: "Test de intereses RIASEC", quick: "Test RIASEC rápido" },
};

export function riasecLocaleBundle(quick: boolean): AssessmentLocaleBundle {
  return Object.fromEntries(
    Object.entries(COPY).map(([locale, value]) => {
      const name = quick ? value.quick : value.full;
      return [locale, {
        content: {
          description: value.description,
          disclaimer: value.disclaimer,
          name,
          seoDescription: value.description,
          seoTitle: name,
          strings: {},
        },
        status: quick || ["ko", "en", "ja"].includes(locale) ? "reviewed" : "draft",
      }];
    }),
  ) as AssessmentLocaleBundle;
}

export const RIASEC_ITEM_PROVENANCE = {
  author: "OIYO",
  note: "All 24 full-form items and the 18-item subset are original OIYO-authored prompts inspired by Holland's RIASEC model; they are not copied from or represented as a validated proprietary instrument.",
} as const;
