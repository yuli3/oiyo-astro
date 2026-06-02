import {
  RichInterpretationResult,
  UniversalInterpretationResult,
} from "./engine.contract";

/**
 * RichDisplayMapper
 * Maps raw interpretation data to UI/UX components (icons, themes).
 * Decouples display preferences from the core logic.
 */
export class RichDisplayMapper {
  /**
   * Enriches the interpretation result with UI metadata.
   */
  public static mapDisplay(
    results: UniversalInterpretationResult,
  ): Record<string, { icon: string; theme: string }> {
    const displayMap: Record<string, { icon: string; theme: string }> = {};

    // 1. System-level Icon/Theme Mapping
    if (results.saju) {
      displayMap.saju = {
        icon: "Compass",
        theme: this.getSajuTheme(results.saju),
      };
    }

    if (results.tarot) {
      displayMap.tarot = {
        icon: "Cards",
        theme: "mystic",
      };
    }

    if (results.nordic) {
      displayMap.nordic = {
        icon: "Mountain",
        theme: "nature",
      };
    }

    if (results.ziwei) {
      displayMap.ziwei = {
        icon: "Star",
        theme: "stellar",
      };
    }

    if (results.kabbalah) {
      displayMap.kabbalah = {
        icon: "Tree",
        theme: "esoteric",
      };
    }

    if (results.mayan) {
      displayMap.mayan = {
        icon: "Sun",
        theme: "solar",
      };
    }

    return displayMap;
  }

  /**
   * Determines the Saju theme based on the dominant element.
   */
  private static getSajuTheme(saju: any): string {
    const dominant = saju.elementalPattern?.pattern || "";
    if (dominant.includes("Fire")) return "fire-theme";
    if (dominant.includes("Water")) return "water-theme";
    if (dominant.includes("Wood")) return "wood-theme";
    if (dominant.includes("Metal")) return "metal-theme";
    return "earth-theme";
  }
}
