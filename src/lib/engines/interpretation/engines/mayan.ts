import type {
  BaseInterpretation,
  MayanInterpretation,
  SixLangString,
} from "../engine.contract";
import { getGlossaryHints } from "../glossary";
import {
  COLOR_MEANINGS,
  MAYAN_SEALS,
  MAYAN_TONES,
  SEAL_ORDER,
} from "../shards/mayan-shards";

// Mayan Interpretation Implementation
// ============================================================================

// ============================================================================
// Engine Functions
// ============================================================================

/**
 * Calculate Mayan Kin from birthdate
 */
export function calculateMayanKin(birthdate: Date): {
  sealKey: string;
  toneId: number;
} {
  const referenceDate = new Date(2000, 6, 26);
  const refKin = 164;
  const daysDiff = Math.floor(
    (birthdate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const kin = ((((refKin - 1 + daysDiff) % 260) + 260) % 260) + 1;
  const sealIndex = (kin - 1) % 20;
  const toneId = ((kin - 1) % 13) + 1;
  const sealKey = SEAL_ORDER[sealIndex];
  return { sealKey, toneId };
}

/**
 * Interpret Mayan Galactic Signature
 */
export function interpretMayan(
  sealKey: string,
  toneId: number,
  locale: string,
): MayanInterpretation {
  const normKey = sealKey.toLowerCase();
  const seal = MAYAN_SEALS[normKey] || MAYAN_SEALS.dragon;
  const tone = MAYAN_TONES[toneId] || MAYAN_TONES[1];
  const colorMeaning = COLOR_MEANINGS[seal.color];

  // Calculate Kin number (simplified: seal position * tone)
  const sealIndex = SEAL_ORDER.indexOf(normKey) + 1;
  const kinNumber = (((sealIndex - 1) * 13 + toneId - 1) % 260) + 1;

  return {
    colorMeaning,
    colorTheme: "galactic",
    glossaryHints: getGlossaryHints(["solarSeal", "galacticTone", "kin"]),
    id: "mayan",
    kinSignature: `Kin ${kinNumber}: ${seal.symbol} ${toneId}`,
    lifeMission: {
      en: `Your galactic signature is Kin ${kinNumber}.`,
      ko: `당신의 은하 서명은 킨 ${kinNumber}입니다.`,
    },
    lucideIcon: "Flame",
    sealNarrative: seal.narrative,
    summary: {
      en: `You resonate with the ${seal.symbol} energy and tone ${toneId}, forming Kin ${kinNumber}.`,
      ko: `당신은 ${seal.symbol} 에너지와 ${toneId}번 톤의 공명을 통해 킨 ${kinNumber}을 형성합니다.`,
    },
    title: {
      en: "Mayan Galactic Signature",
      es: "Firma Galáctica",
      fr: "Signature Galactique",
      ja: "マヤ銀河署名",
      ko: "마야 은하 서명",
      zh: "玛雅银河签名",
    },
    toneNarrative: tone,
  };
}
