/* eslint-disable no-restricted-syntax */
import { earthlyBranches, heavenlyStems } from "../../ontology/saju/data";
import { analyzeSaju } from "../../ontology/saju/logic";
import { FiveElement, type SajuResult } from "../../ontology/saju/types";
import type { TCIResult } from "../../tci/types";
import type { ResonanceAura, VisualResonanceState } from "./types";

const ELEMENT_COLORS = {
  earth: "#f59e0b", // Amber
  fire: "#ef4444", // Red
  metal: "#94a3b8", // Slate
  water: "#3b82f6", // Blue
  wood: "#10b981", // Emerald
};

export function calculateVisualResonance(
  saju: null | SajuResult,
  tci: null | TCIResult,
  enneagram: null | { primaryType: number } = null,
  riasec: null | { code: string } = null,
): VisualResonanceState {
  // Default Aura
  const aura: ResonanceAura = {
    accentColor: "#cbd5e1",
    frequency: 1,
    geometry: "circle",
    glowIntensity: 0.5,
    primaryColor: "#ffffff",
    secondaryColor: "#f1f5f9",
  };

  // 1. Color (Saju)
  if (saju) {
    const stemData = heavenlyStems[saju.dayMaster];
    const mainElement =
      stemData.element.toLowerCase() as keyof typeof ELEMENT_COLORS;
    aura.primaryColor = ELEMENT_COLORS[mainElement] || ELEMENT_COLORS.earth;

    // Find second strongest element
    const analysis = analyzeSaju(saju);
    const sorted = Object.entries(analysis.elementCounts).sort(
      (a, b) => (b[1] as number) - (a[1] as number),
    );
    const secondaryElement = sorted[1]
      ? (sorted[1][0].toLowerCase() as keyof typeof ELEMENT_COLORS)
      : mainElement;
    aura.secondaryColor = ELEMENT_COLORS[secondaryElement] || aura.primaryColor;
  }

  // 2. Geometry (Enneagram > TCI)
  if (enneagram) {
    // Enneagram Geometry Mapping
    const type = enneagram.primaryType;
    if (type === 1)
      aura.geometry = "circle"; // Perfection
    else if (type === 4)
      aura.geometry = "nebula"; // Identity/Depth
    else if (type === 8)
      aura.geometry = "mandala"; // Power (If supported, or map to closest)
    else if (type === 9)
      aura.geometry = "wave"; // Harmony
    else if (type === 5)
      aura.geometry = "mandala"; // Complex Systems
    else aura.geometry = "circle"; // Default
  } else if (tci) {
    // Fallback to TCI if no Enneagram
    const {
      harmAvoidance: HA,
      noveltySeeking: NS,
      persistence: P,
    } = tci.temperament;
    if (HA > 70) aura.geometry = "wave";
    else if (P > 70) aura.geometry = "mandala";
    else if (NS > 70) aura.geometry = "nebula";
    else aura.geometry = "circle";
  }

  // 3. Frequency & Intensity (TCI & RIASEC)
  if (tci) {
    const {
      noveltySeeking: NS,
      persistence: P,
      rewardDependence: RD,
    } = tci.temperament;
    // Frequency based on Novelty Seeking (NS)
    aura.frequency = 0.5 + (NS / 100) * 1.5;
    // Intensity based on Persistence (P)
    aura.glowIntensity = 0.3 + (P / 100) * 0.7;
    // Main Accent
    aura.accentColor = RD > 70 ? "#f472b6" : "#435D31";
  }

  // RIASEC modulation
  if (riasec) {
    // If Artistic (A), boost frequency variation
    if (riasec.code.includes("A")) {
      aura.frequency *= 1.2;
    }
    // If Conventional (C), stabilize geometry (reset to circle/mandala if barely wave)
    if (riasec.code.includes("C") && aura.geometry === "wave") {
      aura.geometry = "circle";
    }
  }

  return {
    aura,
    harmonyScore: calculateHarmonyScore(saju, tci),
  };
}

function calculateHarmonyScore(
  saju: null | SajuResult,
  tci: null | TCIResult,
): number {
  if (!saju || !tci) return 50;

  // Simple logic: If dominant element matches temperament type (approximate)
  // Fire/Wood + High NS -> High Harmony
  const isExtroverted = tci.temperament.noveltySeeking > 50;
  const stemData = heavenlyStems[saju.dayMaster];
  const isHotElement = ["fire", "wood"].includes(
    stemData.element.toLowerCase(),
  );

  if (isExtroverted === isHotElement) return 85;
  return 65;
}
