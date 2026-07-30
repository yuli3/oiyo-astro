import type { NumerologyInterpretation } from "../engine.contract";
import { getGlossaryHints } from "../glossary";
import {
  LIFE_PATH_NARRATIVES,
  MASTER_NUMBER_NOTE,
} from "../shards/numerology-shards";

// ============================================================================
// Numerology Interpretation Implementation
// ============================================================================

/**
 * Calculate Life Path Number from birthdate.
 */
export function calculateLifePath(birthdate: Date): number {
  const year = birthdate.getFullYear();
  const month = birthdate.getMonth() + 1;
  const day = birthdate.getDate();

  // Sum all digits
  const sumDigits = (n: number): number =>
    String(n)
      .split("")
      .reduce((a, b) => a + parseInt(b), 0);

  let total = sumDigits(year) + sumDigits(month) + sumDigits(day);

  // Reduce to single digit or Master Number
  while (total > 9 && total !== 11 && total !== 22 && total !== 33) {
    total = sumDigits(total);
  }

  return total;
}

/**
 * Interpret Numerology Reading
 */
export function interpretNumerology(
  birthdate: Date,
  locale: string,
): NumerologyInterpretation {
  const lifePathNumber = calculateLifePath(birthdate);
  const isMasterNumber = [11, 22, 33].includes(lifePathNumber);

  const lifePathNarrative =
    LIFE_PATH_NARRATIVES[lifePathNumber] || LIFE_PATH_NARRATIVES[1];

  const masterNumberNote = isMasterNumber
    ? MASTER_NUMBER_NOTE[lifePathNumber]
    : undefined;

  return {
    colorTheme: "mystic",
    glossaryHints: getGlossaryHints(["lifePathNumber", "masterNumber"]),
    id: "numerology",
    lifePathNarrative,
    lucideIcon: "Hash",
    masterNumberNote,
    summary: {
      en: `Your Life Path Number is ${lifePathNumber}${isMasterNumber ? " (Master Number)" : ""}, revealing your core purpose.`,
      ko: `당신의 생명 경로수는 ${lifePathNumber}${isMasterNumber ? " (마스터 넘버)" : ""}으로, 삶의 핵심 소명을 드러냅니다.`,
    },
    title: {
      en: "Numerology Reading",
      es: "Lectura de Numerología",
      fr: "Lecture de Numérologie",
      ja: "数秘術解釈",
      ko: "수비학 해석",
      zh: "数字命理解读",
    },
  };
}
