// Lightweight "read deeper" cross-links for psychology tests → their blog guide
// (and wiki definition where it exists). Auto-rendered by Layout.astro from the
// page route (no per-page edits). URL-only — no per-locale authored content, so it
// scales cheaply (the rich TestContentBridge stays for premium tests like mbti/big5).
// Targets verified live 2026-06-22; ko canonical content.
// 2026-06-23: urgent 5건 교체(404 위험 → 실존 slug), A등급 22종 신규 추가.
// 2026-06-24: locale-aware refactor — slug-only + blogLocales/wikiLocales whitelist.
//   en/ja availability determined by fs check on blog/wiki repos at authoring time.
//   미지정 = ko-only (기존 동작 유지, 회귀 0). ko 폴백 항상 안전망.
// 2026-06-24: zh/fr/es 확장 — contentLocale pass-through + resolveLocale 폴백 체인.
//   blog: dopamine-fasting-focus, five-love-languages-connection → zh/fr/es 모두.
//   wiki: 25개 slug 전부 → zh/fr/es 모두. fs 직접 확인 결과 반영.

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

/**
 * blog/wiki 콘텐츠 로케일 pass-through.
 * 6개 지원 로케일(ko/en/ja/zh/fr/es) 모두 자기 자신 반환.
 * 구버전: ko→ko, ja→ja, 나머지→en (zh/fr/es가 화이트리스트에 있어도 무시되던 버그).
 */
function contentLocale(locale: Locale): Locale {
  return locale;
}

/**
 * 폴백 체인: [locale, 'en', 'ko'] 순서로 화이트리스트에 있는 첫 로케일 반환.
 * ko는 항상 타깃 존재(안전망). en/ja 기존 동작 무회귀:
 *   - en 뷰어 + en 화이트리스트 → en (1순위 자기 자신)
 *   - ja 뷰어 + ja 화이트리스트 → ja (1순위 자기 자신)
 *   - zh 뷰어 + zh 화이트리스트 → zh (1순위 자기 자신)
 *   - zh 뷰어 + zh 없음 + en 있음 → en (2순위)
 *   - zh 뷰어 + zh/en 없음 → ko (3순위 최종 안전망)
 */
function resolveLocale(locale: Locale, available: Locale[]): Locale {
  for (const candidate of [locale, 'en' as Locale, 'ko' as Locale]) {
    if (available.includes(candidate)) return candidate;
  }
  return 'ko'; // 절대 도달 불가 (ko는 항상 기본값으로 존재)
}

// key = route without locale prefix (e.g. "/iq-test")
export const TEST_RELATED_READING: Record<string, RelatedReading> = {
  "/iq-test": { blog: "/iq-test-free/" },
  "/hsp-test": { wiki: "/meaning-of-hsp/", wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/procrastination-type-test": { blog: "/procrastination-type-test/" },
  // 긴급 5건 교체 2026-06-23: 기존 slug(404 위험) → 실존 slug
  "/communication-style-test": { blog: "/magazine-communication-style-psychology/", blogLocales: ['ko', 'en'] },
  "/conflict-style-test": { blog: "/magazine-conflict-style-psychology/", blogLocales: ['ko', 'en'] },
  "/stress-type-test": { blog: "/mbti-stress-type-test/" },
  "/resilience-test": { blog: "/resilience-test/" },
  "/grit-scale-test": { blog: "/resilience-science/", blogLocales: ['ko', 'en'] },
  "/imposter-syndrome-test": { blog: "/imposter-syndrome-doubt/", blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/cognitive-bias-test": { blog: "/cognitive-bias-complete-guide/" },
  "/decision-making-test": { blog: "/magazine-decision-making-psychology/", blogLocales: ['ko', 'en'] },
  "/self-compassion-test": {
    blog: "/magazine-self-compassion-psychology/",
    blogLocales: ['ko', 'en'],
    wiki: "/meaning-of-self-compassion/",
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
  },
  "/learning-style-test": {
    blog: "/learning-styles-efficiency/",
    blogLocales: ['ko', 'en'],
    wiki: "/meaning-of-learning-styles/",
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
  },
  "/emotion-regulation-test": {
    blog: "/magazine-emotion-regulation-psychology/",
    blogLocales: ['ko', 'en'],
    wiki: "/meaning-of-emotion-regulation/",
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
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
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
  },
  "/inner-child-test": { blog: "/trauma-healing-psychology/" },
  // 2026-06-23 기존 테스트 → 기존 매거진/가이드 매칭 (codex-free 확대)
  "/anger-style/test": { blog: "/magazine-anger-style-psychology/", blogLocales: ['ko', 'en'] },
  "/adhd/test": {
    blog: "/adult-adhd-survival-guide/",
    blogLocales: ['ko', 'en'],
    wiki: "/meaning-of-adhd/",
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
  },
  "/anxiety/test": {
    blog: "/magazine-anxiety-insomnia-psychology/",
    wiki: "/meaning-of-anxiety/",
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
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
  "/money-personality-test": { blog: "/psychology-of-money/", blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
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
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
  },
  "/attachment-style/test": {
    blog: "/magazine-attachment-test/",
    blogLocales: ['ko', 'en'],
    wiki: "/meaning-of-attachment-theory/",
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
  },
  "/enneagram/test": {
    blog: "/enneagram-complete-types-guide/",
    wiki: "/meaning-of-enneagram/",
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
  },
  "/mbti/test": {
    blog: "/mbti-career-test/",
    wiki: "/meaning-of-mbti/",
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
  },
  "/sleep-type/test": {
    blog: "/chronotypes-sleep-biology-optimization/",
    blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'], // 2026-06-24 zh/fr/es 번역 추가
    wiki: "/meaning-of-chronotypes/",
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
  },
  "/loneliness-test": { blog: "/magazine-loneliness-guide/", blogLocales: ['ko', 'en'] },
  "/mindfulness-test": { blog: "/magazine-mindfulness-guide/", blogLocales: ['ko', 'en'] },
  "/perfectionism/test": {
    blog: "/magazine-perfectionism-psychology/",
    blogLocales: ['ko', 'en'],
    wiki: "/meaning-of-perfectionism/",
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
  },
  "/riasec-career-test": {
    blog: "/riasec-career-complete-guide/",
    blogLocales: ['ko', 'en'],
    wiki: "/meaning-of-riasec/",
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
  },
  "/eq/test": { blog: "/magazine-emotional-intelligence-psychology/", blogLocales: ['ko', 'en'] },
  "/toxic-relationship-test": { blog: "/gaslighting-manipulation/", blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/dopamine-dependency-test": {
    blog: "/dopamine-fasting-focus/",
    blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
    wiki: "/meaning-of-dopamine-loop/",
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
  },
  "/hormones-test": {
    blog: "/hormones-and-metabolic-regulators/",
    blogLocales: ['ko', 'en', 'ja'], // zh/fr/es 없음(fs 확인)
    wiki: "/meaning-of-hormones/",
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
  },
  "/personal-color/test": {
    blog: "/personal-color-season-test/",
    wiki: "/meaning-of-color-psychology/",
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
  },
  "/lazy-perfectionist/test": {
    blog: "/lazy-perfectionism-lethargy-30-day-recovery/",
    blogLocales: ['ko', 'en', 'ja'], // zh/fr/es 없음(fs 확인)
    wiki: "/meaning-of-lazy-perfectionism/",
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
  },
  "/career-values-test": { blog: "/psychology-career-values-test/", blogLocales: ['ko', 'en'] },
  "/spending-habits-test": { blog: "/latte-factor-spending-habits/", blogLocales: ['ko', 'en'] },
  "/trust-style-test": { blog: "/trust-and-betrayal/", blogLocales: ['ko', 'en', 'ja'] },
  "/resilience-boost-test": { blog: "/magazine-resilience-psychology/", blogLocales: ['ko', 'en'] },
  "/focus-blocker-test": {
    blog: "/magazine-focus-concentration-guide/",
    blogLocales: ['ko', 'en'],
    wiki: "/meaning-of-executive-function/",
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
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
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
  },
  "/color-aura-test": {
    blog: "/color-psychology-complete-guide/",
    // color-psychology-complete-guide: en=NO ja=NO zh=NO fr=NO es=NO (fs 확인) → ko-only
    wiki: "/meaning-of-color-psychology/",
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
  },
  "/commute-mental/test": {
    blog: "/flow-state-happiness-psychology/",
    blogLocales: ['ko', 'en', 'ja'], // zh/fr/es 없음(fs 확인)
    wiki: "/meaning-of-cognitive-load/",
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
  },
  "/inner-strength/test": {
    blog: "/viktor-frankl-purpose/",
    blogLocales: ['ko', 'en', 'ja'], // zh/fr/es 없음(fs 확인)
    wiki: "/meaning-of-self-efficacy/",
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
  },
  "/lethargy/test": {
    blog: "/burnout-recovery-dopamine-reset/",
    blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
    wiki: "/meaning-of-learned-helplessness/",
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
  },
  "/love-profile-test": {
    blog: "/five-love-languages-connection/",
    blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
    wiki: "/meaning-of-attachment-theory/",
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
  },
  "/political/test": {
    blog: "/abilene-paradox-groupthink/",
    blogLocales: ['ko', 'en', 'ja'], // zh/fr/es 없음(fs 확인)
    wiki: "/meaning-of-cognitive-biases/",
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
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
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
  },
  "/depression/test": {
    wiki: "/meaning-of-learned-helplessness/",
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
  },
  "/happiness-meter-test": {
    blog: "/flow-state-happiness-psychology/",
    blogLocales: ['ko', 'en', 'ja'],
  },
  "/hexaco-personality-test": {
    wiki: "/meaning-of-hexaco/",
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
  },
  "/mental-clarity-test": {
    wiki: "/meaning-of-cognitive-load/",
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
  },
  "/personal-boundaries-test": {
    blog: "/magazine-boundary-psychology/",
    blogLocales: ['ko', 'en'],
  },
  "/sensory-processing-test": {
    wiki: "/meaning-of-hsp/",
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
  },
  "/tci-personality-test": {
    wiki: "/meaning-of-tci/",
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
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

// ---------------------------------------------------------------------------
// fs 검증 메모 (2026-06-24, authoring-time 기록 — 빌드타임 import 아님)
// ---------------------------------------------------------------------------
// blog: blog/src/content/blog/{zh,fr,es}/<slug>.mdx 직접 확인 결과
//   zh/fr/es 모두 존재: dopamine-fasting-focus, five-love-languages-connection
//   그 외 blog slug: zh/fr/es 없음 → 추가 안 함 (폴백 체인이 en/ko로 처리)
//
// wiki: wiki/src/content/blog/{zh,fr,es}/<slug>.mdx 직접 확인 결과
//   zh/fr/es 모두 존재 (25개 전부):
//   meaning-of-hsp, meaning-of-self-compassion, meaning-of-learning-styles,
//   meaning-of-emotion-regulation, meaning-of-adhd, meaning-of-anxiety,
//   meaning-of-burnout, meaning-of-attachment-theory, meaning-of-enneagram,
//   meaning-of-mbti, meaning-of-chronotypes, meaning-of-perfectionism,
//   meaning-of-riasec, meaning-of-self-efficacy, meaning-of-executive-function,
//   meaning-of-dopamine-loop, meaning-of-hormones, meaning-of-color-psychology,
//   meaning-of-lazy-perfectionism, meaning-of-big5, meaning-of-cognitive-load,
//   meaning-of-learned-helplessness, meaning-of-cognitive-biases,
//   meaning-of-hexaco, meaning-of-tci
