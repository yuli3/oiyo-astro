/**
 * Nordic Rune (Futhark) Interpretation Engine
 * The Grand Archive - Modular Local Interpretation
 *
 * Norse Mythology - The Elder Futhark Runes
 */

import {
  BaseInterpretation,
  NordicInterpretation,
  SixLangString,
} from "../engine.contract";
import { getGlossaryHints } from "../glossary";
import { AETT_NARRATIVES, RUNE_NARRATIVES } from "../shards/nordic-shards";

// Nordic Interpretation Implementation
// ============================================================================

export function interpretNordic(
  runeKey: string,
  locale: string,
): NordicInterpretation {
  const runeData =
    RUNE_NARRATIVES[runeKey.toLowerCase()] || RUNE_NARRATIVES.fehu;
  const aettNarrative = AETT_NARRATIVES[runeData.aett];

  return {
    aettNarrative,
    colorTheme: "nature",
    glossaryHints: getGlossaryHints(["runeElder", "aett"]),
    id: "nordic",
    lucideIcon: "Mountain",
    runeNarrative: runeData.narrative,
    summary: {
      en: `The rune ${runeData.narrative.en.split(":")[0]} signifies a path of ${runeData.narrative.en.split(".")[1].trim().toLowerCase().split(" ")[0]}.`,
      ko: `${runeData.narrative.ko.split(":")[0]} 룬은 당신의 삶에서 강한 활력과 성장을 암시합니다.`,
    },
    symbol: runeData.symbol,
    title: {
      en: "Nordic Rune Reading",
      es: "Lectura de Runas",
      fr: "Lecture des Runes",
      ja: "北欧ルーン解釈",
      ko: "북유럽 룬 해석",
      zh: "北欧符文解读",
    },
  };
}
