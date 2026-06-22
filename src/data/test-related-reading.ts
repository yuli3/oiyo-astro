// Lightweight "read deeper" cross-links for psychology tests → their blog guide
// (and wiki definition where it exists). Auto-rendered by Layout.astro from the
// page route (no per-page edits). URL-only — no per-locale authored content, so it
// scales cheaply (the rich TestContentBridge stays for premium tests like mbti/big5).
// Targets verified live 2026-06-22; ko canonical content.

export interface RelatedReading {
  blog?: string;
  wiki?: string;
}

const BLOG = "https://blog.oiyo.net/ko";
const WIKI = "https://wiki.oiyo.net/ko";

// key = route without locale prefix (e.g. "/iq-test")
export const TEST_RELATED_READING: Record<string, RelatedReading> = {
  "/iq-test": { blog: `${BLOG}/iq-test-free/` },
  "/hsp-test": { wiki: `${WIKI}/meaning-of-hsp/` },
  "/procrastination-type-test": { blog: `${BLOG}/procrastination-type-test/` },
  "/communication-style-test": { blog: `${BLOG}/communication-style-test/` },
  "/conflict-style-test": { blog: `${BLOG}/conflict-style-test/` },
  "/stress-type-test": { blog: `${BLOG}/stress-type-test/` },
  "/resilience-test": { blog: `${BLOG}/resilience-test/` },
  "/grit-scale-test": { blog: `${BLOG}/grit-scale-test/` },
  "/imposter-syndrome-test": { blog: `${BLOG}/imposter-syndrome-test/` },
  "/cognitive-bias-test": { blog: `${BLOG}/cognitive-bias-complete-guide/` },
  "/decision-making-test": { blog: `${BLOG}/magazine-decision-making-psychology/` },
  "/self-compassion-test": { blog: `${BLOG}/magazine-self-compassion-psychology/`, wiki: `${WIKI}/meaning-of-self-compassion/` },
  "/learning-style-test": { blog: `${BLOG}/learning-styles-efficiency/`, wiki: `${WIKI}/meaning-of-learning-styles/` },
  "/emotion-regulation-test": { blog: `${BLOG}/magazine-emotion-regulation-psychology/`, wiki: `${WIKI}/meaning-of-emotion-regulation/` },
  // 2026-06-23 새 테스트 → 새 매거진 가이드 (codex 생성)
  "/workaholic-test": { blog: `${BLOG}/magazine-workaholism-psychology/` },
  "/fomo-test": { blog: `${BLOG}/magazine-fomo-psychology/` },
  "/money-anxiety-test": { blog: `${BLOG}/magazine-money-anxiety-psychology/` },
  "/assertiveness-test": { blog: `${BLOG}/magazine-assertiveness-psychology/` },
  "/relationship-boredom-test": { blog: `${BLOG}/magazine-relationship-boredom-psychology/` },
  "/social-comparison-test": { blog: `${BLOG}/magazine-social-comparison-psychology/` },
  // 기존 매거진 가이드와 매칭
  "/shadow-self-test": { blog: `${BLOG}/jung-shadow-psychology/` },
  "/self-efficacy-test": { blog: `${BLOG}/magazine-growth-mindset-psychology/` },
  "/inner-child-test": { blog: `${BLOG}/trauma-healing-psychology/` },
  // 2026-06-23 기존 테스트 → 기존 매거진/가이드 매칭 (codex-free 확대)
  "/anger-style/test": { blog: `${BLOG}/magazine-anger-style-psychology/` },
  "/anxiety/test": { blog: `${BLOG}/magazine-anxiety-insomnia-psychology/` },
  "/boundary-style-test": { blog: `${BLOG}/magazine-boundary-psychology/` },
  "/color-personality-test": { blog: `${BLOG}/color-psychology-complete-guide/` },
  "/coping-style-test": { blog: `${BLOG}/magazine-coping-style-psychology/` },
  "/creativity-type-test": { blog: `${BLOG}/magazine-creativity-type-psychology/` },
  "/disc-personality-test": { blog: `${BLOG}/magazine-disc-personality-psychology/` },
  "/egogram-test": { blog: `${BLOG}/magazine-egogram-psychology/` },
  "/empathy/test": { blog: `${BLOG}/magazine-empathy-psychology/` },
  "/growth-mindset-test": { blog: `${BLOG}/magazine-growth-mindset-psychology/` },
  "/introvert-extrovert-test": { blog: `${BLOG}/magazine-introvert-extrovert-psychology/` },
  "/investment-type/test": { blog: `${BLOG}/magazine-investment-psychology-guide/` },
  "/leadership-style-test": { blog: `${BLOG}/magazine-leadership-style-psychology/` },
  "/life-values-test": { blog: `${BLOG}/magazine-life-values-psychology/` },
  "/love-language/test": { blog: `${BLOG}/magazine-love-language-psychology/` },
  "/mbti-love-test": { blog: `${BLOG}/magazine-mbti-love-psychology/` },
  "/meeting-style-test": { blog: `${BLOG}/magazine-meeting-cost-psychology/` },
  "/money-personality-test": { blog: `${BLOG}/psychology-of-money/` },
  "/motivation-type-test": { blog: `${BLOG}/magazine-motivation-type-psychology/` },
  "/narcissism/test": { blog: `${BLOG}/narcissism-psychology-guide/` },
  "/optimism-test": { blog: `${BLOG}/magazine-optimism-psychology/` },
  "/parenting-style-test": { blog: `${BLOG}/magazine-parenting-psychology-guide/` },
  "/self-esteem/test": { blog: `${BLOG}/magazine-self-esteem-psychology/` },
  "/social-anxiety/test": { blog: `${BLOG}/magazine-social-anxiety-psychology/` },
  "/work-style-test": { blog: `${BLOG}/magazine-work-style-psychology/` },
};

export function getRelatedReading(routeWithoutLocale: string): RelatedReading | null {
  const key = routeWithoutLocale.replace(/\/$/, "") || "/";
  return TEST_RELATED_READING[key] ?? null;
}
