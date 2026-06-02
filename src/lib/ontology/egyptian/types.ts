/**
 * Egyptian Astrology Types - Patron Deities & Decans
 * The Grand Archive - Shard-M (Mythology)
 */

export interface EgyptianCoordinates {
  decan: EgyptianDecan;
  luckyColors: string[];
  luckyNumbers: number[];
  patronDeity: EgyptianDeity;
  // Probabilistic narrative
  resonance: {
    key: string;
    params: Record<string, string>;
  };

  sacredAnimal: string;
}

export interface EgyptianDecan {
  decanRuler: string; // Planetary ruler
  deity: string;
  endDegree: number;
  name: string;
  number: number; // 1-36
  startDegree: number;
  zodiacSign: string;
}

export interface EgyptianDeity {
  attributesKey: string;
  auraColor: string;
  challenges: string[];
  compatibleWith: string[];
  descriptionKey: string;
  domain: string[];
  element: "Air" | "Earth" | "Fire" | "Water";
  greekEquivalent?: string;
  id: string;
  name: string;
  nameKey: string;
  strengths: string[];
  symbol: string;
  traits: string[];
}
