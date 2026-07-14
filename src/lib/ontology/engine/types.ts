import { BirthSymbol } from "@/lib/data-layer/shards/fate-symbols";
import { CelticTreeSign } from "@/lib/ontology/celtic/types";
import { EgyptianCoordinates } from "@/lib/ontology/egyptian/types";
import { NumerologyResult } from "@/lib/ontology/numerology/types";
import { NameAnalysisResult } from "@/lib/ontology/onomancy/analysis";
import {
  LuckyAttributes,
  SajuAnalysis,
  SajuResult,
} from "@/lib/ontology/saju/types";
import { BloodTypePersonality } from "@/lib/ontology/traits/blood-type/types";
import { CelestialCoordinates } from "@/lib/ontology/western/calculator";
import { LocalizedText } from "@/types/manifest";

import { HellenisticCoordinates } from "../hellenistic/types";
import { KabbalahCoordinates } from "../kabbalah/types";
import { MayanKin } from "../mayan/types";
import { Rune } from "../nordic/types";
import { VedicCoordinates } from "../vedic/types";
import { ZiWeiCoordinates } from "../ziwei/types";

export interface AnimalZodiacSign {
  element?: string;
  id: string;
  name: LocalizedText;
  traits: LocalizedText[];
}

export interface BiorhythmData {
  emotional: number;
  intellectual: number;
  physical: number;
}

export interface IChingOracle {
  hexagramName: LocalizedText;
  hexagramNumber: number;
  image: LocalizedText;
  judgment: LocalizedText;
}

// ============================================================================
// SUB-TYPES
// ============================================================================
export interface SocialAnalysis {
  beneficial: {
    description: LocalizedText;
    element: string;
    relation: string;
  };
  compatible: {
    description: LocalizedText;
    stars: string[];
  };
}

// ============================================================================
// INPUT TYPE
// ============================================================================
export interface UniversalInput {
  /** Birthplace calendar date (`YYYY-MM-DD`), independent of an instant. */
  civilDate: string;
  /** Resolved absolute birth instant. Exact-time systems must only use this. */
  instant: Date;
  birthTime?: { hour: number; minute: number };
  bloodType?: "A" | "AB" | "B" | "O";
  fullName?: string;
  gender?: "female" | "male";
  isLunarCalendar?: boolean;
  longitude?: number;
}

// ============================================================================
// MAIN OUTPUT TYPE
// ============================================================================
export interface UniversalProfile {
  animalZodiac: AnimalZodiacSign;

  biorhythms?: BiorhythmData;
  bloodTypeInfo: BloodTypePersonality | null;
  // === ANALYTICS / SSOT ===
  consistencyScore?: number;
  cosmic?: CelestialCoordinates;

  hellenistic?: HellenisticCoordinates;
  // === USER PREFERENCES ===
  hobbies?: string[];
  // === IDENTITY ===
  input: UniversalInput;
  kabbalah?: KabbalahCoordinates;
  // === LUCKY ATTRIBUTES ===
  luckyAttributes?: LuckyAttributes;

  // === ANCIENT CIVILIZATIONS ===
  mythos?: {
    birthflower?: { meaning: LocalizedText; name: LocalizedText };
    birthstone?: { meaning: LocalizedText; name: LocalizedText };
    celtic: CelticTreeSign;
    egyptian: EgyptianCoordinates; // Was EgyptianGuardian
    iching: IChingOracle;
    mayan: MayanKin;
    symbols: BirthSymbol;
  };
  nordic?: Rune;
  numerology: NumerologyResult;

  // === NAME ANALYSIS ===
  onomancy?: NameAnalysisResult;

  // === ORACLE / INSIGHTS ===
  oracleInsight?: Record<string, { content: string; title: string }>;
  // === EASTERN SYSTEMS ===
  saju: SajuResult;
  sajuAnalysis?: SajuAnalysis;

  // === SOCIAL / COMPATIBILITY ===
  social?: SocialAnalysis;

  // === SYNERGY (Legacy) ===
  synergy: {
    advice: LocalizedText;
    description: LocalizedText;
    title: LocalizedText;
  };

  vedic?: VedicCoordinates;

  // === WESTERN SYSTEMS ===
  westernZodiac: WesternZodiacSign;

  ziWei?: ZiWeiCoordinates;
}

export interface WesternZodiacSign {
  dates: string;
  element: "air" | "earth" | "fire" | "water";
  id: string;
  name: LocalizedText;
  traits: LocalizedText[];
}
