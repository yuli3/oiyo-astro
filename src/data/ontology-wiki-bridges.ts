// Locale coverage for wiki `meaning-of-*` definition pages that ontology links to.
// Recheck live routes before adding entries: stale astrology and numerology entries were removed 2026-08-29.
// Render a link only where the page exists (404-safe).
export const WIKI_DEF_LOCALES: Record<string, string[]> = {
  // 2026-09-02: meaning-of-mbti 는 oiyo /{locale}/mbti/about 으로 옮겨졌다.
  // 이 레지스트리는 **wiki 에 실존하는** 정의만 담는다 — 301 로 튕기는 항목을
  // 남겨 두면 여기 있다는 사실이 곧 거짓이 된다.
  'meaning-of-riasec': ['en', 'es', 'fr', 'ja', 'ko', 'zh'],
  'meaning-of-enneagram': ['en', 'es', 'fr', 'ja', 'ko', 'zh'],
  'meaning-of-tarot': ['en', 'es', 'fr', 'ja', 'ko', 'zh'],
  'meaning-of-palmistry': ['en', 'es', 'fr', 'ja', 'ko', 'zh'],
  'meaning-of-blood-type-a': ['en', 'es', 'fr', 'ja', 'ko', 'zh'],
  'meaning-of-chinese-zodiac-dragon': ['en', 'es', 'fr', 'ja', 'ko', 'zh'],
  'meaning-of-saju-60gapja': ['en', 'es', 'fr', 'ja', 'ko', 'zh'],
  // Verified live 2026-07-05 (wiki 3b0269e deploy).
  'meaning-of-ohaeng': ['en', 'es', 'fr', 'ja', 'ko', 'zh'],
  'meaning-of-disc': ['en', 'es', 'fr', 'ja', 'ko', 'zh'],
  // 2026-09-01 실측: wiki/src/content/blog/{en,es,fr,ja,ko,zh}/meaning-of-akashic-records.mdx
  // 6로케일 전부 라이브 200. 다만 **현재 이 항목을 렌더하는 화면은 없다** —
  // WikiDefinitionLink 를 쓰는 페이지가 disc-personality-test 하나뿐이고
  // 아카식은 ontology-systems 레지스트리에도 없다. 개념 표면이 생길 때
  // 바로 연결되도록 데이터만 먼저 맞춰 둔다. 표면 없이 이 줄은 무해하지만
  // 아무 일도 하지 않는다.
  'meaning-of-akashic-records': ['en', 'es', 'fr', 'ja', 'ko', 'zh'],
};

export function wikiDefUrl(slug: string, locale: string): string | null {
  const locs = WIKI_DEF_LOCALES[slug];
  if (!locs || !locs.includes(locale)) return null;
  const utm = 'utm_source=oiyo&utm_medium=ontology&utm_campaign=definition_bridge';
  return `https://wiki.oiyo.net/${locale}/${slug}/?${utm}`;
}
