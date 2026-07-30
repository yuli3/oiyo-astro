import type { Locale } from "@/i18n";
import { calculateMayanKin } from "@/lib/ontology/mayan/calculator";
import type {
  BaseEngineInterface,
  WisdomInsight,
} from "@/lib/ontology/synapse/BaseEngineInterface";

/**
 * MayanEngine
 *
 * Adapts the legacy Mayan calculator to the new Synapse Protocol.
 * Implements "The Soul Atlas" directive for Daily Wisdom.
 */
export const MayanEngine: BaseEngineInterface = {
  getDailyWisdom: async (
    date: Date,
    locale: Locale,
  ): Promise<WisdomInsight> => {
    // 0. Ensure lightweight execution (no heavy DB calls)
    const kin = calculateMayanKin(date);

    if (!kin) {
      return {
        category: "SPIRIT",
        content: {
          key: "ontology.mayan.void",
          params: {},
        } as any, // Using structured i18n
        icon: "Sparkles",
        id: "mayan-void",
        source: "MAYAN",
      };
    }

    // 1. Construct Insight Content
    // Title is composed of Tone name and Seal name keys
    const title = {
      key: "ontology.mayan.title_template",
      params: {
        seal: `ontology.mayan.seals.${kin.seal.id}.name`,
        tone: `ontology.mayan.tones.${kin.tone.number}.name`,
      },
    };

    // 2. Map Color to Category
    const categoryMap: Record<
      string,
      "CELESTIAL" | "EARTH" | "HUMAN" | "SPIRIT"
    > = {
      blue: "CELESTIAL", // Transforms/Sky
      red: "EARTH", // Initiates/Birth
      white: "SPIRIT", // Refines/Spirit
      yellow: "HUMAN", // Ripens/Human
    };

    return {
      category: categoryMap[kin.seal.color] || "SPIRIT",
      content: {
        key: "ontology.mayan.daily_wisdom.intro",
        params: {
          keyword: `ontology.mayan.seals.${kin.seal.key}.keywords.2`,
          title: `ontology.mayan.tones.${kin.tone.key}.name ontology.mayan.seals.${kin.seal.key}.name`,
        },
      } as any,
      icon: "Sun",
      id: `mayan-${kin.kinNumber}`,
      relevance: 1.0,
      source: "MAYAN",
    };
  },
};
