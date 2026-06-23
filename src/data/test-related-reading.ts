// Lightweight "read deeper" cross-links for psychology tests → their blog guide
// (and wiki definition where it exists). Auto-rendered by Layout.astro from the
// page route (no per-page edits). URL-only — no per-locale authored content, so it
// scales cheaply (the rich TestContentBridge stays for premium tests like mbti/big5).
// Targets verified live 2026-06-22; ko canonical content.
// 2026-06-23: urgent 5건 교체(404 위험 → 실존 slug), A등급 22종 신규 추가.
// 2026-06-24: locale-aware refactor — slug-only + blogLocales/wikiLocales whitelist.
//   en/ja availability determined by fs check on blog/wiki repos at authoring time.
//   미지정 = ko-only (기존 동작 유지, 회귀 0). ko 폴백 항상 안전망.

type Locale = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es';

export interface RelatedReading {
  /** locale을 뺀 slug 경로. 예: "/iq-test-free/" (앞에 host+locale 프리픽스를 붙임) */
  blog?: string;
  wiki?: string;
  /** blog 타깃이 실존하는 로케일 화이트리스트. 미지정 = ['ko'] (ko-only 안전 기본). */
  blogLocales?: Locale[];
  /** wiki 타깃이 실존하는 로케일 화이트리스트. 미지정 = ['ko']. */
  wikiLocales?: Locale[];
}

const BLOG_HOST = "https://blog.oiyo.net";
const WIKI_HOST = "https://wiki.oiyo.net";

/** blog/wiki 콘텐츠 로케일: ko→ko, ja→ja, 그 외(en/zh/fr/es)→en. lib/related-reading.ts 패턴과 동일. */
function contentLocale(locale: Locale): 'ko' | 'en' | 'ja' {
  return locale === 'ko' || locale === 'ja' ? locale : 'en';
}

/** 타깃이 cl에 실존하면 cl, 아니면 ko 폴백. ko 타깃은 항상 존재(C2-A 200 검증됨). */
function resolveLocale(cl: 'ko' | 'en' | 'ja', available: Locale[]): 'ko' | 'en' | 'ja' {
  if (available.includes(cl)) return cl;
  return 'ko';
}

// key = route without locale prefix (e.g. "/iq-test")
export const TEST_RELATED_READING: Record<string, RelatedReading> = {
  "/iq-test": { blog: "/iq-test-free/" },
  "/hsp-test": { wiki: "/meaning-of-hsp/", wikiLocales: ['ko', 'en', 'ja'] },
  "/procrastination-type-test": { blog: "/procrastination-type-test/" },
  // 긴급 5건 교체 2026-06-23: 기존 slug(404 위험) → 실존 slug
  "/communication-style-test": { blog: "/magazine-communication-style-psychology/", blogLocales: ['ko', 'en'] },
  "/conflict-style-test": { blog: "/magazine-conflict-style-psychology/", blogLocales: ['ko', 'en'] },
  "/stress-type-test": { blog: "/mbti-stress-type-test/" },
  "/resilience-test": { blog: "/resilience-test/" },
  "/grit-scale-test": { blog: "/resilience-science/", blogLocales: ['ko', 'en'] },
  "/imposter-syndrome-test": { blog: "/imposter-syndrome-doubt/", blogLocales: ['ko', 'en', 'ja'] },
  "/cognitive-bias-test": { blog: "/cognitive-bias-complete-guide/" },
  "/decision-making-test": { blog: "/magazine-decision-making-psychology/", blogLocales: ['ko', 'en'] },
  "/self-compassion-test": {
    blog: "/magazine-self-compassion-psychology/",
    blogLocales: ['ko', 'en'],
    wiki: "/meaning-of-self-compassion/",
    wikiLocales: ['ko', 'en', 'ja'],
  },
  "/learning-style-test": {
    blog: "/learning-styles-efficiency/",
    blogLocales: ['ko', 'en'],
    wiki: "/meaning-of-learning-styles/",
    wikiLocales: ['ko', 'en', 'ja'],
  },
  "/emotion-regulation-test": {
    blog: "/magazine-emotion-regulation-psychology/",
    blogLocales: ['ko', 'en'],
    wiki: "/meaning-of-emotion-regulation/",
    wikiLocales: ['ko', 'en', 'ja'],
  },
  // 2026-06-23 새 테스트 → 새 매거진 가이드 (codex 생성)
  "/workaholic-test": { blog: "/magazine-workaholism-psychology/" },
  "/fomo-test": { blog: "/magazine-fomo-psychology/" },
  "/money-anxiety-test": { blog: "/magazine-money-anxiety-psychology/" },
  "/assertiveness-test": { blog: "/magazine-assertiveness-psychology/" },
  "/relationship-boredom-test": { blog: "/magazine-relationship-boredom-psychology/" },
  "/social-comparison-test": { blog: "/magazine-social-comparison-psychology/" },
  // 기존 매거진 가이드와 매칭
  "/shadow-self-test": { blog: "/jung-shadow-psychology/", blogLocales: ['ko', 'en', 'ja'] },
  "/self-efficacy-test": {
    blog: "/magazine-growth-mindset-psychology/",
    blogLocales: ['ko', 'en'],
    wiki: "/meaning-of-self-efficacy/",
    wikiLocales: ['ko', 'en', 'ja'],
  },
  "/inner-child-test": { blog: "/trauma-healing-psychology/" },
  // 2026-06-23 기존 테스트 → 기존 매거진/가이드 매칭 (codex-free 확대)
  "/anger-style/test": { blog: "/magazine-anger-style-psychology/", blogLocales: ['ko', 'en'] },
  "/adhd/test": {
    blog: "/adult-adhd-survival-guide/",
    blogLocales: ['ko', 'en'],
    wiki: "/meaning-of-adhd/",
    wikiLocales: ['ko', 'en', 'ja'],
  },
  "/anxiety/test": {
    blog: "/magazine-anxiety-insomnia-psychology/",
    wiki: "/meaning-of-anxiety/",
    wikiLocales: ['ko', 'en', 'ja'],
  },
  "/boundary-style-test": { blog: "/magazine-boundary-psychology/", blogLocales: ['ko', 'en'] },
  "/color-personality-test": { blog: "/color-psychology-complete-guide/" },
  "/coping-style-test": { blog: "/magazine-coping-style-psychology/", blogLocales: ['ko', 'en'] },
  "/creativity-type-test": { blog: "/magazine-creativity-type-psychology/", blogLocales: ['ko', 'en'] },
  "/disc-personality-test": { blog: "/magazine-disc-personality-psychology/", blogLocales: ['ko', 'en'] },
  "/egogram-test": { blog: "/magazine-egogram-psychology/", blogLocales: ['ko', 'en'] },
  "/empathy/test": { blog: "/magazine-empathy-psychology/", blogLocales: ['ko', 'en'] },
  "/growth-mindset-test": { blog: "/magazine-growth-mindset-psychology/", blogLocales: ['ko', 'en'] },
  "/introvert-extrovert-test": { blog: "/magazine-introvert-extrovert-psychology/", blogLocales: ['ko', 'en'] },
  "/investment-type/test": { blog: "/magazine-investment-psychology-guide/", blogLocales: ['ko', 'en'] },
  "/leadership-style-test": { blog: "/magazine-leadership-style-psychology/", blogLocales: ['ko', 'en'] },
  "/life-values-test": { blog: "/magazine-life-values-psychology/", blogLocales: ['ko', 'en'] },
  "/love-language/test": { blog: "/magazine-love-language-psychology/", blogLocales: ['ko', 'en'] },
  "/mbti-love-test": { blog: "/magazine-mbti-love-psychology/", blogLocales: ['ko', 'en'] },
  "/meeting-style-test": { blog: "/magazine-meeting-cost-psychology/", blogLocales: ['ko', 'en'] },
  "/money-personality-test": { blog: "/psychology-of-money/", blogLocales: ['ko', 'en', 'ja'] },
  "/motivation-type-test": { blog: "/magazine-motivation-type-psychology/", blogLocales: ['ko', 'en'] },
  "/narcissism/test": { blog: "/narcissism-psychology-guide/" },
  "/optimism-test": { blog: "/magazine-optimism-psychology/", blogLocales: ['ko', 'en'] },
  "/parenting-style-test": { blog: "/magazine-parenting-psychology-guide/", blogLocales: ['ko', 'en'] },
  "/self-esteem/test": { blog: "/magazine-self-esteem-psychology/", blogLocales: ['ko', 'en'] },
  "/social-anxiety/test": { blog: "/magazine-social-anxiety-psychology/", blogLocales: ['ko', 'en'] },
  "/work-style-test": { blog: "/magazine-work-style-psychology/", blogLocales: ['ko', 'en'] },
  // 2026-06-23 신규 테스트 9종 전용 가이드 (codex 생성) — 삼각 완성
  "/entrepreneurial-aptitude-test": { blog: "/magazine-entrepreneurship-psychology/" },
  "/self-concept-clarity-test": { blog: "/magazine-self-concept-clarity-psychology/" },
  "/jealousy-type-test": { blog: "/magazine-jealousy-psychology/" },
  "/curiosity-test": { blog: "/magazine-curiosity-psychology/" },
  "/locus-of-control-test": { blog: "/magazine-locus-of-control-psychology/" },
  "/emotional-labor-test": { blog: "/magazine-emotional-labor-psychology/" },
  "/self-control-test": { blog: "/magazine-self-control-psychology/" },
  "/playfulness-test": { blog: "/magazine-playfulness-psychology/" },
  "/emotional-expressiveness-test": { blog: "/magazine-emotional-expressiveness-psychology/" },
  // A등급 22종 신규 브릿지 2026-06-23 (Apollo 실존 검증 매트릭스 기반, Hephaestus fs 재확인)
  "/burnout/test": {
    blog: "/magazine-burnout-psychology/",
    blogLocales: ['ko', 'en'],
    wiki: "/meaning-of-burnout/",
    wikiLocales: ['ko', 'en', 'ja'],
  },
  "/attachment-style/test": {
    blog: "/magazine-attachment-test/",
    blogLocales: ['ko', 'en'],
    wiki: "/meaning-of-attachment-theory/",
    wikiLocales: ['ko', 'en', 'ja'],
  },
  "/enneagram/test": {
    blog: "/enneagram-complete-types-guide/",
    wiki: "/meaning-of-enneagram/",
    wikiLocales: ['ko', 'en', 'ja'],
  },
  "/mbti/test": {
    blog: "/mbti-career-test/",
    wiki: "/meaning-of-mbti/",
    wikiLocales: ['ko', 'en', 'ja'],
  },
  "/sleep-type/test": {
    blog: "/chronotypes-sleep-biology-optimization/",
    blogLocales: ['ko', 'en', 'ja'],
    wiki: "/meaning-of-chronotypes/",
    wikiLocales: ['ko', 'en', 'ja'],
  },
  "/loneliness-test": { blog: "/magazine-loneliness-guide/", blogLocales: ['ko', 'en'] },
  "/mindfulness-test": { blog: "/magazine-mindfulness-guide/", blogLocales: ['ko', 'en'] },
  "/perfectionism/test": {
    blog: "/magazine-perfectionism-psychology/",
    blogLocales: ['ko', 'en'],
    wiki: "/meaning-of-perfectionism/",
    wikiLocales: ['ko', 'en', 'ja'],
  },
  "/riasec-career-test": {
    blog: "/riasec-career-complete-guide/",
    blogLocales: ['ko', 'en'],
    wiki: "/meaning-of-riasec/",
    wikiLocales: ['ko', 'en', 'ja'],
  },
  "/eq/test": { blog: "/magazine-emotional-intelligence-psychology/", blogLocales: ['ko', 'en'] },
  "/toxic-relationship-test": { blog: "/gaslighting-manipulation/", blogLocales: ['ko', 'en', 'ja'] },
  "/dopamine-dependency-test": {
    blog: "/dopamine-fasting-focus/",
    blogLocales: ['ko', 'en', 'ja'],
    wiki: "/meaning-of-dopamine-loop/",
    wikiLocales: ['ko', 'en', 'ja'],
  },
  "/hormones-test": {
    blog: "/hormones-and-metabolic-regulators/",
    blogLocales: ['ko', 'en', 'ja'],
    wiki: "/meaning-of-hormones/",
    wikiLocales: ['ko', 'en', 'ja'],
  },
  "/personal-color/test": {
    blog: "/personal-color-season-test/",
    wiki: "/meaning-of-color-psychology/",
    wikiLocales: ['ko', 'en', 'ja'],
  },
  "/lazy-perfectionist/test": {
    blog: "/lazy-perfectionism-lethargy-30-day-recovery/",
    blogLocales: ['ko', 'en', 'ja'],
    wiki: "/meaning-of-lazy-perfectionism/",
    wikiLocales: ['ko', 'en', 'ja'],
  },
  "/career-values-test": { blog: "/psychology-career-values-test/", blogLocales: ['ko', 'en'] },
  "/spending-habits-test": { blog: "/latte-factor-spending-habits/", blogLocales: ['ko', 'en'] },
  "/trust-style-test": { blog: "/trust-and-betrayal/", blogLocales: ['ko', 'en', 'ja'] },
  "/resilience-boost-test": { blog: "/magazine-resilience-psychology/", blogLocales: ['ko', 'en'] },
  "/focus-blocker-test": {
    blog: "/magazine-focus-concentration-guide/",
    blogLocales: ['ko', 'en'],
    wiki: "/meaning-of-executive-function/",
    wikiLocales: ['ko', 'en', 'ja'],
  },
  "/critical-thinking-test": { blog: "/critical-thinking-logic-guide/" },
  "/chimp-test": { blog: "/chimp-test-cognitive-memory/", blogLocales: ['ko', 'en'] },
  // C2-B 즉시 파트 2026-06-24 — A등급 7종 (blog+wiki 둘다) + B등급 10종 (한쪽만)
  // fs 검증 완료: ko=확인, en/ja 화이트리스트=실존 파일 기반
  // --- A등급 7종 ---
  "/big5/test": {
    blog: "/psychology-big-five-test/",
    blogLocales: ['ko', 'en'],
    wiki: "/meaning-of-big5/",
    wikiLocales: ['ko', 'en', 'ja'],
  },
  "/color-aura-test": {
    blog: "/color-psychology-complete-guide/",
    // color-psychology-complete-guide: en=NO ja=NO (fs 확인) → ko-only
    wiki: "/meaning-of-color-psychology/",
    wikiLocales: ['ko', 'en', 'ja'],
  },
  "/commute-mental/test": {
    blog: "/flow-state-happiness-psychology/",
    blogLocales: ['ko', 'en', 'ja'],
    wiki: "/meaning-of-cognitive-load/",
    wikiLocales: ['ko', 'en', 'ja'],
  },
  "/inner-strength/test": {
    blog: "/viktor-frankl-purpose/",
    blogLocales: ['ko', 'en', 'ja'],
    wiki: "/meaning-of-self-efficacy/",
    wikiLocales: ['ko', 'en', 'ja'],
  },
  "/lethargy/test": {
    blog: "/burnout-recovery-dopamine-reset/",
    blogLocales: ['ko', 'en', 'ja'],
    wiki: "/meaning-of-learned-helplessness/",
    wikiLocales: ['ko', 'en', 'ja'],
  },
  "/love-profile-test": {
    blog: "/five-love-languages-connection/",
    blogLocales: ['ko', 'en', 'ja'],
    wiki: "/meaning-of-attachment-theory/",
    wikiLocales: ['ko', 'en', 'ja'],
  },
  "/political/test": {
    blog: "/abilene-paradox-groupthink/",
    blogLocales: ['ko', 'en', 'ja'],
    wiki: "/meaning-of-cognitive-biases/",
    wikiLocales: ['ko', 'en', 'ja'],
  },
  // --- B등급 10종 (한쪽만) ---
  "/authoritarian/test": {
    blog: "/dark-triad-human-nature-shadow/",
    blogLocales: ['ko', 'en', 'ja'],
  },
  "/collab-risk-test": {
    blog: "/abilene-paradox-groupthink/",
    blogLocales: ['ko', 'en', 'ja'],
  },
  "/compatibility-test": {
    wiki: "/meaning-of-attachment-theory/",
    wikiLocales: ['ko', 'en', 'ja'],
  },
  "/depression/test": {
    wiki: "/meaning-of-learned-helplessness/",
    wikiLocales: ['ko', 'en', 'ja'],
  },
  "/happiness-meter-test": {
    blog: "/flow-state-happiness-psychology/",
    blogLocales: ['ko', 'en', 'ja'],
  },
  "/hexaco-personality-test": {
    wiki: "/meaning-of-hexaco/",
    wikiLocales: ['ko', 'en', 'ja'],
  },
  "/mental-clarity-test": {
    wiki: "/meaning-of-cognitive-load/",
    wikiLocales: ['ko', 'en', 'ja'],
  },
  "/personal-boundaries-test": {
    blog: "/magazine-boundary-psychology/",
    blogLocales: ['ko', 'en'],
  },
  "/sensory-processing-test": {
    wiki: "/meaning-of-hsp/",
    wikiLocales: ['ko', 'en', 'ja'],
  },
  "/tci-personality-test": {
    wiki: "/meaning-of-tci/",
    wikiLocales: ['ko', 'en', 'ja'],
  },
};

export function getRelatedReading(
  routeWithoutLocale: string,
  locale: Locale,
): { blog?: string; wiki?: string } | null {
  const key = routeWithoutLocale.replace(/\/$/, "") || "/";
  const entry = TEST_RELATED_READING[key];
  if (!entry) return null;
  const cl = contentLocale(locale);
  const out: { blog?: string; wiki?: string } = {};
  if (entry.blog) {
    const loc = resolveLocale(cl, entry.blogLocales ?? ['ko']);
    out.blog = `${BLOG_HOST}/${loc}${entry.blog}`;
  }
  if (entry.wiki) {
    const loc = resolveLocale(cl, entry.wikiLocales ?? ['ko']);
    out.wiki = `${WIKI_HOST}/${loc}${entry.wiki}`;
  }
  return (out.blog || out.wiki) ? out : null;
}
