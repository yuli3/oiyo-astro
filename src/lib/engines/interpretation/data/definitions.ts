export interface InterpretationDefinition {
  id: string; // e.g. "fire_dm"
  source: "astrology" | "enneagram" | "mbti" | "saju" | "tci";
  trait: string; // e.g. "BYEONG" or "INTJ"
}

export const INTERPRETATION_DEFINITIONS: InterpretationDefinition[] = [
  // SAJU Day Masters
  { id: "fire_dm", source: "saju", trait: "BYEONG" },
  { id: "water_dm", source: "saju", trait: "IM" },
  { id: "wood_dm", source: "saju", trait: "GAP" },
  { id: "earth_dm", source: "saju", trait: "MU" },
  { id: "metal_dm", source: "saju", trait: "GYEONG" },
  { id: "wood_yin_dm", source: "saju", trait: "EUL" },
  { id: "fire_yin_dm", source: "saju", trait: "JEONG" },
  { id: "earth_yin_dm", source: "saju", trait: "GI" },
  { id: "metal_yin_dm", source: "saju", trait: "SIN" },
  { id: "water_yin_dm", source: "saju", trait: "GYE" },

  // MBTI
  { id: "advocate", source: "mbti", trait: "INFJ" },
  { id: "campaigner", source: "mbti", trait: "ENFP" },
  { id: "architect", source: "mbti", trait: "INTJ" },
];
