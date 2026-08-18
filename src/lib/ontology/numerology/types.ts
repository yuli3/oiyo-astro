import type { LocalizedText } from "@/types/manifest";

export interface NumerologyInput {
  birthDate: Date;
  fullName: string;
}

export interface NumerologyMeaning {
  archetype?: string;
  description: LocalizedText;
  element?: string;
  keywords: LocalizedText;
  name: LocalizedText;
  number: number;
}

export interface NumerologyNumbers {
  birthdayNumber: number;
  /**
   * null when the name has no Latin letters to map. The Pythagorean table
   * covers A-Z only, so a Hangul, kana or Hanzi name used to reduce to 0 —
   * a number with no meaning entry, which callers then rendered as a blank
   * or dropped card. Absent is the honest answer; 0 is not.
   */
  expressionNumber: null | number;
  lifePathNumber: number;
  personalityNumber: null | number;
  personalYearNumber: number;
  soulUrgeNumber: null | number;
}

export interface NumerologyPersonalityProfile {
  careerPath: LocalizedText;
  coreTraits: LocalizedText;
  description: LocalizedText;
  growthAreas: LocalizedText;
  idealPartner: LocalizedText;
  keywords: LocalizedText;
  lifeGoals: LocalizedText;
  primaryName: LocalizedText;
  strengths: LocalizedText;
}

export interface NumerologyReading {
  birthDate: string; // ISO string for storage
  birthdayNumber: number;
  /** null when the name has no Latin letters — see NumerologyNumbers. */
  expression: null | number;
  // Persistence fields
  lifePath: number;
  meanings: {
    birthdayMeaning: Partial<NumerologyMeaning>;
    expressionMeaning: null | Partial<NumerologyMeaning>;
    lifePathMeaning: Partial<NumerologyMeaning>;
    personalityMeaning: null | Partial<NumerologyMeaning>;
    personalYearMeaning?: any;
    soulUrgeMeaning: null | Partial<NumerologyMeaning>;
  };
  // Detailed analysis
  numbers: NumerologyNumbers;
  overallAnalysis: {
    dominantNumbers: number[];
    financialInsight?: string;
    lifeTheme: LocalizedText;
    personalYear?: {
      description: LocalizedText;
      number: number;
      theme: LocalizedText;
    };
    recommendations: LocalizedText;
    vibrationalResonance?: {
      description: LocalizedText;
      frequency: number;
    };
  };

  personality: null | number;
  soulUrge: null | number;
  userName: string;
}

export type NumerologyResult = NumerologyReading;
