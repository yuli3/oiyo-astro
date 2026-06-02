export interface CountryMatch {
  bestFor: string[];
  climate: string;
  cons: string[];
  continent: string;
  currency: string;
  flag: string;
  language: string[];
  matchPercentage: number;
  metrics: CountryMetrics;
  name: string;
  population: string;
  pros: string[];
  vibe: string;
}

export interface CountryMetrics {
  costOfLiving: "High" | "Low" | "Medium" | "Very High";
  healthcare: number; // out of 10
  internetSpeed: number; // Mbps
  qualityOfLife: number; // out of 10
  safety: number; // out of 10
}

export interface CountryPreferenceQuestion {
  emoji: string;
  id: string;
  options: {
    emoji: string;
    id: string;
    scores: Partial<Record<CountryPreferenceType, number>>;
    text: string;
  }[];
  text: string;
}

export interface CountryPreferenceResult {
  climate: string;
  culture: string;
  description: string;
  economy: string;
  lifestyle: string;
  percentages: Record<CountryPreferenceType, number>;
  primary: CountryPreferenceType;
  recommendedCountries: CountryMatch[];
  scores: Record<CountryPreferenceType, number>;
  secondary: CountryPreferenceType;
  traits: string[];
}

export type CountryPreferenceType =
  | "coastal"
  | "cosmopolitan"
  | "cultural"
  | "mediterranean"
  | "modern"
  | "mountainous"
  | "nordic"
  | "tropical";

export const COUNTRY_PREFERENCE_LABELS: Record<CountryPreferenceType, string> =
  {
    coastal: "The Ocean Enthusiast",
    cosmopolitan: "The Global Citizen",
    cultural: "The Heritage Appreciator",
    mediterranean: "The Mediterranean Lover",
    modern: "The Tech-Forward Pioneer",
    mountainous: "The Mountain Explorer",
    nordic: "The Nordic Seeker",
    tropical: "The Tropical Paradise Dweller",
  };

export const COUNTRY_PREFERENCE_DESCRIPTIONS: Record<
  CountryPreferenceType,
  string
> = {
  coastal:
    "The ocean calls to you with its endless horizons and soothing rhythms. Coastal living provides the perfect blend of natural beauty, maritime culture, and the calming presence of water.",
  cosmopolitan:
    "You crave diversity, innovation, and endless opportunities. Major global cities with their cultural melting pots, career prospects, and 24/7 energy are where you feel most alive and inspired.",
  cultural:
    "You're fascinated by deep-rooted traditions, historical significance, and authentic local customs. Countries with rich cultural heritage and well-preserved traditions speak to your appreciation for human history.",
  mediterranean:
    "You're drawn to warm climates, rich history, and vibrant food cultures. The Mediterranean lifestyle of leisurely meals, strong community bonds, and appreciation for art and beauty appeals to your soul.",
  modern:
    "You're attracted to cutting-edge technology, efficient systems, and forward-thinking societies. Modern, innovative countries with excellent infrastructure and progressive values align with your worldview.",
  mountainous:
    "You find peace in elevated places with fresh air and stunning vistas. Mountain regions offer you the perfect combination of natural beauty, outdoor activities, and close-knit communities.",
  nordic:
    "You appreciate clean air, social equality, and stunning natural landscapes. The Nordic way of life, with its emphasis on work-life balance, environmental consciousness, and hygge culture, resonates deeply with you.",
  tropical:
    "Year-round warmth, lush greenery, and a relaxed pace of life are your ideals. You thrive in environments where nature is abundant and the living is easy, with plenty of outdoor activities and natural beauty.",
};

export const COUNTRY_PREFERENCE_TRAITS: Record<
  CountryPreferenceType,
  string[]
> = {
  coastal: [
    "Drawn to ocean views and sea breezes",
    "Enjoys water sports and maritime activities",
    "Appreciates fresh seafood and coastal cuisine",
    "Values the calming effect of water",
    "Prefers moderate, maritime climates",
  ],
  cosmopolitan: [
    "Enjoys cultural diversity and international cuisine",
    "Thrives in fast-paced, dynamic environments",
    "Values career opportunities and networking",
    "Appreciates world-class arts and entertainment",
    "Seeks constant stimulation and novelty",
  ],
  cultural: [
    "Fascinated by ancient history and traditions",
    "Enjoys visiting museums and historical sites",
    "Appreciates authentic local crafts and arts",
    "Values cultural preservation and heritage",
    "Seeks meaningful connections with local customs",
  ],
  mediterranean: [
    "Enjoys warm weather and outdoor dining",
    "Appreciates rich culinary traditions",
    "Values family and community connections",
    "Loves historical architecture and art",
    "Prefers a relaxed, unhurried lifestyle",
  ],
  modern: [
    "Attracted to technological innovation",
    "Values efficient public transportation",
    "Appreciates modern architecture and design",
    "Enjoys smart city features and digital services",
    "Prefers progressive social policies",
  ],
  mountainous: [
    "Loves hiking, skiing, and mountain sports",
    "Appreciates dramatic landscapes and fresh air",
    "Values self-sufficiency and resilience",
    "Enjoys close-knit mountain communities",
    "Seeks tranquility away from urban noise",
  ],
  nordic: [
    "Values work-life balance and social welfare",
    "Appreciates minimalist design and functionality",
    "Enjoys outdoor activities in pristine nature",
    "Prefers egalitarian and transparent societies",
    "Finds peace in quiet, orderly environments",
  ],
  tropical: [
    "Thrives in warm, humid climates",
    "Enjoys beach and water activities",
    "Appreciates lush natural environments",
    "Values laid-back, friendly cultures",
    "Seeks year-round outdoor living",
  ],
};

export interface CountryData {
  [key: string]: Omit<CountryMatch, "matchPercentage">;
}
