import { Locale } from "@/i18n";
import { getLocalizedContent } from "@/lib/system/i18n/locale-utils";
import { features } from "@/registry/features";

export interface SearchResult {
  category: string;
  description: string;
  emoji: string;
  href: string;
  id: string;
  title: string;
  type: "artifact" | "feature" | "history" | "hub" | "reading" | "tool";
}

export function getSearchableItems(
  locale: string,
  history: any[] = [],
): SearchResult[] {
  const currentLocale = (locale as Locale) || "en";
  const allFeatures = Object.values(features);

  const featureResults: SearchResult[] = allFeatures.map((feature) => {
    return {
      category: Array.isArray(feature.category)
        ? feature.category[0]
        : feature.category || "General",
      description:
        feature.seo?.description?.[currentLocale] ||
        feature.seo?.description?.en ||
        feature.description?.[currentLocale] ||
        feature.description?.en ||
        "",
      emoji: typeof feature.icon === "string" ? feature.icon : "✨",
      href: `/${currentLocale}${feature.path}`,
      id: feature.id,
      title:
        feature.seo?.title?.[currentLocale] ||
        feature.seo?.title?.en ||
        feature.name?.[currentLocale] ||
        feature.name?.en ||
        feature.id,
      type:
        feature.path.includes("/hub") ||
        (Array.isArray(feature.category) &&
          feature.category.includes("hub" as any))
          ? "hub"
          : "feature",
    } as SearchResult;
  });

  const historyResults: SearchResult[] = history.map((item) => {
    return {
      category: item.category || "History",
      description: `Discovered on ${new Date(item.createdAt).toLocaleDateString(currentLocale)}`,
      emoji: "📜",
      href: `/${currentLocale}/resonance/result/${item.id}`,
      id: item.id,
      title: item.title || item.featureId || "Past Discovery",
      type: "artifact",
    } as SearchResult;
  });

  return [...featureResults, ...historyResults];
}
