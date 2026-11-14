import type { Locale } from '../../i18n';

interface ArticleMetadata {
  title: string;
  description: string;
  locale: Locale;
  pubDate?: Date;
  updatedDate?: Date;
}

export function articleStructuredData(metadata: ArticleMetadata, canonical: URL) {
  // 2026-10-08: article dates are source metadata, not the time of a build.
  // Match ArticleBody's calendar-day display without inventing a midnight/time zone.
  const datePublished = metadata.pubDate?.toISOString().slice(0, 10);
  const dateModified = metadata.updatedDate?.toISOString().slice(0, 10);
  if (datePublished && dateModified && dateModified < datePublished) {
    throw new RangeError('Article modification date precedes publication date');
  }

  // 2026-10-08: default author strings and the site logo do not establish
  // a verified author identity or an article image. Do not manufacture either.
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${canonical.href}#article`,
    url: canonical.href,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical.href },
    headline: metadata.title,
    description: metadata.description,
    inLanguage: metadata.locale === 'zh' ? 'zh-CN' : metadata.locale,
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
  };
}

export function serializeArticleStructuredData(data: ReturnType<typeof articleStructuredData>): string {
  // 2026-10-08: JSON escaping alone does not stop </script> from ending an
  // HTML script element. Unicode-escape '<' while preserving parsed JSON text.
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
