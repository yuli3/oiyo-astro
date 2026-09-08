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
  /**
   * 개념 정의를 가진 사이트. 미지정 = 'wiki'.
   * 2026-09-02: 심리 6개 주제의 해설이 oiyo 로 옮겨졌다 — 그 항목은 'oiyo'.
   */
  defSite?: 'wiki' | 'oiyo';
  /**
   * blog 슬롯 타깃이 실제로 사는 사이트. 미지정 = 'blog'.
   * 2026-09-08: 해설 다수가 oiyo 로 이관돼 blog 경로가 301 이 됐다. 슬롯이 blog/wiki
   * 둘뿐이라 이관분을 wiki 슬롯에 밀어넣으면 이미 wiki 를 쓰는 항목과 충돌한다.
   */
  blogSite?: 'blog' | 'oiyo';
}

const BLOG_HOST = "https://blog.oiyo.net";
const WIKI_HOST = "https://wiki.oiyo.net";
const OIYO_HOST = "https://oiyo.net";

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
  "/hsp-test": {},
  "/procrastination-type-test": {},
  // 긴급 5건 교체 2026-06-23: 기존 slug(404 위험) → 실존 slug
  "/communication-style-test": {},
  "/conflict-style-test": {},
  "/stress-type-test": { blog: "/mbti-stress-relief/", blogLocales: ['ko', 'zh', 'fr', 'es'] },
  "/resilience-test": {},
  "/grit-scale-test": { blog: "/resilience-science/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/imposter-syndrome-test": { blog: "/imposter-syndrome-doubt/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/cognitive-bias-test": { blog: "/cognitive-bias-complete-guide/", blogSite: 'oiyo', blogLocales: ['ko', 'zh', 'fr', 'es'] },
  "/decision-making-test": {},
  "/self-compassion-test": { blog: "/magazine-self-compassion-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/learning-style-test": {},
  "/emotion-regulation-test": { blog: "/magazine-emotion-regulation-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'], wiki: "/emotion-regulation/about/", defSite: 'oiyo', wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  // 2026-06-23 새 테스트 → 새 매거진 가이드 (codex 생성)
  "/workaholic-test": { blog: "/magazine-workaholism-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'zh', 'fr', 'es'] },
  "/fomo-test": { blog: "/magazine-fomo-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'zh', 'fr', 'es'] },
  "/money-anxiety-test": { blog: "/magazine-money-anxiety-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'zh', 'fr', 'es'] },
  "/assertiveness-test": {},
  "/relationship-boredom-test": { blog: "/magazine-relationship-boredom-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'zh', 'fr', 'es'] },
  "/social-comparison-test": { blog: "/magazine-social-comparison-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'zh', 'fr', 'es'] },
  // 기존 매거진 가이드와 매칭
  "/shadow-self-test": { blog: "/jung-shadow-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/self-efficacy-test": { blog: "/magazine-growth-mindset-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/inner-child-test": { blog: "/trauma-healing-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'zh', 'fr', 'es'] },
  // 2026-06-23 기존 테스트 → 기존 매거진/가이드 매칭 (codex-free 확대)
  "/anger-style/test": { blog: "/anger-management-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'en'] },
  "/adhd/test": {},
  "/anxiety/test": { blog: "/magazine-anxiety-insomnia-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'zh', 'fr', 'es'] },
  "/boundary-style-test": {},
  "/color-personality-test": { blog: "/color-psychology-complete-guide/", blogSite: 'oiyo', blogLocales: ['ko', 'zh', 'fr', 'es'] },
  // 이 해설은 blog 가 아니라 oiyo 에 있고 6로케일 전부 200 이다. blog 경로로 두면
  // 다섯 로케일은 301 을 타고 ja 는 링크 자체가 없어 페이지가 더 얇아졌다(2026-09-08).
  "/coping-style-test": { wiki: "/magazine-coping-style-psychology/", defSite: 'oiyo', wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  // 색 재인 게임의 짝은 작업기억 해설이다 — 왜 뒤 라운드가 어려워지는지 설명한다.
  "/color-memory-test": { wiki: "/cognitive-load/about/", defSite: 'oiyo', wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/creativity-type-test": { blog: "/magazine-creativity-type-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/disc-personality-test": { blog: "/magazine-disc-personality-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/egogram-test": { blog: "/magazine-egogram-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/empathy/test": {},
  "/growth-mindset-test": { blog: "/magazine-growth-mindset-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/introvert-extrovert-test": { blog: "/magazine-introvert-extrovert-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/investment-type/test": { blog: "/magazine-investment-psychology-guide/", blogLocales: ['ko', 'en', 'zh', 'fr', 'es'] },
  "/leadership-style-test": { blog: "/magazine-leadership-style-psychology/", blogLocales: ['ko', 'en', 'zh', 'fr', 'es'] },
  "/life-values-test": { blog: "/magazine-life-values-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/love-language/test": {},
  "/mbti-love-test": { blog: "/magazine-mbti-love-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/money-personality-test": { blog: "/psychology-of-money/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/motivation-type-test": { blog: "/magazine-motivation-type-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/narcissism/test": { blog: "/narcissism-psychology-guide/", blogSite: 'oiyo', blogLocales: ['ko', 'zh', 'fr', 'es'] },
  "/optimism-test": { blog: "/magazine-optimism-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/parenting-style-test": { blog: "/magazine-parenting-psychology-guide/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/self-esteem/test": { blog: "/magazine-self-esteem-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/social-anxiety/test": { blog: "/magazine-social-anxiety-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/work-style-test": { blog: "/magazine-work-style-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  // 2026-06-23 신규 테스트 9종 전용 가이드 (codex 생성) — 삼각 완성
  "/entrepreneurial-aptitude-test": { blog: "/magazine-entrepreneurship-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'zh', 'fr', 'es'] },
  "/self-concept-clarity-test": { blog: "/magazine-self-concept-clarity-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'zh', 'fr', 'es'] },
  "/jealousy-type-test": { blog: "/magazine-jealousy-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'zh', 'fr', 'es'] },
  "/curiosity-test": { blog: "/magazine-curiosity-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'zh', 'fr', 'es'] },
  "/locus-of-control-test": { blog: "/magazine-locus-of-control-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'zh', 'fr', 'es'] },
  "/emotional-labor-test": { blog: "/magazine-emotional-labor-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'zh', 'fr', 'es'] },
  "/self-control-test": { blog: "/magazine-self-control-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'zh', 'fr', 'es'] },
  "/playfulness-test": { blog: "/magazine-playfulness-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'zh', 'fr', 'es'] },
  "/emotional-expressiveness-test": { blog: "/magazine-emotional-expressiveness-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'zh', 'fr', 'es'] },
  // A등급 22종 신규 브릿지 2026-06-23 (Apollo 실존 검증 매트릭스 기반, Hephaestus fs 재확인)
  "/burnout/test": { blog: "/magazine-burnout-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'], wiki: "/burnout/about/", defSite: 'oiyo', wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/attachment-style/test": { wiki: "/attachment-style/about/", defSite: 'oiyo', wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/enneagram/test": { blog: "/enneagram-complete-types-guide/", blogSite: 'oiyo', blogLocales: ['ko', 'zh', 'fr', 'es'] },
  "/mbti/test": { blog: "/mbti/career/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'], wiki: "/mbti/about/", defSite: 'oiyo', wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/sleep-type/test": { blog: "/chronotypes-sleep-biology-optimization/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'], wiki: "/chronotypes/about/", defSite: 'oiyo', wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/loneliness-test": {},
  "/mindfulness-test": { blog: "/magazine-mindfulness-guide/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/perfectionism/test": { blog: "/magazine-perfectionism-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'], wiki: "/perfectionism/about/", defSite: 'oiyo', wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/riasec-career-test": { blog: "/riasec-career-complete-guide/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/eq/test": { blog: "/emotional-intelligence-guide/", blogSite: 'oiyo', blogLocales: ['ko', 'en'] },
  "/toxic-relationship-test": { blog: "/gaslighting-manipulation/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/dopamine-dependency-test": { blog: "/dopamine-fasting-focus/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/hormones-test": { wiki: "/hormones/about/", defSite: 'oiyo', wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/personal-color/test": {},
  "/lazy-perfectionist/test": { blog: "/lazy-perfectionism-lethargy-30-day-recovery/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/career-values-test": { blog: "/psychology-career-values-test/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/spending-habits-test": { blog: "/latte-factor-spending-habits/", blogLocales: ['ko', 'en', 'zh', 'fr', 'es'] },
  "/trust-style-test": {},
  "/resilience-boost-test": { blog: "/magazine-resilience-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/focus-blocker-test": {},
  "/critical-thinking-test": { blog: "/critical-thinking-logic-guide/", blogLocales: ['ko', 'zh', 'fr', 'es'] },
  "/chimp-test": {},
  // C2-B 즉시 파트 2026-06-24 — A등급 7종 (blog+wiki 둘다) + B등급 10종 (한쪽만)
  // fs 검증 완료: ko=확인, en/ja 화이트리스트=실존 파일 기반
  // --- A등급 7종 ---
  "/big5/test": { wiki: "/big5/about/", defSite: 'oiyo', wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/color-aura-test": { blog: "/color-psychology-complete-guide/", blogSite: 'oiyo', blogLocales: ['ko', 'zh', 'fr', 'es'] },
  "/inner-strength/test": { blog: "/viktor-frankl-purpose/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/lethargy/test": { blog: "/burnout-recovery-dopamine-reset/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/love-profile-test": { blog: "/love-language/test/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'], wiki: "/attachment-style/about/", defSite: 'oiyo', wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/political/test": { blog: "/abilene-paradox-groupthink/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'], wiki: "/cognitive-bias/about/", defSite: 'oiyo', wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  // --- B등급 10종 (한쪽만) ---
  "/authoritarian/test": { blog: "/dark-triad-human-nature-shadow/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/collab-risk-test": { blog: "/abilene-paradox-groupthink/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/compatibility-test": {
    wiki: "/attachment-style/about/",
    defSite: 'oiyo',
    wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'],
  },
  "/depression/test": {},
  "/happiness-meter-test": { blog: "/flow-state-happiness-psychology/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/hexaco-personality-test": { wiki: "/hexaco/about/", defSite: 'oiyo', wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/mental-clarity-test": { wiki: "/cognitive-load/about/", defSite: 'oiyo', wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/personal-boundaries-test": { blog: "/boundary-style-test/", blogSite: 'oiyo', blogLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  "/sensory-processing-test": { wiki: "/hsp-test/", defSite: 'oiyo', wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
  // 2026-06-25 C등급 신규 wiki 정의(ko) 연결
  "/codependency-test": {},
  "/emotional-eating-test": {},
  "/work-life-balance-test": {},
  "/tci-personality-test": { wiki: "/tci/about/", defSite: 'oiyo', wikiLocales: ['ko', 'en', 'ja', 'zh', 'fr', 'es'] },
};

export function getRelatedReading(
  routeWithoutLocale: string,
  locale: Locale,
): { blog?: string; wiki?: string } | null {
  const key = routeWithoutLocale.replace(/\/$/, "") || "/";
  const entry = TEST_RELATED_READING[key];
  if (!entry) return null;
  const cl = contentLocale(locale);
  // 패밀리 정본 URL 은 후행 슬래시를 쓴다 — 없으면 각 호스트가 301/308 로 넘긴다.
  const slash = (u: string) => (u.endsWith('/') ? u : `${u}/`);
  const out: { blog?: string; wiki?: string } = {};
  if (entry.blog) {
    const host = entry.blogSite === 'oiyo' ? OIYO_HOST : BLOG_HOST;
    const loc = resolveLocale(cl, entry.blogLocales ?? ['ko']);
    out.blog = slash(`${host}/${loc}${entry.blog}`);
  }
  if (entry.wiki) {
    // oiyo 해설이라고 6로케일이 다 있는 것은 아니다 — 2026-09-08 실측으로 71개 타깃 중
    // 23개가 4개 이하였다. 화이트리스트를 건너뛰면 없는 로케일에 404 를 링크하게 된다.
    const host = entry.defSite === 'oiyo' ? OIYO_HOST : WIKI_HOST;
    const loc = resolveLocale(cl, entry.wikiLocales ?? ['ko']);
    out.wiki = slash(`${host}/${loc}${entry.wiki}`);
  }
  return (out.blog || out.wiki) ? out : null;
}

// ---------------------------------------------------------------------------
// fs 검증 메모 (2026-06-24, authoring-time 기록 — 빌드타임 import 아님)
// ---------------------------------------------------------------------------
// blog: blog/src/content/blog/{ko,en,ja,zh,fr,es}/<slug>.mdx 직접 확인 결과를
//   위 RELATED_READING_ENTRIES의 blogLocales에 동기화한다.
//   미존재 로케일은 resolveLocale 폴백 체인이 en/ko로 처리한다.
//
// wiki: wiki/src/content/blog/{zh,fr,es}/<slug>.mdx 직접 확인 결과
//   zh/fr/es 모두 존재 (25개 전부):
//   meaning-of-hsp, meaning-of-self-compassion, meaning-of-learning-styles,
//   meaning-of-emotion-regulation, meaning-of-adhd, meaning-of-anxiety,
//   (2026-09-02: mbti·attachment-theory·burnout·perfectionism·cognitive-biases·big5
//    6개는 oiyo 로 이관됐다. 아래 목록은 그 이전 시점의 wiki 실측 기록이다.)
//   meaning-of-burnout, meaning-of-attachment-theory, meaning-of-enneagram,
//   meaning-of-mbti, meaning-of-chronotypes, meaning-of-perfectionism,
//   meaning-of-riasec, meaning-of-self-efficacy, meaning-of-executive-function,
//   meaning-of-dopamine-loop, meaning-of-hormones, meaning-of-color-psychology,
//   meaning-of-lazy-perfectionism, meaning-of-big5, meaning-of-cognitive-load,
//   meaning-of-learned-helplessness, meaning-of-cognitive-biases,
//   meaning-of-hexaco, meaning-of-tci
