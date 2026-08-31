export const LOCALES = ['en', 'ko', 'ja', 'zh', 'fr', 'es'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'ko';

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  ko: '한국어',
  ja: '日本語',
  zh: '中文',
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
    // Ontology engine namespaces
    'akashic', 'catalog', 'chosun', 'commerce', 'dashboard',
    'egyptian', 'onomancy', 'saju', 'ui', 'universal',
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

// 내부 링크는 항상 서빙 형태(트레일링 슬래시)로 낸다.
//
// 왜: Cloudflare Pages가 슬래시 없는 경로를 308로 정규화한다. Google·Bing은 308을
// 따라가 목표를 색인하지만 네이버 Yeti는 리다이렉트된 페이지를 "수집제한"으로 분류하고
// 목표를 색인하지 않는다. 2026-08-30 서치어드바이저 진단에서 색인 0 / 수집제한 21(전부
// "리다이렉션된 페이지")이 나온 원인이 이것이다. 링크가 곧 크롤 경로이므로 링크를
// canonical 형태로 내는 것이 정답이고, 리다이렉트에 의존하지 않는다.
//
// 쿼리·해시·파일 확장자가 붙은 경로는 디렉터리가 아니므로 슬래시를 붙이지 않는다.
export function localePath(locale: Locale, path: string): string {
  const prefixed = `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
  return withTrailingSlash(prefixed);
}

export function withTrailingSlash(href: string): string {
  if (!href.startsWith('/')) return href;
  const cut = href.search(/[?#]/);
  const base = cut === -1 ? href : href.slice(0, cut);
  const rest = cut === -1 ? '' : href.slice(cut);
  if (base.endsWith('/')) return href;
  // 마지막 세그먼트에 확장자가 있으면 파일이다 (예: /icon-512.png, /sitemap-0.xml).
  const last = base.slice(base.lastIndexOf('/') + 1);
  if (last.includes('.')) return href;
  return `${base}/${rest}`;
}
