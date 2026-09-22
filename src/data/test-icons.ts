/**
 * Test-card artwork registry.
 *
 * Keys are locale-free canonical paths. Result families reuse their existing
 * artwork; assessment-specific artwork lives in /images/test-icons.
 */
export const TEST_ICON_BY_PATH: Readonly<Record<string, string>> = {
  '/mbti/test': '/images/result-symbols/mbti.webp',
  '/mbti/career': '/images/result-symbols/mbti.webp',
  '/enneagram/test': '/images/result-symbols/enneagram.webp',
  '/big5/test': '/images/result-symbols/big-five.webp',
  '/hexaco-personality-test': '/images/result-symbols/hexaco.webp',
  '/tci-personality-test': '/images/result-symbols/tci.webp',
  '/attachment-style/test': '/images/test-icons/attachment-style.webp',
  '/love-language/test': '/images/result-symbols/love-language/words.webp',
  '/self-esteem/test': '/images/test-icons/self-esteem.webp',
  '/burnout/test': '/images/test-icons/burnout.webp',
  '/anxiety/test': '/images/test-icons/anxiety.webp',
  '/empathy/test': '/images/test-icons/empathy.webp',
  '/eq/test': '/images/test-icons/emotional-intelligence.webp',
  '/relationship-boredom-test': '/images/test-icons/relationship-boredom.webp',
  '/jealousy-type-test': '/images/test-icons/jealousy.webp',
  '/social-comparison-test': '/images/test-icons/social-comparison.webp',
  '/emotional-expressiveness-test': '/images/test-icons/emotional-expressiveness.webp',
  '/curiosity-test': '/images/test-icons/curiosity.webp',
  '/workaholic-test': '/images/test-icons/workaholic.webp',
  '/self-efficacy-test': '/images/test-icons/self-efficacy.webp',
  '/self-control-test': '/images/test-icons/self-control.webp',
  '/inner-child-test': '/images/test-icons/inner-child.webp',
  '/money-anxiety-test': '/images/test-icons/money-anxiety.webp',
  '/riasec-career-test': '/images/test-icons/riasec.webp',
  '/fomo-test': '/images/test-icons/fomo.webp',
  '/assertiveness-test': '/images/test-icons/assertiveness.webp',
  '/playfulness-test': '/images/test-icons/playfulness.webp',
  '/locus-of-control-test': '/images/test-icons/locus-of-control.webp',
  '/emotional-labor-test': '/images/test-icons/emotional-labor.webp',
  '/entrepreneurial-aptitude-test': '/images/test-icons/entrepreneurial-aptitude.webp',
  '/personal-color/test': '/images/test-icons/personal-color.webp',
  '/depression/test': '/images/test-icons/depression.webp',
  '/social-anxiety/test': '/images/test-icons/social-anxiety.webp',
};

export function testIconSrc(localizedHref: string): string | undefined {
  const href = localizedHref.replace(/\/$/, '');
  return Object.entries(TEST_ICON_BY_PATH).find(([path]) => href.endsWith(path))?.[1];
}
