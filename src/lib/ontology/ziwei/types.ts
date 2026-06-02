/**
 * Zi Wei Dou Shu Types (Professional)
 * The Grand Archive - Shard-Mastery
 */

export type Element = "Earth" | "Fire" | "Metal" | "Water" | "Wood";
export interface Palace {
  earthlyBranch: string; // "Zi", "Chou", etc.
  heavenlyStem?: string; // Determining palace stem (for Flying Stars later)
  index: number; // 0-11 (Earthly Branch Index: 0=Rat/Zi ...)
  key: PalaceKey;
  stars: Star[];
}
export type PalaceKey =
  | "career"
  | "children"
  | "friends"
  | "health"
  | "life"
  | "mental"
  | "parents"
  | "property"
  | "siblings"
  | "spouse"
  | "travel"
  | "wealth";
export type Polarity = "Yang" | "Yin";

export interface Star {
  brightness?: string; // Miao, Wang, De, Li, Ping, Xian, etc. (Optional for now)
  element: Element;
  englishName?: string;
  id: string;
  name?: string;
  polarity?: Polarity; // Made optional as aux stars might not define it strictly in data
  quality: StarQuality;
  transformation?: string; // Ji, Quan, Lu, Ke (Sihua)
}

export type StarQuality = "Auxiliary" | "Central" | "North Star" | "South Star";

export interface ZiWeiCoordinates {
  // Bureau (Ju) - e.g. "Wood 3 Bureau"
  bureau: {
    element: Element;
    name: string; // Keep for now or localize later? Bureau names are technical "Wood 3"
    number: number; // 2,3,4,5,6
  };
  // For easy access to Life Palace
  lifePalace: Palace;

  lunarDate: {
    day: number;
    isLeap: boolean;
    month: number;
    year: number;
  };

  // Core Configuration
  palaces: Record<PalaceKey, Palace>;

  resonance: {
    key: string;
    params: Record<string, string>;
  };

  solarDate: Date;
}
