import { LocalizedText } from "@/types/manifest";

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
  expressionNumber: number;
  lifePathNumber: number;
  personalityNumber: number;
  personalYearNumber: number;
  soulUrgeNumber: number;
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
  expression: number;
  // Persistence fields
  lifePath: number;
  meanings: {
    birthdayMeaning: Partial<NumerologyMeaning>;
    expressionMeaning: Partial<NumerologyMeaning>;
    lifePathMeaning: Partial<NumerologyMeaning>;
    personalityMeaning: Partial<NumerologyMeaning>;
    personalYearMeaning?: any;
    soulUrgeMeaning: Partial<NumerologyMeaning>;
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

  personality: number;
  soulUrge: number;
  userName: string;
}

export type NumerologyResult = NumerologyReading;
