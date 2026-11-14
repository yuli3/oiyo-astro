import { describe, expect, it } from 'vitest';
import type { Locale } from '../../i18n';
import { articleStructuredData, serializeArticleStructuredData } from './article-structured-data';

const locales: Locale[] = ['ko', 'en', 'ja', 'zh', 'fr', 'es'];
const metadata = {
  title: 'An article title',
  description: 'Its visible description',
  locale: locales[0],
  pubDate: new Date('2026-04-01'),
};

describe('article structured data', () => {
  it.each(locales)('matches the localized canonical and language: %s', (locale) => {
    const canonical = new URL(`https://oiyo.net/${locale}/example/`);
    const data = articleStructuredData({ ...metadata, locale }, canonical);
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('Article');
    expect(data['@id']).toBe(`${canonical.href}#article`);
    expect(data.url).toBe(canonical.href);
    expect(data.mainEntityOfPage).toEqual({ '@type': 'WebPage', '@id': canonical.href });
    expect(data.inLanguage).toBe(locale === 'zh' ? 'zh-CN' : locale);
    expect(data.headline).toBe(metadata.title);
    expect(data.description).toBe(metadata.description);
  });

  it('keeps source calendar dates without generating a time or update fallback', () => {
    const data = articleStructuredData(metadata, new URL('https://oiyo.net/ko/example/'));
    expect(data.datePublished).toBe('2026-04-01');
    expect(data).not.toHaveProperty('dateModified');
    const updated = articleStructuredData(
      { ...metadata, updatedDate: new Date('2026-10-08') },
      new URL('https://oiyo.net/ko/example/'),
    );
    expect(updated.dateModified).toBe('2026-10-08');
  });

  it('omits absent dates rather than using the build date', () => {
    const data = articleStructuredData(
      { title: metadata.title, description: metadata.description, locale: metadata.locale },
      new URL('https://oiyo.net/ko/example/'),
    );
    expect(data).not.toHaveProperty('datePublished');
    expect(data).not.toHaveProperty('dateModified');
  });

  it('does not turn unused author/image fields into claims', () => {
    const withExtras = { ...metadata, author: 'Unverified Research Team', imageUrl: '/site-logo.png' };
    const data = articleStructuredData(withExtras, new URL('https://oiyo.net/ko/example/'));
    expect(data).not.toHaveProperty('author');
    expect(data).not.toHaveProperty('image');
    expect(data).not.toHaveProperty('aggregateRating');
    expect(data).not.toHaveProperty('review');
  });

  it('rejects invalid and reversed dates rather than silently replacing them', () => {
    const canonical = new URL('https://oiyo.net/ko/example/');
    expect(() => articleStructuredData({ ...metadata, pubDate: new Date('invalid') }, canonical)).toThrow();
    expect(() => articleStructuredData(
      { ...metadata, updatedDate: new Date('2026-03-31') }, canonical,
    )).toThrow('Article modification date precedes publication date');
  });

  it('prevents HTML script termination and preserves the exact metadata after parsing', () => {
    const data = articleStructuredData(
      { ...metadata, title: '</script><script>alert("x")</script>', description: '< & 日本語 한국어' },
      new URL('https://oiyo.net/ko/example/'),
    );
    const serialized = serializeArticleStructuredData(data);
    expect(serialized).not.toContain('<');
    expect(serialized).toContain('\\u003c');
    expect(JSON.parse(serialized)).toEqual(data);
  });
});
