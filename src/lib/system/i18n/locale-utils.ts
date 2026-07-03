import type { Locale } from "@/i18n";

/**
 * Formats a number as currency based on locale
 */
export function formatCurrency(
  locale: string,
  amount: number,
  currency: string = "USD",
): string {
  try {
    const localeCode = formatLocaleCode(locale as Locale, "dashLower");

    return new Intl.NumberFormat(localeCode, {
      currency: currency,
      style: "currency",
    }).format(amount);
  } catch (e) {
    console.error("Error formatting currency:", e);
    return `${currency} ${amount}`;
  }
}

/**
 * Formats a date based on locale
 */
export function formatDate(
  locale: string,
  date: Date | number | string,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  },
): string {
  try {
    const localeCode = formatLocaleCode(locale as Locale, "dashLower");

    const d =
      typeof date === "string" || typeof date === "number"
        ? new Date(date)
        : date;
    return new Intl.DateTimeFormat(localeCode, options).format(d);
  } catch (e) {
    console.error("Error formatting date:", e);
    return String(date);
  }
}

/**
 * Converts our internal Locale type to locale codes used by external libraries
 * @param locale - Our internal locale ('ko', 'en', etc.)
 * @param format - Target format ('underscoreUpper' for ko_KR, etc.)
 * @returns Formatted locale code
 */
export function formatLocaleCode(
  locale: Locale,
  format: "dashLower" | "underscoreUpper" = "underscoreUpper",
): string {
  const localeMap: Record<
    Locale,
    { dashLower: string; underscoreUpper: string }
  > = {
    zh: { dashLower: "zh-cn", underscoreUpper: "zh_CN" },
    en: { dashLower: "en-us", underscoreUpper: "en_US" },
    es: { dashLower: "es-es", underscoreUpper: "es_ES" },
    fr: { dashLower: "fr-fr", underscoreUpper: "fr_FR" },
    ja: { dashLower: "ja-jp", underscoreUpper: "ja_JP" },
    ko: { dashLower: "ko-kr", underscoreUpper: "ko_KR" },
  };

  return localeMap[locale][format];
}

/**
 * Gets localized content from an object with locale keys
 * Automatically falls back: requested locale → en → first available
 */
export function getLocalizedContent<T = string>(
  locale: Locale,
  content?:
    | null
    | Partial<Record<Locale, T>>
    | { zh?: T; en?: T; es?: T; fr?: T; ja?: T; ko?: T },
): T {
  // Guard for missing content
  if (!content) {
    return "" as unknown as T;
  }

  // Try requested locale
  if (content[locale]) {
    return content[locale] as T;
  }

  // Fallback chain: en → first available
  if (content.en) return content.en as T;

  // Return first available value
  const values = Object.values(content);
  const firstValue = values.find((v) => v !== undefined && v !== null);
  if (firstValue !== undefined) return firstValue as T;

  // Fallback to empty string or object based on type
  return "" as unknown as T;
}
