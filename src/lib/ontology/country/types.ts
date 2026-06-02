import { LocalizedContent } from "@/types/manifest";

export type CountryArchetype =
  | "coastal"
  | "cosmopolitan"
  | "cultural"
  | "mediterranean"
  | "modern"
  | "mountainous"
  | "nordic"
  | "tropical";

export interface CountryMetrics {
  costOfLiving: string;
  healthcare: number;
  internetSpeed: number;
  qualityOfLife: number;
  safety: number;
}

export interface CountryOption {
  emoji: string;
  id: string;
  scores: Partial<Record<CountryArchetype, number>>;
  text: LocalizedContent | string;
}

export interface CountryPreferenceResult {
  primaryArchetype: CountryArchetype;
  scores: Record<CountryArchetype, number>;
  topCountries: { code: string; data: CountryProfile; match: number }[];
}

export interface CountryProfile {
  bestFor: LocalizedContent[] | string[];
  climate: LocalizedContent | string;
  cons: LocalizedContent[] | string[];
  continent: string;
  currency: string;
  flag: string;
  language: string[];
  metrics: CountryMetrics;
  name: LocalizedContent | string;
  population: string;
  pros: LocalizedContent[] | string[];
  vibe: LocalizedContent | string;
}

export interface CountryQuestion {
  emoji: string;
  id: string;
  options: CountryOption[];
  text: LocalizedContent | string;
}
