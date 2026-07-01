// Locale coverage for wiki `meaning-of-*` definition pages that ontology links to.
// Verified live 2026-07-01. Render a link only where the page exists (404-safe).
// saju is being localized to all 6 by the wiki translation campaign — update its
// locale list as translations land (currently ko + en pilot).
export const WIKI_DEF_LOCALES: Record<string, string[]> = {
  'meaning-of-astrology': ['en', 'es', 'fr', 'ja', 'ko', 'zh'],
  'meaning-of-mbti': ['en', 'es', 'fr', 'ja', 'ko', 'zh'],
  'meaning-of-riasec': ['en', 'es', 'fr', 'ja', 'ko', 'zh'],
  'meaning-of-enneagram': ['en', 'es', 'fr', 'ja', 'ko', 'zh'],
  'meaning-of-tarot': ['en', 'es', 'fr', 'ja', 'ko', 'zh'],
  'meaning-of-numerology': ['en', 'es', 'fr', 'ja', 'ko', 'zh'],
  'meaning-of-palmistry': ['en', 'es', 'fr', 'ja', 'ko', 'zh'],
  'meaning-of-blood-type-a': ['en', 'es', 'fr', 'ja', 'ko', 'zh'],
  'meaning-of-chinese-zodiac-dragon': ['en', 'es', 'fr', 'ja', 'ko', 'zh'],
  'meaning-of-saju-60gapja': ['ko', 'en'],
};

export function wikiDefUrl(slug: string, locale: string): string | null {
  const locs = WIKI_DEF_LOCALES[slug];
  if (!locs || !locs.includes(locale)) return null;
  const utm = 'utm_source=oiyo&utm_medium=ontology&utm_campaign=definition_bridge';
  return `https://wiki.oiyo.net/${locale}/${slug}/?${utm}`;
}
