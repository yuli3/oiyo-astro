import type { Locale } from "@/i18n";

import { FOOD_PERSONALITY_QUESTIONS } from "./data";
import {
  FOOD_PERSONALITY_CUISINES,
  FOOD_PERSONALITY_DESCRIPTIONS,
  FOOD_PERSONALITY_LABELS,
  FOOD_PERSONALITY_TRAITS,
  type FoodPersonalityQuestion,
  type FoodPersonalityResult,
  type FoodPersonalityType,
} from "./types";

// Map missing locales to English for questions if they are not defined
if (!(FOOD_PERSONALITY_QUESTIONS as any)["ja"]) {
  (FOOD_PERSONALITY_QUESTIONS as any)["ja"] = FOOD_PERSONALITY_QUESTIONS.en;
}
if (!(FOOD_PERSONALITY_QUESTIONS as any)["zh"]) {
  (FOOD_PERSONALITY_QUESTIONS as any)["zh"] = FOOD_PERSONALITY_QUESTIONS.en;
}
if (!(FOOD_PERSONALITY_QUESTIONS as any)["es"]) {
  (FOOD_PERSONALITY_QUESTIONS as any)["es"] = FOOD_PERSONALITY_QUESTIONS.en;
}
if (!(FOOD_PERSONALITY_QUESTIONS as any)["fr"]) {
  (FOOD_PERSONALITY_QUESTIONS as any)["fr"] = FOOD_PERSONALITY_QUESTIONS.en;
}

export function calculateFoodPersonalityResult(
  answers: Record<string, string>,
  locale: Locale = "en",
): FoodPersonalityResult {
  const scores: Record<FoodPersonalityType, number> = {
    adventurer: 0,
    minimalist: 0,
    perfectionist: 0,
    social: 0,
    traditionalist: 0,
  };

  Object.entries(answers).forEach(([questionId, optionId]) => {
    const question = (
      FOOD_PERSONALITY_QUESTIONS[locale] as FoodPersonalityQuestion[]
    ).find((q) => q.id === questionId);
    if (question) {
      const option = question.options.find((o) => o.id === optionId);
      if (option) {
        Object.entries(option.scores).forEach(([type, score]) => {
          scores[type as FoodPersonalityType] += score as number;
        });
      }
    }
  });

  const totalScore =
    Object.values(scores).reduce((sum, score) => sum + score, 0) || 1;
  const percentages: Record<FoodPersonalityType, number> = {} as Record<
    FoodPersonalityType,
    number
  >;

  Object.entries(scores).forEach(([type, score]) => {
    percentages[type as FoodPersonalityType] = Math.round(
      (score / totalScore) * 100,
    );
  });

  const sortedTypes = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([type]) => type as FoodPersonalityType);

  const primary = sortedTypes[0];
  const secondary = sortedTypes[1];

  const restaurantStyles: Record<FoodPersonalityType, string> = {
    adventurer:
      "Ethnic restaurants, food trucks, hole-in-the-wall gems with authentic cuisine",
    minimalist:
      "Farm-to-table restaurants, cafes with simple menus, places focusing on quality ingredients",
    perfectionist:
      "Fine dining establishments, restaurants with renowned chefs and exceptional service",
    social:
      "Lively restaurants with shareable plates, outdoor patios, places with great ambiance",
    traditionalist:
      "Family-owned restaurants, diners, establishments with long-standing reputations",
  };

  const cookingStyles: Record<FoodPersonalityType, string> = {
    adventurer:
      "Experimental fusion cooking, trying recipes from different cultures, using exotic spices",
    minimalist:
      "Simple preparation methods, fresh seasonal ingredients, clean flavors",
    perfectionist:
      "Precision cooking, high-end ingredients, restaurant-quality presentation",
    social:
      "Cooking for groups, shareable dishes, interactive cooking experiences",
    traditionalist:
      "Classic techniques, family recipes, comfort food with familiar flavors",
  };

  return {
    cookingStyle: cookingStyles[primary],
    description: FOOD_PERSONALITY_DESCRIPTIONS[locale][primary],
    idealCuisines: FOOD_PERSONALITY_CUISINES[primary],
    percentages,
    primary,
    restaurantStyle: restaurantStyles[primary],
    scores,
    secondary,
    traits: FOOD_PERSONALITY_TRAITS[locale][primary],
  };
}
