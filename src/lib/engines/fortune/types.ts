import type { UniversalProfile } from "@/lib/ontology/engine/types";
import type { Locale } from "@/types/manifest";

export interface DailyFortuneResult extends FortuneResponse {
  energy: {
    health: number;
    love: number;
    money: number;
  };
  keywords: string[]; // e.g., ["Focus", "Patience"]
  lucky: {
    color: string;
    company: string; // The "Noble Person" concept
    direction: string;
    item: string; // Used in UI
    number: number;
    time: string; // e.g. "14:00 - 16:00"
  };

  // Grand Oracle Integration
  sections?: {
    cosmicEntry: { badge?: string; content: string; title: string };
    elementalBlueprint: { badge?: string; content: string; title: string };
    mythicalArchetype: { badge?: string; content: string; title: string };
    prophecy?: { badge?: string; content: string; title: string };
    psychologicalMask: { badge?: string; content: string; title: string };
    socialResonance?: { badge?: string; content: string; title: string };
    vocationPath?: { badge?: string; content: string; title: string };
  };
  visualResonance?: {
    aura: {
      accentColor: string;
      frequency: number;
      geometry: string;
      glowIntensity: number;
      primaryColor: string;
      secondaryColor: string;
    };
    harmonyScore: number;
  };
}
export type FortuneCategory =
  | "career"
  | "health"
  | "life-purpose"
  | "love"
  | "overall"
  | "personal-growth"
  | "wealth";
export interface FortuneContext {
  animal?: string;
  biorhythm?: string;
  currentMood?: string;
  focusArea?: "CAREER" | "GENERAL" | "HOBBY" | "LIFE_DESIGN";
  saju?: string;
  tier: UserTier;
  userHobbies?: string[];
  western?: string;
}

export interface FortuneRequest {
  birthDate?: Date;
  category: FortuneCategory;
  context?: FortuneContext;
  locale: Locale;
  name?: string;
  ontologyProfile?: any; // fully aggregated nurture
  profile?: UniversalProfile; // nature
  scope: FortuneScope;
  zodiacSign?: string;
}

export interface FortuneResponse {
  advice: string[];
  description: string;
  generatedAt: Date;
  id: string;
  // Localization support for caching/SSG
  localizedAdvice?: Record<Locale, string[]>;
  localizedDescription?: Record<Locale, string>;
  localizedTitle?: Record<Locale, string>;
  luckyColors: string[];
  luckyDays: string[]; // e.g. "Tuesday"
  luckyNumbers: number[];
  rating: "critical" | "excellent" | "good" | "low" | "moderate";

  score: number; // 0-100
  title: string;
  validUntil: Date;
}

// Use specific strings for better type safety than general string
export type FortuneScope =
  | "daily"
  | "grand-oracle"
  | "monthly"
  | "weekly"
  | "yearly";

export type UserTier = "FREE" | "OFFERING" | "SUBSCRIBER";
