import {
  BaseInterpretation,
  HellenisticInterpretation,
  SixLangString,
} from "../engine.contract";
import { getGlossaryHints } from "../glossary";
import {
  CLASSICAL_PLANETS,
  HELLENISTIC_HOUSES,
} from "../shards/hellenistic-shards";

// Hellenistic Interpretation Implementation
// ============================================================================

// ============================================================================
// Engine Functions
// ============================================================================

/**
 * Get all house interpretations for a full chart reading
 */
export function getAllHouses(
  locale: string,
): Array<{ houseNumber: number; interpretation: HellenisticInterpretation }> {
  return Object.keys(HELLENISTIC_HOUSES).map((key) => {
    const houseNumber = parseInt(key);
    return {
      houseNumber,
      interpretation: interpretHellenistic(houseNumber, undefined, locale),
    };
  });
}

/**
 * Interpret Hellenistic Astrology (12 Houses + 7 Planets)
 */
export function interpretHellenistic(
  houseNumber: number,
  planetKey?: string,
  locale?: string,
): HellenisticInterpretation {
  const house = HELLENISTIC_HOUSES[houseNumber] || HELLENISTIC_HOUSES[1];

  const result: HellenisticInterpretation = {
    colorTheme: "ancient",
    glossaryHints: getGlossaryHints([
      "hellenisticHouse",
      "classicalPlanet",
      "lotOfFortune",
    ]),
    houseNarrative: house.narrative,
    id: "hellenistic",
    lucideIcon: "Compass",
    summary: {
      en: `The ${house.greekName} (${house.lifeArea.en}) defines your current focus in the Hellenistic tradition.`,
      ko: `${house.greekName} (${house.lifeArea.ko})는 헬레니즘 전통에서 당신의 현재 관심사를 정의합니다.`,
    },
    title: {
      en: `${house.lifeArea.en} (${house.greekName})`,
      es: `${house.lifeArea.es} (${house.greekName})`,
      fr: `${house.lifeArea.fr} (${house.greekName})`,
      ja: `${house.lifeArea.ja} (${house.greekName})`,
      ko: `${house.lifeArea.ko} (${house.greekName})`,
      zh: `${house.lifeArea.zh} (${house.greekName})`,
    },
  };

  if (planetKey) {
    const planet = CLASSICAL_PLANETS[planetKey.toLowerCase()];
    if (planet) {
      result.planetNarrative = planet.narrative;
    }
  }

  return result;
}
