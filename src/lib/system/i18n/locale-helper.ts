import type { Locale } from "@/i18n";

/**
 * Type-safe localized content object for all 6 supported locales
 */
// import { LocalizedContent } from '@/types/data-schema'; // Broken import
export type LocalizedContent<T> = Partial<Record<Locale, T>>;

/**
 * Helper for binary locale selection (ko/en only)
 * @deprecated Use getLocalizedText instead for full 6-locale support.
 * This helper is scheduled for removal once all legacy code is refactored.
 */
export function getBinaryLocaleText<T>(ko: T, en: T, locale: Locale): T {
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "[i18n] getBinaryLocaleText is deprecated. Use getLocalizedText instead.",
    );
  }
  return locale === "ko" ? ko : en;
}

/**
 * Get full language name for AI prompts
 * @example getLanguageName('ko') -> 'Korean'
 */
export function getLanguageName(locale: Locale): string {
  const names: Record<Locale, string> = {
    en: "English",
    es: "Spanish",
    fr: "French",
    ja: "Japanese",
    ko: "Korean",
    zh: "Chinese",
  };
  return names[locale] || "English";
}

/**
 * Get localized text from a multi-locale object
 *
 * Replaces pattern: `locale === 'ko' ? text.ko : text.en`
 *
 * @example
 * ```ts
 * const greeting = {
 *   ko: '안녕하세요',
 *   en: 'Hello',
 *   ja: 'こんにちは',
 *   cn: '你好',
 *   es: 'Hola',
 *   fr: 'Bonjour'
 * };
 *
 * const text = getLocalizedText(greeting, locale);
 * ```
 */
export function getLocalizedText<T>(
  content: Partial<LocalizedContent<T>>,
  locale: Locale,
): T {
  return (content[locale] ?? content.en ?? content.ko) as T;
}

/**
 * Get localized text with fallback to English
 * Useful for partial translations or legacy data
 */
export function getLocalizedTextWithFallback<T>(
  content: Partial<LocalizedContent<T>>,
  locale: Locale,
): T | undefined {
  return content[locale] ?? content.en;
}
