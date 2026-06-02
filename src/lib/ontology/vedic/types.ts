/**
 * Vedic Astrology Types - Nakshatras (27 Lunar Mansions)
 * The Grand Archive - Shard-O (Eastern Astrology)
 */

export interface Nakshatra {
  animal?: string; // Yoni (sexual compatibility animal)
  deity?: string; // Ruling deity
  element: "Air" | "Earth" | "Ether" | "Fire" | "Water";
  englishName?: string;
  guna: "Rajas" | "Sattva" | "Tamas"; // Quality
  id: number; // 1-27
  key: string; // i18n key suffix
  keywords?: string[];
  name?: string; // Sanskrit name
  rulingPlanet: string;
  symbol?: string;
}

export interface Pada {
  navamshaSign: string; // The sign of the navamsha
  number: 1 | 2 | 3 | 4;
  soundSyllable: string; // First syllable of name
}

export interface VedicCoordinates {
  karana: string; // Half-tithi
  moonDegree: number; // Approximate lunar longitude
  moonSign: string; // Rashi (Moon's zodiac sign)
  nakshatra: Nakshatra;
  pada: Pada;
  // Probabilistic narrative
  resonance: {
    key: string;
    params: Record<string, string>;
  };
  tithi: string; // Lunar day (1-30)

  yoga: string; // Sun-Moon angular relationship
}
