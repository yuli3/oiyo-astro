import { describe, expect, it } from 'vitest';

import { testIconSrc } from './test-icons';

describe('testIconSrc', () => {
  it('maps localized routes with or without a trailing slash', () => {
    expect(testIconSrc('/ko/self-esteem/test/')).toBe('/images/test-icons/self-esteem.webp');
    expect(testIconSrc('/en/anxiety/test')).toBe('/images/test-icons/anxiety.webp');
  });

  it('reuses existing result-family artwork', () => {
    expect(testIconSrc('/ja/mbti/test/')).toBe('/images/result-symbols/mbti.webp');
  });

  it('maps the relationship icon batch', () => {
    expect(testIconSrc('/ko/relationship-boredom-test/')).toBe('/images/test-icons/relationship-boredom.webp');
    expect(testIconSrc('/fr/jealousy-type-test/')).toBe('/images/test-icons/jealousy.webp');
  });

  it('maps the 2026-09-22 pictogram batch', () => {
    expect(testIconSrc('/ko/riasec-career-test/')).toBe('/images/test-icons/riasec.webp');
    expect(testIconSrc('/en/depression/test')).toBe('/images/test-icons/depression.webp');
    expect(testIconSrc('/ko/playfulness-test/')).toBe('/images/test-icons/playfulness.webp');
    expect(testIconSrc('/ja/mbti/career/')).toBe('/images/result-symbols/mbti.webp');
  });

  it('leaves unmapped tests on their existing emoji fallback', () => {
    expect(testIconSrc('/ko/anger-style/test/')).toBeUndefined();
  });
});
