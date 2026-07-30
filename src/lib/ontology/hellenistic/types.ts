// Hellenistic Astrology Types
import type { LocalizedText } from "@/types/manifest";

export interface HellenisticCoordinates {
  isDayChart: boolean;
  lotOfFortune?: LotOfFortune;
  resonance: {
    key: string;
    params: Record<string, string>;
  };
  sect: Sect;
  triplicity: TriplicityLords;
}

export interface HellenisticPrinciple {
  descriptionKey: string;
  formula?: {
    day: string;
    night: string;
  };
  principles?: any[];
  termKey: string;
}

export interface LotOfFortune {
  coordinate: number; // 0-360
  descriptionKey?: string;
  house?: number;
  sign: string;
}

export type Sect = "Day" | "Night";

export interface TriplicityLords {
  element: "Air" | "Earth" | "Fire" | "Water";
  participatingLord: string;
  primaryLord: string;
  secondaryLord: string;
  sect: Sect;
}
