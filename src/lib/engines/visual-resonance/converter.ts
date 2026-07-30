/* eslint-disable no-restricted-syntax */
import type { SajuAnalysis } from "../../ontology/saju/types";
import type { TCIResult } from "../../tci/types";

export interface ResonanceVisuals {
  "--resonance-blur": string;
  "--resonance-color": string;
  "--resonance-color-secondary": string;
  "--resonance-opacity": string;
  "--resonance-scale": string;
  "--resonance-speed": string;
}

const ELEMENT_COLORS = {
  earth: "#F59E0B",
  fire: "#EF4444",
  metal: "#F8FAFC",
  water: "#3B82F6",
  wood: "#10B981",
};

export function getResonanceStyles(
  saju: null | SajuAnalysis,
  tci: null | TCIResult,
  manifestStyling?: {
    ariaColor?: string;
    auraColor?: string;
    frequency?: number;
  },
): ResonanceVisuals {
  // Default values
  let color = "#A78BFA"; // Violet-400
  let secondaryColor = "#8B5CF6"; // Violet-500
  let speed = "10s";
  let blur = "60px";
  let scale = "1";
  let opacity = "0.4";

  if (manifestStyling?.auraColor) {
    color = manifestStyling.auraColor;
    if (manifestStyling.frequency) {
      // High frequency = faster speed. Base 10s.
      const speedVal = 10 / manifestStyling.frequency;
      speed = `${speedVal.toFixed(1)}s`;
    }
  } else if (saju) {
    const mainEl =
      saju.dominantElement.toLowerCase() as keyof typeof ELEMENT_COLORS;
    color = ELEMENT_COLORS[mainEl] || color;

    // Pick secondary color based on second strongest or complementary
    const sorted = Object.entries(saju.elementCounts).sort(
      (a, b) => b[1] - a[1],
    );
    const secEl = sorted[1]?.[0].toLowerCase() as keyof typeof ELEMENT_COLORS;
    secondaryColor = ELEMENT_COLORS[secEl] || color;
  }

  if (tci) {
    const { harmAvoidance, noveltySeeking, rewardDependence } = tci.temperament;

    // NS (Novelty Seeking) -> Speed
    // High NS (0-100) -> Faster speed
    const speedVal = 15 - (noveltySeeking / 100) * 12; // 3s to 15s
    speed = `${speedVal.toFixed(1)}s`;

    // HA (Harm Avoidance) -> Scale/Protection
    // High HA -> Smaller, more contained (Protective)
    const scaleVal = 1.2 - (harmAvoidance / 100) * 0.4; // 0.8 to 1.2
    scale = scaleVal.toFixed(2);

    // RD (Reward Dependence) -> Blur/Diffusion
    // High RD -> Softer, more diffused
    const blurVal = 40 + (rewardDependence / 100) * 80; // 40px to 120px
    blur = `${blurVal.toFixed(0)}px`;

    // Adjust opacity based on persistence
    const persistence = tci.temperament.persistence;
    const opacityVal = 0.2 + (persistence / 100) * 0.4; // 0.2 to 0.6
    opacity = opacityVal.toFixed(2);
  }

  return {
    "--resonance-blur": blur,
    "--resonance-color": color,
    "--resonance-color-secondary": secondaryColor,
    "--resonance-opacity": opacity,
    "--resonance-scale": scale,
    "--resonance-speed": speed,
  };
}
