/**
 * Master Resonance Engine
 * The Grand Archive - Universal Synthesis Layer
 *
 * Aggregates all ontology interpretations into a unified cosmic profile.
 * Provides cross-system resonance analysis and temporal guidance.
 */

import type { SixLangString } from "./engine.contract";
import { interpretCeltic } from "./engines/celtic";
import { interpretKabbalah } from "./engines/kabbalah";
import { calculateMayanKin, interpretMayan } from "./engines/mayan";
import { interpretNordic } from "./engines/nordic";
import { calculateLifePath, interpretNumerology } from "./engines/numerology";
import { drawDailyTarotCard, interpretTarot } from "./engines/tarot";
import { interpretVedic } from "./engines/vedic";
import { interpretZiWei } from "./engines/ziwei";
import { calculateSonEobneuneNal } from "./universal-interpreter";

// ============================================================================
// Master Resonance Types
// ============================================================================

export interface CosmicSynthesis {
  /** Dominant archetypal theme across systems */
  dominantArchetype: SixLangString;
  /** Cross-system element pattern (Wood, Fire, Earth, Metal, Water) */
  elementalBalance: Record<string, number>;
  /** Overall resonance score */
  overallResonance: number;
  /** Key life themes identified across systems */
  themes: SixLangString[];
}

export interface MasterResonanceInput {
  birthdate: Date;
  /** Celtic tree key (optional, can be calculated) */
  celticTree?: string;
  /** Kabbalah sephira key (optional) */
  kabbalahSephira?: string;
  locale: string;
  /** Nakshatra key for Vedic (optional) */
  nakshatraKey?: string;
  /** Nordic rune key (optional) */
  nordicRune?: string;
  /** ZiWei bureau element (optional) */
  ziweiBureau?: string;
}

export interface MasterResonanceProfile {
  /** Cross-system resonance patterns */
  cosmicSynthesis: CosmicSynthesis;
  /** All available interpretations */
  interpretations: SystemInterpretations;
  /** Temporal guidance (favorable dates, timing) */
  temporalGuidance: TemporalGuidance;
}

export interface SystemInterpretations {
  celtic?: ReturnType<typeof interpretCeltic>;
  kabbalah?: ReturnType<typeof interpretKabbalah>;
  mayan?: ReturnType<typeof interpretMayan>;
  nordic?: ReturnType<typeof interpretNordic>;
  numerology?: ReturnType<typeof interpretNumerology>;
  tarot?: ReturnType<typeof interpretTarot>;
  vedic?: ReturnType<typeof interpretVedic>;
  ziwei?: ReturnType<typeof interpretZiWei>;
}

// ============================================================================
// Master Resonance Engine
// ============================================================================

export interface TemporalGuidance {
  /** Best days for important activities this month */
  auspiciousDays: Date[];
  /** Current cosmic weather / energy */
  currentEnergy: SixLangString;
  /** Daily Tarot draw */
  dailyTarot?: ReturnType<typeof interpretTarot>;
  /** Auspicious days explanation (손없는 날) */
  sonEobneuneNal?: SixLangString;
}

/**
 * Generate a quick daily resonance reading
 */
export function generateDailyResonance(locale: string): {
  dailyTarot: ReturnType<typeof interpretTarot>;
  todayEnergy: SixLangString;
} {
  const tarotDraw = drawDailyTarotCard();
  const dailyTarot = interpretTarot(
    tarotDraw.cardKey,
    tarotDraw.isReversed,
    locale,
  );

  // Get today's Mayan energy
  const today = new Date();
  const todayKin = calculateMayanKin(today);
  const todayMayan = interpretMayan(todayKin.sealKey, todayKin.toneId, locale);

  return {
    dailyTarot,
    todayEnergy: {
      en: `Today resonates with ${todayMayan.kinSignature}. Key energy: ${tarotDraw.cardKey}.`,
      es: `Hoy resuena con ${todayMayan.kinSignature}. Energía clave: ${tarotDraw.cardKey}.`,
      fr: `Aujourd'hui résonne avec ${todayMayan.kinSignature}. Énergie clé: ${tarotDraw.cardKey}.`,
      ja: `今日は${todayMayan.kinSignature}と共鳴しています。主なエネルギー: ${tarotDraw.cardKey}。`,
      ko: `오늘은 ${todayMayan.kinSignature}와 공명합니다. 핵심 에너지: ${tarotDraw.cardKey}.`,
      zh: `今天与${todayMayan.kinSignature}共鸣。核心能量: ${tarotDraw.cardKey}。`,
    },
  };
}

/**
 * Generate a comprehensive Master Resonance Profile
 * Aggregates interpretations from all ontology systems
 */
export function generateMasterResonance(
  input: MasterResonanceInput,
): MasterResonanceProfile {
  const { birthdate, locale } = input;

  // ======== Calculate derived data ========
  const mayanKin = calculateMayanKin(birthdate);
  const lifePathNumber = calculateLifePath(birthdate);

  // ======== Generate all interpretations ========
  const interpretations: SystemInterpretations = {
    mayan: interpretMayan(mayanKin.sealKey, mayanKin.toneId, locale),
    numerology: interpretNumerology(birthdate, locale),
  };

  if (input.nakshatraKey) {
    interpretations.vedic = interpretVedic(
      { nakshatraKey: input.nakshatraKey },
      locale,
    );
  }

  if (input.celticTree) {
    interpretations.celtic = interpretCeltic(input.celticTree, locale);
  }

  if (input.kabbalahSephira) {
    interpretations.kabbalah = interpretKabbalah(input.kabbalahSephira, locale);
  }

  if (input.nordicRune) {
    interpretations.nordic = interpretNordic(input.nordicRune, locale);
  }

  if (input.ziweiBureau) {
    interpretations.ziwei = interpretZiWei(
      { bureauElement: input.ziweiBureau },
      locale,
    );
  }

  // ======== Cosmic Synthesis ========
  const cosmicSynthesis = synthesizeCosmicProfile(interpretations, locale);

  // ======== Temporal Guidance ========
  const now = new Date();
  const sonEobneuneNalData = calculateSonEobneuneNal(
    now.getFullYear(),
    now.getMonth() + 1,
  );
  const dailyTarotDraw = drawDailyTarotCard();

  const temporalGuidance: TemporalGuidance = {
    auspiciousDays: sonEobneuneNalData.dates,
    currentEnergy: {
      en: `The current month favors ${mayanKin.sealKey} energy. Embrace ${interpretations.mayan?.kinSignature || "cosmic flow"}.`,
      es: `El mes actual favorece la energía ${mayanKin.sealKey}. Abraza el ${interpretations.mayan?.kinSignature || "flujo cósmico"}.`,
      fr: `Le mois actuel favorise l'énergie ${mayanKin.sealKey}. Embrassez le ${interpretations.mayan?.kinSignature || "flux cosmique"}.`,
      ja: `今月は${mayanKin.sealKey}のエネルギーに恵まれています。${interpretations.mayan?.kinSignature || "宇宙の流れ"}を受け入れてください。`,
      ko: `이번 달은 ${mayanKin.sealKey} 에너지에 유리합니다. ${interpretations.mayan?.kinSignature || "우주적 흐름"}을 받아들이세요.`,
      zh: `本月有利于${mayanKin.sealKey}能量。拥抱${interpretations.mayan?.kinSignature || "宇宙流动"}。`,
    },
    dailyTarot: interpretTarot(
      dailyTarotDraw.cardKey,
      dailyTarotDraw.isReversed,
      locale,
    ),
    sonEobneuneNal: sonEobneuneNalData.explanation,
  };

  return {
    cosmicSynthesis,
    interpretations,
    temporalGuidance,
  };
}

/**
 * Synthesize patterns across all systems
 */
function synthesizeCosmicProfile(
  interpretations: SystemInterpretations,
  locale: string,
): CosmicSynthesis {
  const themes: SixLangString[] = [];

  // Extract themes from each system
  if (interpretations.mayan) {
    themes.push(interpretations.mayan.lifeMission);
  }
  if (interpretations.numerology) {
    themes.push(interpretations.numerology.lifePathNarrative);
  }
  if (interpretations.vedic) {
    themes.push(interpretations.vedic.nakshatraNarrative);
  }
  if (interpretations.kabbalah) {
    themes.push(interpretations.kabbalah.sephiraNarrative);
  }

  // Calculate element balance (placeholder - can be enhanced with actual element tracking)
  const elementalBalance: Record<string, number> = {
    Air: 20,
    Earth: 20,
    Fire: 20,
    Metal: 20,
    Water: 20,
  };

  // Calculate overall resonance (placeholder score)
  const systemCount = Object.keys(interpretations).length;
  const overallResonance = Math.min(100, systemCount * 15 + 25);

  // Determine dominant archetype
  const dominantArchetype: SixLangString = {
    en: `Multi-dimensional synthesis across ${systemCount} cosmic systems reveals your unique archetypal pattern.`,
    es: `La síntesis multidimensional a través de ${systemCount} sistemas cósmicos revela tu patrón arquetípico único.`,
    fr: `La synthèse multidimensionnelle à travers ${systemCount} systèmes cosmiques révèle votre motif archétypal unique.`,
    ja: `${systemCount}つの宇宙システムにわたる多次元の統合により、あなたのユニークな原型パターンが明らかになります。`,
    ko: `${systemCount}개의 우주 시스템에 걸친 다차원적 합성이 당신의 고유한 원형 패턴을 드러냅니다.`,
    zh: `跨越${systemCount}个宇宙系统的多维综合揭示了你独特的原型模式。`,
  };

  return {
    dominantArchetype,
    elementalBalance,
    overallResonance,
    themes,
  };
}
