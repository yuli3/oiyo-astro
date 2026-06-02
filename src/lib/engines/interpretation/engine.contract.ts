/**
 * Interpretation Engine Contract
 * The Grand Archive - SSOT Type Definitions
 *
 * Defines strict types for all interpretation engine outputs.
 * Follows SSOT principle - all engines must conform to these types.
 */

import { LocalizedString } from "@/types/manifest";

import { MBTIDeepInterpretation } from "./engines/mbti-deep";
import { TCIDeepInterpretation } from "./engines/tci-deep";

// ============================================================================
// Core Six-Language String Type
// ============================================================================

/**
 * Every interpretation module must return this base structure.
 */
export interface BaseInterpretation {
  /** Suggested color theme name (e.g., 'fire', 'mystic', 'nature') */
  colorTheme?: string;
  /** Glossary hints for terms used in this interpretation */
  glossaryHints?: GlossaryHint[];
  /** Unique identifier for this interpretation type */
  id: string;
  /** Suggested Lucide icon name for UI rendering */
  lucideIcon?: string;
  /** Brief summary or "one-liner" for this interpretation */
  summary?: SixLangString;
  /** Human-readable localized title */
  title: SixLangString;
}

export interface CelticInterpretation extends BaseInterpretation {
  oghamSymbol: string;
  treeNarrative: SixLangString;
  treeSymbolism: SixLangString;
}

// ============================================================================
// Glossary Hint - For UX Tooltips
// ============================================================================

/**
 * An insight generated from the synergy of multiple systems.
 */
export interface CorrelationInsight {
  /** UI Category (e.g., 'love', 'career', 'growth') */
  category?: string;
  /** The localized narrative explaining the synergy */
  narrative: SixLangString;
  /** Importance rating 1-10 */
  strength: number;
  /** The systems involved in this correlation */
  systems: string[];
}

// ============================================================================
// Base Interpretation Output
// ============================================================================

export interface EgyptianInterpretation extends BaseInterpretation {
  deityDomain: SixLangString;
  deityNarrative: SixLangString;
  lifeLesson?: SixLangString;
  mythologicalContext?: SixLangString;
  symbol: string;
}

// ============================================================================
// Domain-Specific Interpretation Types
// ============================================================================

export interface FortuneSection {
  /** Advice or actionable insight */
  advice?: SixLangString;
  /** Detailed interpretation */
  narrative: SixLangString;
  /** Section title */
  title: SixLangString;
}

/**
 * A glossary hint provides a term and its localized definition.
 * Used for UI tooltips to help users understand astrology/ontology terms.
 */
export interface GlossaryHint {
  /** Localized definition of the term */
  definition: SixLangString;
  /** The term being explained (e.g., "Day Master", "Lot of Fortune") */
  term: string;
}

export interface HellenisticInterpretation extends BaseInterpretation {
  houseNarrative?: SixLangString;
  lotOfFortuneNarrative?: SixLangString;
  planetNarrative?: SixLangString;
  sectNarrative?: SixLangString;
  triplicityNarrative?: SixLangString;
}

/**
 * All interpretation engines must implement this interface.
 */
export interface InterpretationEngine<
  TInput,
  TOutput extends BaseInterpretation,
> {
  /** Unique engine identifier */
  id: string;
  /** Generate interpretation from input data */
  interpret(input: TInput, locale: string): TOutput;
}

export interface KabbalahInterpretation extends BaseInterpretation {
  lifePathSephira?: SixLangString;
  pillarNarrative: SixLangString;
  sephiraNarrative: SixLangString;
}

export interface MayanInterpretation extends BaseInterpretation {
  colorMeaning: SixLangString;
  kinSignature: string;
  lifeMission: SixLangString;
  sealNarrative: SixLangString;
  toneNarrative: SixLangString;
}

export interface NordicInterpretation extends BaseInterpretation {
  aettNarrative: SixLangString;
  runeNarrative: SixLangString;
  symbol: string;
}

export interface NumerologyInterpretation extends BaseInterpretation {
  destinyNarrative?: SixLangString;
  lifePathNarrative: SixLangString;
  masterNumberNote?: SixLangString;
}

export interface PatternSection {
  /** Pattern interpretation */
  narrative: SixLangString;
  /** The pattern identified (e.g., "Strong Wood") */
  pattern: string;
  /** Strategic advice */
  strategy?: SixLangString;
}

export interface ProfileSection {
  /** Distribution for charts (e.g., radar chart data) */
  distribution?: Record<string, number>;
  /** Dominant element or archetype */
  dominant: string;
  /** Profile narrative */
  narrative: SixLangString;
}

/**
 * The final "Rich" output delivered to the UI.
 */
export interface RichInterpretationResult {
  /** Cross-system insights and synergies */
  correlations: CorrelationInsight[];
  /** Global metadata (e.g., resonance score, daily guidance) */
  metadata?: {
    dailyGuidance?: SixLangString;
    displayHints?: Record<string, { icon: string; theme: string }>;
    generatedAt: string;
    resonanceScore?: number;
  };
  /** Individual system interpretations */
  systems: UniversalInterpretationResult;
}

// ============================================================================
// Section Types for Structured Content
// ============================================================================

export interface SajuInterpretation extends BaseInterpretation {
  academicFortune?: FortuneSection;
  careerFortune?: FortuneSection;
  dayMaster: string;
  element: string;
  elementalPattern?: PatternSection;
  marriageFortune?: FortuneSection;
  noblePerson?: FortuneSection;
  tenGodProfile?: ProfileSection;
}

/**
 * Localized string supporting 6 languages.
 * `ko` and `en` are required; others are optional fallbacks.
 */
export type SixLangString = {
  en: string;
  es?: string;
  fr?: string;
  ja?: string;
  ko: string;
  zh?: string;
};

export interface TarotInterpretation extends BaseInterpretation {
  cardNarrative: SixLangString;
  isReversed: boolean;
  suit: string;
  symbol: string;
  uprightKeywords?: SixLangString;
}

// ============================================================================
// Correlation & Rich Results
// ============================================================================

/**
 * Aggregated interpretation result from all systems.
 */
export interface UniversalInterpretationResult {
  celtic?: CelticInterpretation;
  egyptian?: EgyptianInterpretation;
  hellenistic?: HellenisticInterpretation;
  kabbalah?: KabbalahInterpretation;
  mayan?: MayanInterpretation;
  mbti?: MBTIDeepInterpretation;
  nordic?: NordicInterpretation;
  numerology?: NumerologyInterpretation;
  saju?: SajuInterpretation;
  tarot?: TarotInterpretation;
  tci?: TCIDeepInterpretation;
  vedic?: VedicInterpretation;
  ziwei?: ZiWeiInterpretation;
}

export interface VedicInterpretation extends BaseInterpretation {
  dashaNarrative?: SixLangString;
  nakshatraNarrative: SixLangString;
  rashiNarrative: SixLangString;
}

export interface ZiWeiInterpretation extends BaseInterpretation {
  bureauNarrative: SixLangString;
  mainStarNarrative: SixLangString;
  palaceNarrative: SixLangString;
}

// ============================================================================
// Engine Interface
// ============================================================================

/**
 * Helper to extract the correct language from a SixLangString.
 */
export function getLang(str: SixLangString, locale: string): string {
  const lang = locale.substring(0, 2) as keyof SixLangString;
  return str[lang] || str.en || "";
}
