import { Locale } from "@/i18n";
import { MayanEngine } from "@/lib/ontology/engines/mayan";
import { WisdomInsight } from "@/lib/ontology/synapse/BaseEngineInterface";

/**
 * OntologySynapse (Daily Feed Aggregator)
 *
 * Aggregates insights from all registered ontology engines.
 * Implements "The Synapse Transition".
 */

export async function getWisdomTicker(
  date: Date,
  locale: Locale,
): Promise<WisdomInsight[]> {
  const insights: WisdomInsight[] = [];

  try {
    // 1. Mayan Wisdom
    // In future, wrap in Promise.allSettled to prevent one engine from blocking others
    const mayanWisdom = await MayanEngine.getDailyWisdom(date, locale);
    insights.push(mayanWisdom);

    // 2. Future: Egyptian, Kabbalah...
  } catch (error) {
    console.error("Synapse Error:", error);
    // Fail gracefully with empty list or fallback
  }

  return insights;
}
