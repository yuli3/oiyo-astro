import type { Locale } from '../../../i18n';

export interface JourneyLink {
  href: string;
  label: string;
  emoji?: string;
  desc?: string;
  external?: boolean;
}

export interface JourneyContent {
  badge: string;
  title: string;
  intro: string;
  /** 1. The question this page answers */
  question: { heading: string; body: string[] };
  /** 2. Core concepts explained */
  concepts: { heading: string; items: { title: string; body: string }[] };
  /** 3. Hands-on exploration tools */
  tools: { heading: string; desc: string; items: JourneyLink[] };
  /** 4. How to read your results */
  interpret: { heading: string; steps: { title: string; body: string }[] };
  /** 5. Related tests */
  tests: { heading: string; items: JourneyLink[] };
  /** 6. Related blog.oiyo.net articles */
  blog: { heading: string; items: JourneyLink[] };
  /** 7. Related wiki.oiyo.net concepts */
  wiki: { heading: string; items: JourneyLink[] };
  /** 8. FAQ (also emitted as FAQPage JSON-LD) */
  faq: { heading: string; items: { q: string; a: string }[] };
  /** Cross-links to sibling journey pages */
  next: { heading: string; items: JourneyLink[] };
}

/** blog.oiyo.net only has full coverage in ko/en/ja — map the rest to en. */
export function blogUrl(locale: Locale, slug: string): string {
  const l = locale === 'ko' || locale === 'ja' ? locale : 'en';
  return `https://blog.oiyo.net/${l}/${slug}/`;
}

/** wiki.oiyo.net concept pages exist in ko/en/ja — map the rest to en. */
export function wikiUrl(locale: Locale, slug: string): string {
  const l = locale === 'ko' || locale === 'ja' ? locale : 'en';
  return `https://wiki.oiyo.net/${l}/${slug}/`;
}

/** oiyo 자체 개념 해설. 6로케일 전부 존재하므로 en 으로 접지 않는다. */
export function oiyoUrl(locale: Locale, path: string): string {
  return `/${locale}/${path}/`;
}

/**
 * blog 에서 oiyo 로 이관된 **기사**. 호스트만 바뀌었을 뿐 같은 글이라 로케일 커버리지도
 * 그대로 ko/en/ja 다 — 2026-09-08 에 blogUrl 을 그냥 oiyoUrl 로 바꿨더니 zh/fr/es 에서
 * 12개의 404 가 생겼다. blogUrl 이 하던 접기를 유지한다.
 */
export function oiyoArticleUrl(locale: Locale, slug: string): string {
  const l = locale === 'ko' || locale === 'ja' ? locale : 'en';
  return `/${l}/${slug}/`;
}
