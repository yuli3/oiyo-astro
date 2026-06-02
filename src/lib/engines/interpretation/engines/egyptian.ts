import {
  BaseInterpretation,
  EgyptianInterpretation,
  SixLangString,
} from "../engine.contract";
import { getGlossaryHints } from "../glossary";
import { EGYPTIAN_DEITIES } from "../shards/egyptian-shards";

// Egyptian Interpretation Implementation
// ============================================================================

// ============================================================================
// Engine Function
// ============================================================================

/**
 * Get Egyptian deity by birthdate
 */
export function getEgyptianDeityByDate(month: number, day: number): string {
  // Simplified mapping - returns deity key based on date ranges
  if (
    (month === 1 && day >= 8 && day <= 21) ||
    (month === 2 && day >= 1 && day <= 11)
  )
    return "amon_ra";
  if (
    (month === 5 && day >= 8 && day <= 27) ||
    (month === 6 && day >= 29) ||
    (month === 7 && day <= 13)
  )
    return "anubis";
  if (
    (month === 7 && day >= 14 && day <= 28) ||
    (month === 9 && day >= 23 && day <= 27)
  )
    return "bastet";
  if (
    (month === 2 && day >= 12 && day <= 29) ||
    (month === 8 && day >= 20 && day <= 31)
  )
    return "geb";
  if (
    (month === 4 && day >= 20) ||
    (month === 5 && day <= 7) ||
    (month === 8 && day >= 12 && day <= 19)
  )
    return "horus";
  if (
    (month === 3 && day >= 11 && day <= 31) ||
    (month === 10 && day >= 18 && day <= 29)
  )
    return "isis";
  if (
    (month === 1 && day >= 22 && day <= 31) ||
    (month === 9 && day >= 8 && day <= 22)
  )
    return "mut";
  if (
    (month === 1 && day >= 1 && day <= 7) ||
    (month === 6 && day >= 19 && day <= 28)
  )
    return "nile";
  if (
    (month === 3 && day >= 1 && day <= 10) ||
    (month === 11 && day >= 27) ||
    month === 12
  )
    return "osiris";
  if ((month === 7 && day >= 29) || (month === 8 && day <= 11))
    return "sekhmet";
  if ((month === 5 && day >= 28) || (month === 6 && day <= 18)) return "seth";
  if (
    (month === 4 && day >= 1 && day <= 19) ||
    (month === 11 && day >= 8 && day <= 17)
  )
    return "thoth";
  return "amon_ra";
}

export function interpretEgyptian(
  deityKey: string,
  locale: string,
): EgyptianInterpretation {
  const deity =
    EGYPTIAN_DEITIES[deityKey.toLowerCase()] || EGYPTIAN_DEITIES.amon_ra;

  return {
    colorTheme: "solar",
    deityDomain: deity.domain,
    deityNarrative: deity.narrative,
    glossaryHints: getGlossaryHints(["egyptianDeity", "solarZodiac"]),
    id: "egyptian",
    lucideIcon: "Sun",
    summary: {
      en: `The deity ${deity.domain.en.split(",")[0]} governs your path, offering ${deity.narrative.en.split(".")[0].toLowerCase()}.`,
      ko: `${deity.domain.ko}의 신인 ${deity.symbol}이 당신의 길을 수호하며, ${deity.narrative.ko.split(".")[0]}의 축복을 내립니다.`,
    },
    symbol: deity.symbol,
    title: {
      en: "Egyptian Astrology Reading",
      es: "Lectura Egipcia",
      fr: "Lecture Égyptienne",
      ja: "エジプト占星術解釈",
      ko: "이집트 점성술 해석",
      zh: "埃及占星解读",
    },
  };
}
