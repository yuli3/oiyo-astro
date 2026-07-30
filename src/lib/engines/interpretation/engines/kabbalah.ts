import type {
  BaseInterpretation,
  KabbalahInterpretation,
  SixLangString,
} from "../engine.contract";
import { getGlossaryHints } from "../glossary";
import {
  PILLAR_NARRATIVES,
  SEPHIROT_NARRATIVES,
} from "../shards/kabbalah-shards";

// Kabbalah Interpretation Implementation
// ============================================================================

export function interpretKabbalah(
  sephiraKey: string,
  locale: string,
): KabbalahInterpretation {
  const normKey = sephiraKey.toLowerCase();
  const sephiraData =
    SEPHIROT_NARRATIVES[normKey] || SEPHIROT_NARRATIVES.tiferet;
  const pillarNarrative = PILLAR_NARRATIVES[sephiraData.pillar];

  return {
    colorTheme: "esoteric",
    glossaryHints: getGlossaryHints(["sephira", "treeOfLife"]),
    id: "kabbalah",
    lifePathSephira: {
      en: `Your Life Path Sephira is ${sephiraKey}`,
      ko: `당신의 생명 경로 세피라는 ${sephiraKey}입니다`,
    },
    lucideIcon: "Tree",
    pillarNarrative,
    sephiraNarrative: sephiraData.narrative,
    summary: {
      en: `The Sephira of ${sephiraKey} guides your soul's descent, rooted in the ${sephiraData.pillar}.`,
      ko: `${sephiraKey} 세피라는 ${sephiraData.pillar}에 뿌리를 두고 당신의 영혼을 안내합니다.`,
    },
    title: {
      en: "Kabbalah Reading",
      es: "Lectura de Cábala",
      fr: "Lecture de Kabbale",
      ja: "カバラ数秘術解釈",
      ko: "카발라 수비학 해석",
      zh: "卡巴拉数秘解读",
    },
  };
}
