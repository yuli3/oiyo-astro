import { Locale } from "@/i18n";
import { features } from "@/registry/features";

export type TestCategory =
  | "achievements"
  | "development"
  | "entertainment"
  | "lifestyle"
  | "personality"
  | "relationships"
  | "wellness";

export interface TestItem {
  category: TestCategory;
  description: string;
  difficulty: "advanced" | "beginner" | "intermediate";
  estimatedTime: number; // in minutes
  featured?: boolean;
  href: string;
  id: string;
  new?: boolean;
  popularity: number;
  tags?: string[];
  title: string;
}

export const testCatalog: Record<string, TestItem[]> = {
  zh: [],
  en: [],
  es: [],
  fr: [],
  ja: [],
  ko: [],
};

// Helper function to convert feature registry to test catalog format
export function buildTestCatalogFromFeatures(): Record<string, TestItem[]> {
  const locales = ["en", "ko", "ja", "zh", "es", "fr"];

  return locales.reduce(
    (acc, locale) => {
      acc[locale] = Object.values(features)
        .filter((feature) => {
          const cats = Array.isArray(feature.category)
            ? feature.category
            : feature.category
              ? [feature.category]
              : [];
          // Check legacy or new domain
          return (
            feature.domain === "ontology" ||
            cats.includes("ontology" as any) ||
            cats.includes("assessment" as any)
          );
        })
        .map((feature) => {
          const cats = Array.isArray(feature.category)
            ? feature.category
            : feature.category
              ? [feature.category]
              : [];
          const primaryCat = cats[0] || "personality";
          const loc = locale as Locale;

          const localizedTitle =
            feature.seo?.title?.[loc] ||
            feature.seo?.title?.en ||
            feature.name?.[loc] ||
            feature.name?.en ||
            feature.id;
          const localizedDesc =
            feature.seo?.description?.[loc] ||
            feature.seo?.description?.en ||
            feature.description?.[loc] ||
            feature.description?.en ||
            "";

          return {
            category: mapFeatureToTestCategory(primaryCat),
            description: localizedDesc,
            difficulty: "beginner" as const,
            estimatedTime: 10,
            featured:
              feature.badge === "viral" || feature.status === "production",
            href: feature.path,
            id: feature.id,
            new: feature.badge === "new",
            popularity: Math.floor(Math.random() * 100),
            tags: [],
            title: localizedTitle,
          };
        });
      return acc;
    },
    {} as Record<string, TestItem[]>,
  );
}

function mapFeatureToTestCategory(category: string): TestCategory {
  const categoryMap: Record<string, TestCategory> = {
    assessment: "personality",
    career: "development",
    finance: "development",
    fortune: "entertainment",
    lifestyle: "lifestyle",
    mental: "wellness",
    ontology: "personality",
    productivity: "development",
    relationship: "relationships",
    resonance: "relationships",
    wellness: "wellness",
    wisdom: "entertainment",
  };

  return categoryMap[category] || "personality";
}
