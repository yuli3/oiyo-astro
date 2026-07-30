import type { SajuResult } from "../../ontology/saju/types";
import type { TCIResult } from "../../tci/types";

export interface ResonanceAura {
  accentColor: string;
  frequency: number; // Hz for animation
  geometry: "circle" | "mandala" | "nebula" | "wave";
  glowIntensity: number; // 0-1
  primaryColor: string;
  secondaryColor: string;
}

export interface VisualResonanceState {
  aura: ResonanceAura;
  harmonyScore: number;
}
