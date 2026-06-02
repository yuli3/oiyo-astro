/**
 * THE RESONANCE ENGINE
 * The Core Synthesis Logic for the Grand Oracle
 *
 * "From the chaos of stars and numbers, a single voice emerges."
 */

import { heavenlyStems } from "../saju/data";
import { FiveElement as SajuElement } from "../saju/types";
import { Element as ZiweiElement } from "../ziwei/types";
import { UniversalChronosCoordinates } from "./types";

export interface NarrativeBlock {
  key: string;
  params?: Record<string, string>;
}

export interface Prophecy {
  coreIdentity: {
    archetype: string; // "radiant_catalyst" (ID for lookup)
    powerKeywords: string[]; // Empty, UI fetches from oracle.json
  };
  crossRef: {
    eastern: string; // "Horse"
    sajuKey: string; // "saju.stems.byeong"
    synergy: NarrativeBlock;
    western: string; // "Aries"
  };
  elementalBalance: {
    dominant: string; // "Fire"
    missing: string[]; // ["Water"]
    suggestion: NarrativeBlock;
  };
  narrative: {
    body: NarrativeBlock;
    conclusion: NarrativeBlock;
    intro: NarrativeBlock;
  };
}

export class ResonanceEngine {
  /**
   * Synthesize all coordinates into a single Prophecy
   */
  static generateProphecy(coords: UniversalChronosCoordinates): Prophecy {
    const weights = this.calculateElementalWeights(coords);
    const dominantElement = this.getDominantElement(weights);
    const missingElements = this.getMissingElements(weights);
    const archetypeId = this.determineArchetypeId(dominantElement); // Returns ID like 'radiant_catalyst'

    return {
      coreIdentity: {
        archetype: archetypeId,
        powerKeywords: [], // UI will fetch from oracle.json using archetypeId
      },
      crossRef: {
        eastern:
          coords.saju?.year.earthlyBranch ||
          coords.ziwei.lifePalace.earthlyBranch ||
          "Guardian",
        sajuKey: coords.saju
          ? `saju.stems.${coords.saju.dayMaster.toLowerCase()}`
          : "",
        synergy: this.detectCrossSystemSynergy(coords, dominantElement),
        western: coords.zodiac.sign,
      },
      elementalBalance: {
        dominant: dominantElement,
        missing: missingElements,
        suggestion: {
          key:
            missingElements.length > 0
              ? "oracle.suggestions.balance"
              : "oracle.suggestions.harmony",
          params: { missing: missingElements[0] || "" },
        },
      },
      narrative: {
        body: {
          key: "oracle.narrative.body",
          params: {
            easternSign:
              coords.saju?.year.earthlyBranch ||
              coords.ziwei.lifePalace.earthlyBranch ||
              "Guardian",
            element: dominantElement,
            westernSign: coords.zodiac.sign,
          },
        },
        conclusion: {
          key: "oracle.narrative.conclusion",
          params: { element: dominantElement },
        },
        intro: {
          key: "oracle.narrative.intro",
          params: { archetype: archetypeId }, // UI must translate archetypeId
        },
      },
    };
  }

  private static calculateElementalWeights(
    coords: UniversalChronosCoordinates,
  ): Record<string, number> {
    const weights: Record<string, number> = {
      Air: 0,
      Earth: 0,
      Ether: 0,
      Fire: 0,
      Metal: 0,
      Water: 0,
      Wood: 0,
    };

    // 1. Western Zodiac (High Weight)
    if (coords.zodiac.element) weights[coords.zodiac.element] += 3;

    // 2. Saju (Day Master = Core Self)
    if (coords.saju) {
      const dm = coords.saju.dayMaster;
      const stemData = heavenlyStems[dm];
      if (stemData) {
        // Normalize Saju Element (lowercase enum) to TitleCase
        const el =
          stemData.element.charAt(0).toUpperCase() + stemData.element.slice(1);
        if (weights[el] !== undefined) {
          weights[el] += 3;
        } else {
          // Fallback for Wood/Metal mismatch with Western if any
          weights[el] = 3;
        }
      }
    }

    // 3. Vedic (Nakshatra Element)
    if (coords.vedic.nakshatra.element) {
      weights[coords.vedic.nakshatra.element] += 2;
    }

    // 4. Ziwei (Main Star Element)
    const mainStar = coords.ziwei.lifePalace.stars[0];
    if (mainStar) {
      // Should be already capitalized e.g. "Earth"
      if (weights[mainStar.element] !== undefined) {
        weights[mainStar.element] += 2;
      }
    }

    return weights;
  }

  private static detectCrossSystemSynergy(
    coords: UniversalChronosCoordinates,
    dominant: string,
  ): NarrativeBlock {
    // Check for "True Resonance" (e.g. Western Fire + Saju Fire)
    const westernEl = coords.zodiac.element;

    // We need to check Saju element again
    let sajuEl = "";
    if (coords.saju) {
      const dm = coords.saju.dayMaster;
      const stemData = heavenlyStems[dm];
      if (stemData)
        sajuEl =
          stemData.element.charAt(0).toUpperCase() + stemData.element.slice(1);
    }

    if (westernEl === dominant && sajuEl === dominant) {
      return {
        key: "oracle.synergies.convergence",
        params: { element: dominant },
      };
    }

    return {
      key: "oracle.synergies.synthesis",
      params: { element: dominant },
    };
  }

  private static determineArchetypeId(dominant: string): string {
    switch (dominant) {
      case "Air":
        return "messenger";
      case "Earth":
        return "architect";
      case "Ether":
        return "spirit_walker";
      case "Fire":
        return "radiant_catalyst";
      case "Metal":
        return "refiner";
      case "Water":
        return "deep_seer";
      case "Wood":
        return "growth_maker";
      default:
        return "universal_traveler";
    }
  }

  private static getDominantElement(weights: Record<string, number>): string {
    return Object.entries(weights).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  }

  private static getMissingElements(weights: Record<string, number>): string[] {
    return Object.entries(weights)
      .filter(([_, val]) => val === 0)
      .map(([key]) => key);
  }
}
