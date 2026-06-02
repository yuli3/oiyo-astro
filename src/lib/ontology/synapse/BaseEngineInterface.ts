import { Locale } from "@/i18n";

/**
 * BaseEngineInterface
 *
 * The contract for "Awakening the Sleeping Giants".
 * All dormant libraries (Mayan, Egyptian, etc.) must implement this to plug into the Synapse.
 */
export interface BaseEngineInterface {
  /**
   * Rapidly retrieves the daily wisdom for the ticker.
   * MUST be lightweight and synchronous-like (fast Promise).
   */
  getDailyWisdom(date: Date, locale: Locale): Promise<WisdomInsight>;

  /**
   * Optional: Returns a deeper analysis if the user clicks the ticker.
   */
  getDeepInsight?(date: Date, locale: Locale, profile?: any): Promise<any>;
}

/**
 * Wisdom Insight Structure
 * Used for the "Wisdom Ticker" to display bite-sized insights in the mandated 0.1s window.
 */
export interface WisdomInsight {
  /**
   * Optional categorization for color coding
   */
  category?: "CELESTIAL" | "EARTH" | "HUMAN" | "SPIRIT";
  /**
   * The core message (e.g., "Today is the day of the Blue Monkey")
   */
  content: string;
  /**
   * Icon name for DynamicIcon component
   */
  icon: string;
  id: string;
  /**
   * Relevancy score (0-1) for sorting/prioritization
   */
  relevance?: number;

  /**
   * The source library (e.g., 'MAYAN', 'EGYPTIAN', 'KABBALAH')
   */
  source: string;
}
