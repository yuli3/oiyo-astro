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
