import { VedicInterpretation } from "../engine.contract";
import { getGlossaryHints } from "../glossary";
import {
  DEFAULT_NAKSHATRA_NARRATIVE,
  DEFAULT_RASHI_NARRATIVE,
  NAKSHATRA_DATA,
  RASHI_NARRATIVES,
} from "../shards/vedic-shards";

// ============================================================================
// Vedic Interpretation Implementation
// ============================================================================

interface VedicInput {
  nakshatraKey?: string;
  rashiKey?: string;
}

/**
 * Interpret Vedic (Jyotish) Astrology
 */
export function interpretVedic(
  input: VedicInput,
  locale: string,
): VedicInterpretation {
  const nakshatraData = input.nakshatraKey
    ? NAKSHATRA_DATA[input.nakshatraKey]
    : null;
  const rashiNarrative = input.rashiKey
    ? RASHI_NARRATIVES[input.rashiKey]
    : null;

  return {
    colorTheme: "cosmic",
    glossaryHints: getGlossaryHints(["nakshatra", "rashi"]),
    id: "vedic",
    lucideIcon: "Moon",
    nakshatraNarrative: nakshatraData?.narrative || DEFAULT_NAKSHATRA_NARRATIVE,
    rashiNarrative: rashiNarrative || DEFAULT_RASHI_NARRATIVE,
    summary: {
      en: `Your Vedic chart highlights ${input.nakshatraKey || "the moon's path"} and ${input.rashiKey || "your rising sign"}.`,
      ko: `당신의 베다 명반은 ${input.nakshatraKey || "달의 경로"}와 ${input.rashiKey || "라이징 사인"}을 강조합니다.`,
    },
    title: {
      en: "Vedic (Jyotish) Reading",
      es: "Lectura Védica",
      fr: "Lecture Védique",
      ja: "ヴェーダ占星術解釈",
      ko: "베다 점성술 해석",
      zh: "吠陀占星解读",
    },
  };
}
