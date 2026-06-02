export const LOCALES = ['en', 'ko', 'ja', 'cn', 'fr', 'es'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'ko';

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  ko: '한국어',
  ja: '日本語',
  cn: '中文',
  fr: 'FR',
  es: 'ES',
};

type Messages = Record<string, unknown>;
const cache: Partial<Record<Locale, Messages>> = {};

async function loadMessages(locale: Locale): Promise<Messages> {
  if (cache[locale]) return cache[locale]!;

  const files = [
    'about', 'common', 'contact', 'error', 'faq',
    'header', 'hero', 'landing', 'legal', 'marketing',
    'nav', 'navigation', 'ontology', 'page', 'seo',
    'support', 'features',
  ];

  const merged: Messages = {};
  for (const file of files) {
    try {
      const mod = await import(`./messages/${locale}/${file}.json`);
      merged[file] = mod.default ?? mod;
    } catch {
      // fallback to English
      try {
        const mod = await import(`./messages/en/${file}.json`);
        merged[file] = mod.default ?? mod;
      } catch {
        // skip missing files
      }
    }
  }

  cache[locale] = merged;
  return merged;
}

function get(obj: unknown, path: string): string {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return path;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === 'string' ? cur : path;
}

export async function getTranslations(locale: Locale) {
  const messages = await loadMessages(locale);
  return function t(key: string, vars?: Record<string, string | number>): string {
    const raw = get(messages, key);
    if (!vars) return raw;
    return Object.entries(vars).reduce(
      (str, [k, v]) => str.replaceAll(`{${k}}`, String(v)),
      raw,
    );
  };
}

export function getLocaleFromUrl(url: URL): Locale {
  const [, maybeLocale] = url.pathname.split('/');
  return (LOCALES as readonly string[]).includes(maybeLocale)
    ? (maybeLocale as Locale)
    : DEFAULT_LOCALE;
}

export function localePath(locale: Locale, path: string): string {
  return `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
}
