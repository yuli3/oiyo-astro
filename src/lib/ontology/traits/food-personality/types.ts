import { Locale } from "@/i18n";

export interface FoodPersonalityQuestion {
  emoji: string;
  id: string;
  options: {
    emoji: string;
    id: string;
    scores: Record<FoodPersonalityType, number>;
    text: string;
  }[];
  text: string;
}

export interface FoodPersonalityResult {
  cookingStyle: string;
  description: string;
  idealCuisines: string[];
  percentages: Record<FoodPersonalityType, number>;
  primary: FoodPersonalityType;
  restaurantStyle: string;
  scores: Record<FoodPersonalityType, number>;
  secondary: FoodPersonalityType;
  traits: string[];
}

export type FoodPersonalityType =
  | "adventurer"
  | "minimalist"
  | "perfectionist"
  | "social"
  | "traditionalist";

export const FOOD_PERSONALITY_LABELS: Record<
  Locale,
  Record<FoodPersonalityType, string>
> = {
  cn: {
    adventurer: "The Culinary Adventurer",
    minimalist: "The Simple Eater",
    perfectionist: "The Gourmet Perfectionist",
    social: "The Social Foodie",
    traditionalist: "The Comfort Food Lover",
  },
  en: {
    adventurer: "The Culinary Adventurer",
    minimalist: "The Simple Eater",
    perfectionist: "The Gourmet Perfectionist",
    social: "The Social Foodie",
    traditionalist: "The Comfort Food Lover",
  },
  es: {
    adventurer: "The Culinary Adventurer",
    minimalist: "The Simple Eater",
    perfectionist: "The Gourmet Perfectionist",
    social: "The Social Foodie",
    traditionalist: "The Comfort Food Lover",
  },
  fr: {
    adventurer: "The Culinary Adventurer",
    minimalist: "The Simple Eater",
    perfectionist: "The Gourmet Perfectionist",
    social: "The Social Foodie",
    traditionalist: "The Comfort Food Lover",
  },
  ja: {
    adventurer: "The Culinary Adventurer",
    minimalist: "The Simple Eater",
    perfectionist: "The Gourmet Perfectionist",
    social: "The Social Foodie",
    traditionalist: "The Comfort Food Lover",
  },
  ko: {
    adventurer: "미식 모험가",
    minimalist: "심플 이터",
    perfectionist: "미식 완벽주의자",
    social: "소셜 푸디",
    traditionalist: "편안한 음식 애호가",
  },
};

export const FOOD_PERSONALITY_DESCRIPTIONS: Record<
  Locale,
  Record<FoodPersonalityType, string>
> = {
  cn: {
    adventurer: "",
    minimalist: "",
    perfectionist: "",
    social: "",
    traditionalist: "",
  },
  en: {
    adventurer: "You're always seeking new flavors and exotic cuisines.",
    minimalist: "You prefer simple, clean flavors and uncomplicated meals.",
    perfectionist:
      "You have refined tastes and high standards for food quality.",
    social: "Food is a social experience for you.",
    traditionalist: "You find comfort in familiar flavors and classic recipes.",
  },
  es: {
    adventurer: "",
    minimalist: "",
    perfectionist: "",
    social: "",
    traditionalist: "",
  },
  fr: {
    adventurer: "",
    minimalist: "",
    perfectionist: "",
    social: "",
    traditionalist: "",
  },
  ja: {
    adventurer: "",
    minimalist: "",
    perfectionist: "",
    social: "",
    traditionalist: "",
  },
  ko: {
    adventurer: "당신은 항상 새로운 맛과 이국적인 요리를 찾고 있어요.",
    minimalist: "당신은 간단하고 깔끔한 맛과 복잡하지 않은 식사를 선호해요.",
    perfectionist:
      "당신은 세련된 취향과 음식 품질에 대한 높은 기준을 가지고 있어요.",
    social: "음식은 당신에게 사회적 경험이에요.",
    traditionalist: "당신은 익숙한 맛과 전통적인 레시피에서 위안을 찾아요.",
  },
};

// Backfill missing locales for descriptions
["ja", "zh", "es", "fr"].forEach((loc) => {
  (FOOD_PERSONALITY_DESCRIPTIONS as any)[loc] =
    FOOD_PERSONALITY_DESCRIPTIONS.en;
});

export const FOOD_PERSONALITY_TRAITS: Record<
  Locale,
  Record<FoodPersonalityType, string[]>
> = {
  cn: {
    adventurer: [],
    minimalist: [],
    perfectionist: [],
    social: [],
    traditionalist: [],
  },
  en: {
    adventurer: ["New cuisines", "Exotic spices", "Food markets"],
    minimalist: ["Clean flavors", "Nutritional quality", "Seasonal"],
    perfectionist: ["Refined taste", "Quality ingredients", "Presentation"],
    social: ["Dining out", "Food brings people together", "Atmosphere"],
    traditionalist: ["Family recipes", "Comfort flavors", "Home-cooked"],
  },
  es: {
    adventurer: [],
    minimalist: [],
    perfectionist: [],
    social: [],
    traditionalist: [],
  },
  fr: {
    adventurer: [],
    minimalist: [],
    perfectionist: [],
    social: [],
    traditionalist: [],
  },
  ja: {
    adventurer: [],
    minimalist: [],
    perfectionist: [],
    social: [],
    traditionalist: [],
  },
  ko: {
    adventurer: ["새로운 요리", "이국적인 향신료", "음식 시장"],
    minimalist: ["깔끔한 맛", "영양 품질", "제철 재료"],
    perfectionist: ["세련된 취향", "품질 좋은 재료", "플레이팅"],
    social: ["외식 선호", "사람들과의 식사", "분위기"],
    traditionalist: ["가족 레시피", "익숙한 맛", "집밥"],
  },
};

// Backfill missing locales for traits
["ja", "zh", "es", "fr"].forEach((loc) => {
  (FOOD_PERSONALITY_TRAITS as any)[loc] = FOOD_PERSONALITY_TRAITS.en;
});

export const FOOD_PERSONALITY_CUISINES: Record<FoodPersonalityType, string[]> =
  {
    adventurer: [
      "Thai",
      "Ethiopian",
      "Peruvian",
      "Korean BBQ",
      "Indian Street Food",
    ],
    minimalist: [
      "Mediterranean",
      "Scandinavian",
      "Japanese",
      "Farm-to-Table",
      "Vegetarian",
    ],
    perfectionist: [
      "French Fine Dining",
      "Japanese Kaiseki",
      "Molecular Gastronomy",
      "Wine Country Cuisine",
      "Nordic",
    ],
    social: [
      "Mediterranean",
      "Mexican",
      "Spanish Tapas",
      "Brazilian BBQ",
      "Lebanese Mezze",
    ],
    traditionalist: [
      "Italian",
      "American Comfort Food",
      "French Bistro",
      "Southern Cuisine",
      "British Pub Food",
    ],
  };
