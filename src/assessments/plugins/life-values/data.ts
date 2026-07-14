import type { AssessmentLocale, AssessmentLocaleBundle, InstrumentDefinition } from "../../core";
import { LIFE_VALUES_CARD_SORT_RELEASE_GATE } from "../../../../config/assessment-release-gates.js";
import { LIFE_VALUES_CARD_COPY } from "./copy";

export const LIFE_VALUE_IDS = [
  "autonomy",
  "security",
  "growth",
  "mastery",
  "creativity",
  "contribution",
  "belonging",
  "family",
  "wellbeing",
  "balance",
  "achievement",
  "recognition",
  "influence",
  "variety",
  "curiosity",
  "integrity",
  "meaning",
  "financial-freedom",
] as const;

export type LifeValueId = (typeof LIFE_VALUE_IDS)[number];

export const LIFE_VALUES_INSTRUMENT: InstrumentDefinition = {
  items: LIFE_VALUE_IDS.map((id) => ({
    constructId: `values.chosen.${id}`,
    id,
    promptKey: `cards.${id}.description`,
    required: true,
    responseScaleId: "top-five-rank",
  })),
  responseScales: [{ id: "top-five-rank", kind: "numeric", min: 0, max: 5 }],
  version: "life-values-card-sort-oiyo-18-v1",
};

const META: Record<AssessmentLocale, { description: string; disclaimer: string; name: string }> = {
  ko: { name: "삶·직업 가치 카드 정렬", description: "18가지 가치 가운데 지금 가장 중요한 다섯 가지를 우선순위로 정리합니다.", disclaimer: "OIYO가 만든 자기성찰 활동이며 심리검사, 진단, 규준 또는 적성 판정 도구가 아닙니다." },
  en: { name: "Life & Work Values Card Sort", description: "Prioritize the five values that matter most to you right now from a set of 18.", disclaimer: "An OIYO-authored reflection activity, not a psychological test, diagnosis, norm, or aptitude decision." },
  ja: { name: "人生・仕事の価値カード整理", description: "18の価値から、今の自分にとって大切な5つを優先順に整理します。", disclaimer: "OIYO独自の自己省察アクティビティであり、心理検査・診断・規準・適性判定ではありません。" },
  zh: { name: "生活与工作价值观卡片排序", description: "从18项价值中选出当下最重要的五项并排列优先级。", disclaimer: "这是OIYO原创的自我反思活动，不是心理测验、诊断、常模或职业适性判定。" },
  fr: { name: "Tri de cartes des valeurs de vie et de travail", description: "Classez les cinq valeurs qui comptent le plus pour vous actuellement parmi 18 propositions.", disclaimer: "Activité de réflexion originale d’OIYO, sans valeur de test psychologique, de diagnostic, de norme ou d’orientation professionnelle." },
  es: { name: "Ordenación de valores de vida y trabajo", description: "Prioriza los cinco valores que más te importan ahora entre 18 propuestas.", disclaimer: "Actividad de reflexión original de OIYO; no es una prueba psicológica, diagnóstico, baremo ni decisión de aptitud." },
};

function localizedCardStrings(locale: AssessmentLocale): Record<string, string> {
  return Object.fromEntries(
    LIFE_VALUE_IDS.flatMap((id) => [
      [`cards.${id}.title`, LIFE_VALUES_CARD_COPY[id][locale][0]],
      [`cards.${id}.description`, LIFE_VALUES_CARD_COPY[id][locale][1]],
    ]),
  );
}

export function lifeValuesLocaleBundle(): AssessmentLocaleBundle {
  return Object.fromEntries(
    Object.entries(META).map(([locale, content]) => [locale, {
      content: { ...content, seoDescription: content.description, seoTitle: content.name, strings: localizedCardStrings(locale as AssessmentLocale) },
      status: LIFE_VALUES_CARD_SORT_RELEASE_GATE.localeStatuses[locale as AssessmentLocale],
    }]),
  ) as AssessmentLocaleBundle;
}

export const LIFE_VALUES_ITEM_PROVENANCE =
  "All 18 card labels and prompts are original OIYO-authored reflection content. The activity is not a validated instrument, does not reproduce a published values scale, and must not be presented as measuring stable traits, norms, or percentiles.";
