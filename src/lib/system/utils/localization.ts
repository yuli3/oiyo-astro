import { Locale } from "@/i18n";

/**
 * Type-safe helper to access localized content from Record<string, string>
 * Eliminates need for `as any` casts throughout the codebase
 */
export type StrictLocalized<T> = Record<Locale, T>;

/**
 * Type-safe helper for optional localized arrays
 */
export function getLocalizedArray(
  content: Record<string, string[]> | string[] | undefined,
  locale: Locale,
  fallback: string[] = [],
): string[] {
  if (!content) return fallback;
  if (Array.isArray(content)) return content;
  return content[locale] || content["en"] || content["ko"] || fallback;
}

/**
 * Type-safe helper for complex localized content (objects, interfaces)
 */
export function getLocalizedContent<T>(
  content: Record<string, T> | undefined,
  locale: Locale,
  fallback: T,
): T {
  if (!content) return fallback;
  return content[locale] || content["en"] || content["ko"] || fallback;
}

export function getLocalizedText(
  content: Record<string, string> | string | undefined,
  locale: Locale,
  fallback: string = "",
): string {
  if (!content) return fallback;
  if (typeof content === "string") return content;
  return content[locale] || content["en"] || content["ko"] || fallback;
}

/**
 * Shorthand for getLocalizedText
 */
export function getTrans(
  content: Record<string, string> | string | undefined,
  locale: Locale,
  fallback: string = "",
): string {
  return getLocalizedText(content, locale, fallback);
}

/**
 * Type guard to check if content is localized
 */
export function isLocalizedContent(
  content: unknown,
): content is Record<string, string> {
  return (
    typeof content === "object" &&
    content !== null &&
    !Array.isArray(content) &&
    Object.values(content).every((v) => typeof v === "string")
  );
}
