// Locale coverage for wiki `meaning-of-*` definition pages that ontology links to.
// Verified live 2026-07-01; saju 6-locale verified 2026-07-03 (wiki 0f2c80b deploy).
// Render a link only where the page exists (404-safe).
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
  'meaning-of-saju-60gapja': ['en', 'es', 'fr', 'ja', 'ko', 'zh'],
};

export function wikiDefUrl(slug: string, locale: string): string | null {
  const locs = WIKI_DEF_LOCALES[slug];
  if (!locs || !locs.includes(locale)) return null;
  const utm = 'utm_source=oiyo&utm_medium=ontology&utm_campaign=definition_bridge';
  return `https://wiki.oiyo.net/${locale}/${slug}/?${utm}`;
}
