import type {
  BaseInterpretation,
  SixLangString,
  ZiWeiInterpretation,
} from "../engine.contract";
import { getGlossaryHints } from "../glossary";
import {
  BUREAU_NARRATIVES,
  MAIN_STAR_NARRATIVES,
  PALACE_NARRATIVES,
} from "../shards/ziwei-shards";

// ZiWei Interpretation Implementation
// ============================================================================

interface ZiWeiInput {
  bureauElement?: string;
  lifePalaceKey?: string;
  mainStarKey?: string;
}

export function interpretZiWei(
  input: ZiWeiInput,
  locale: string,
): ZiWeiInterpretation {
  const bureauNarrative = input.bureauElement
    ? BUREAU_NARRATIVES[input.bureauElement.toLowerCase()] ||
      BUREAU_NARRATIVES.earth
    : BUREAU_NARRATIVES.earth;

  const lifePalaceNarrative = input.lifePalaceKey
    ? PALACE_NARRATIVES[input.lifePalaceKey.toLowerCase()] ||
      PALACE_NARRATIVES.life
    : PALACE_NARRATIVES.life;

  const mainStarNarrative = input.mainStarKey
    ? MAIN_STAR_NARRATIVES[input.mainStarKey.toLowerCase()]
    : undefined;

  return {
    bureauNarrative,
    colorTheme: "mystic",
    glossaryHints: getGlossaryHints([
      "ziweiBureau",
      "ziweiPalace",
      "ziweiStar",
    ]),
    id: "ziwei",
    lucideIcon: "Star",
    mainStarNarrative: mainStarNarrative || {
      en: "No major stars present.",
      ko: "주요 별이 없습니다.",
    },
    palaceNarrative: lifePalaceNarrative,
    summary: {
      en: `Your Zi Wei chart is governed by the ${input.bureauElement || "Earth"} Bureau, focusing your energy on the ${input.lifePalaceKey || "Life"} palace.`,
      ko: `당신의 자미두수 명반은 ${input.bureauElement || "토"}국에 의해 지배되며, ${input.lifePalaceKey || "명"}궁에 에너지가 집중되어 있습니다.`,
    },
    title: {
      en: "Zi Wei Dou Shu Reading",
      es: "Lectura Zi Wei",
      fr: "Lecture Zi Wei",
      ja: "紫微斗数解釈",
      ko: "자미두수 해석",
      zh: "紫微斗数解读",
    },
  };
}
