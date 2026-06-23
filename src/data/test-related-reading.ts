// Lightweight "read deeper" cross-links for psychology tests → their blog guide
// (and wiki definition where it exists). Auto-rendered by Layout.astro from the
// page route (no per-page edits). URL-only — no per-locale authored content, so it
// scales cheaply (the rich TestContentBridge stays for premium tests like mbti/big5).
// Targets verified live 2026-06-22; ko canonical content.
// 2026-06-23: urgent 5건 교체(404 위험 → 실존 slug), A등급 22종 신규 추가.

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
  // 긴급 5건 교체 2026-06-23: 기존 slug(404 위험) → 실존 slug
  "/communication-style-test": { blog: `${BLOG}/magazine-communication-style-psychology/` },
  "/conflict-style-test": { blog: `${BLOG}/magazine-conflict-style-psychology/` },
  "/stress-type-test": { blog: `${BLOG}/mbti-stress-type-test/` },
  "/resilience-test": { blog: `${BLOG}/resilience-test/` },
  "/grit-scale-test": { blog: `${BLOG}/resilience-science/` },
  "/imposter-syndrome-test": { blog: `${BLOG}/imposter-syndrome-doubt/` },
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
  "/self-efficacy-test": { blog: `${BLOG}/magazine-growth-mindset-psychology/`, wiki: `${WIKI}/meaning-of-self-efficacy/` },
  "/inner-child-test": { blog: `${BLOG}/trauma-healing-psychology/` },
  // 2026-06-23 기존 테스트 → 기존 매거진/가이드 매칭 (codex-free 확대)
  "/anger-style/test": { blog: `${BLOG}/magazine-anger-style-psychology/` },
  "/adhd/test": { blog: `${BLOG}/adult-adhd-survival-guide/`, wiki: `${WIKI}/meaning-of-adhd/` },
  "/anxiety/test": { blog: `${BLOG}/magazine-anxiety-insomnia-psychology/`, wiki: `${WIKI}/meaning-of-anxiety/` },
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
  // 2026-06-23 신규 테스트 9종 전용 가이드 (codex 생성) — 삼각 완성
  "/entrepreneurial-aptitude-test": { blog: `${BLOG}/magazine-entrepreneurship-psychology/` },
  "/self-concept-clarity-test": { blog: `${BLOG}/magazine-self-concept-clarity-psychology/` },
  "/jealousy-type-test": { blog: `${BLOG}/magazine-jealousy-psychology/` },
  "/curiosity-test": { blog: `${BLOG}/magazine-curiosity-psychology/` },
  "/locus-of-control-test": { blog: `${BLOG}/magazine-locus-of-control-psychology/` },
  "/emotional-labor-test": { blog: `${BLOG}/magazine-emotional-labor-psychology/` },
  "/self-control-test": { blog: `${BLOG}/magazine-self-control-psychology/` },
  "/playfulness-test": { blog: `${BLOG}/magazine-playfulness-psychology/` },
  "/emotional-expressiveness-test": { blog: `${BLOG}/magazine-emotional-expressiveness-psychology/` },
  // A등급 22종 신규 브릿지 2026-06-23 (Apollo 실존 검증 매트릭스 기반, Hephaestus fs 재확인)
  "/burnout/test": { blog: `${BLOG}/magazine-burnout-psychology/`, wiki: `${WIKI}/meaning-of-burnout/` },
  "/attachment-style/test": { blog: `${BLOG}/magazine-attachment-test/`, wiki: `${WIKI}/meaning-of-attachment-theory/` },
  "/enneagram/test": { blog: `${BLOG}/enneagram-complete-types-guide/`, wiki: `${WIKI}/meaning-of-enneagram/` },
  "/mbti/test": { blog: `${BLOG}/mbti-career-test/`, wiki: `${WIKI}/meaning-of-mbti/` },
  "/sleep-type/test": { blog: `${BLOG}/chronotypes-sleep-biology-optimization/`, wiki: `${WIKI}/meaning-of-chronotypes/` },
  "/loneliness-test": { blog: `${BLOG}/magazine-loneliness-guide/` },
  "/mindfulness-test": { blog: `${BLOG}/magazine-mindfulness-guide/` },
  "/perfectionism/test": { blog: `${BLOG}/magazine-perfectionism-psychology/`, wiki: `${WIKI}/meaning-of-perfectionism/` },
  "/riasec-career-test": { blog: `${BLOG}/riasec-career-complete-guide/`, wiki: `${WIKI}/meaning-of-riasec/` },
  "/eq/test": { blog: `${BLOG}/magazine-emotional-intelligence-psychology/` },
  "/toxic-relationship-test": { blog: `${BLOG}/gaslighting-manipulation/` },
  "/dopamine-dependency-test": { blog: `${BLOG}/dopamine-fasting-focus/`, wiki: `${WIKI}/meaning-of-dopamine-loop/` },
  "/hormones-test": { blog: `${BLOG}/hormones-and-metabolic-regulators/`, wiki: `${WIKI}/meaning-of-hormones/` },
  "/personal-color/test": { blog: `${BLOG}/personal-color-season-test/`, wiki: `${WIKI}/meaning-of-color-psychology/` },
  "/lazy-perfectionist/test": { blog: `${BLOG}/lazy-perfectionism-lethargy-30-day-recovery/`, wiki: `${WIKI}/meaning-of-lazy-perfectionism/` },
  "/career-values-test": { blog: `${BLOG}/psychology-career-values-test/` },
  "/spending-habits-test": { blog: `${BLOG}/latte-factor-spending-habits/` },
  "/trust-style-test": { blog: `${BLOG}/trust-and-betrayal/` },
  "/resilience-boost-test": { blog: `${BLOG}/magazine-resilience-psychology/` },
  "/focus-blocker-test": { blog: `${BLOG}/magazine-focus-concentration-guide/`, wiki: `${WIKI}/meaning-of-executive-function/` },
  "/critical-thinking-test": { blog: `${BLOG}/critical-thinking-logic-guide/` },
  "/chimp-test": { blog: `${BLOG}/chimp-test-cognitive-memory/` },
};

export function getRelatedReading(routeWithoutLocale: string): RelatedReading | null {
  const key = routeWithoutLocale.replace(/\/$/, "") || "/";
  return TEST_RELATED_READING[key] ?? null;
}
