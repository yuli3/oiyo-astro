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
};

export function getRelatedReading(routeWithoutLocale: string): RelatedReading | null {
  const key = routeWithoutLocale.replace(/\/$/, "") || "/";
  return TEST_RELATED_READING[key] ?? null;
}
