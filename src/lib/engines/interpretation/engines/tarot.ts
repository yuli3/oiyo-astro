import type {
  BaseInterpretation,
  SixLangString,
  TarotInterpretation,
} from "../engine.contract";
import { getGlossaryHints } from "../glossary";
import { MAJOR_ARCANA } from "../shards/tarot-shards";

// Tarot Interpretation Implementation
// ============================================================================

/**
 * Draw a random card for daily reading
 */
export function drawDailyTarotCard(): { cardKey: string; isReversed: boolean } {
  const cards = Object.keys(MAJOR_ARCANA);
  const cardKey = cards[Math.floor(Math.random() * cards.length)];
  const isReversed = Math.random() < 0.3; // 30% chance of reversed

  return { cardKey, isReversed };
}

export function interpretTarot(
  cardKey: string,
  isReversed: boolean = false,
  locale: string,
): TarotInterpretation {
  const cardData = MAJOR_ARCANA[cardKey.toLowerCase()] || MAJOR_ARCANA.fool;

  return {
    cardNarrative: cardData.narrative,
    colorTheme: "mystic",
    glossaryHints: getGlossaryHints(["majorArcana", "tarotReversed"]),
    id: "tarot",
    isReversed,
    lucideIcon: (cardData as any).lucideIcon || "Cards",
    suit: (cardData as any).suit || "Major Arcana",
    summary: {
      en: `The ${cardData.narrative.en.split(":")[0]} reveals a message of ${cardData.upright.en.split(",")[0].toLowerCase()}.`,
      ko: `${cardData.narrative.ko.split(":")[0]} 카드는 ${cardData.upright.ko.split(",")[0]}의 메시지를 전달합니다.`,
    },
    symbol: cardData.symbol,
    title: {
      en: "Tarot Reading",
      es: "Lectura de Tarot",
      fr: "Lecture de Tarot",
      ja: "タロット解釈",
      ko: "타로 해석",
      zh: "塔罗解读",
    },
    uprightKeywords: cardData.upright,
  };
}
