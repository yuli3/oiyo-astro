import { getCollection } from 'astro:content';
import type { Locale } from '../i18n';

/**
 * 본문 안 CTA(<TestCTA>·<ToolCTA>)가 가리킬 oiyo 경로를 찾는다.
 *
 * blog 에서 글 1,131편을 옮겨 오면서 함께 온 문제다(2026-09-03 주제 정렬 4단계).
 * 원본 리졸버는 blog 안의 글·페이지를 뒤졌고, 없으면 CTA 를 아예 렌더하지
 * 않았다. 그 안전장치는 그대로 가져온다 — 깨진 내부 링크를 만들지 않는다.
 *
 * 실측: 이관 대상이 쓰는 키 82종 가운데 33종이 blog 에서도 해결되지 않아
 * 지금 CTA 가 렌더되지 않고 있었다(`psychology-test-slug` 같은 자리표시자까지
 * 있었다). 그중 실제로 oiyo 에 테스트가 있는 것들은 ALIAS 로 살려낸다.
 */

/** blog 시절의 키 → oiyo 실제 경로. 이름이 달라 자동으로는 못 찾는 것들만 적는다. */
const ALIAS: Record<string, string> = {
  riasec: 'riasec-career-test',
  'riasec-test': 'riasec-career-test',
  disc: 'disc-personality-test',
  lovelanguage: 'love-language/test',
  'love-language': 'love-language/test',
  'eq-insight': 'emotional-mind-test',
  'eq-test': 'emotional-mind-test',
  'self-esteem-compass': 'self-esteem/test',
  'self-esteem-test': 'self-esteem/test',
  'enneagram-intro': 'enneagram/test',
  'enneagram-full-test': 'enneagram/test',
  'mbti-career-test': 'mbti/career',
  'cognitive-bias-quiz': 'cognitive-bias-test',
  'color-psychology-quiz': 'color-personality-test',
  'color-psychology-test': 'color-personality-test',
  'mindfulness-guide': 'mindfulness-test',
  'narcissism-quiz': 'narcissism/test',
  'narcissism-self-check': 'narcissism/test',
  'narcissism-recovery': 'narcissism/test',
  'empathy-test': 'empathy/test',
  'burnout-test': 'burnout/test',
  'attachment-style': 'attachment-style/test',
  'big-five-test': 'big5/test',
  mbti: 'mbti/test',
};

let cache: Set<string> | null = null;

/** oiyo 가 실제로 가진 경로 집합. 정적 라우트 목록 + 이관된 글 슬러그. */
async function known(): Promise<Set<string>> {
  if (cache) return cache;
  const set = new Set<string>();
  const articles = await getCollection('articles');
  for (const a of articles) {
    set.add(`${a.data.locale}/${a.id.split('/').pop()!.replace(/\.mdx$/, '')}`);
  }
  cache = set;
  return set;
}

/**
 * 후보 경로를 만든다. `xxx-test` 는 oiyo 에서 `xxx/test` 로도 서 있는 경우가 많다.
 * 존재 확인은 빌드된 라우트가 아니라 호출부에서 넘긴 ROUTES 로 한다.
 */
function candidates(key: string): string[] {
  if (!key) return [];
  const out = [ALIAS[key], key];
  if (key.endsWith('-test')) out.push(`${key.slice(0, -5)}/test`);
  else out.push(`${key}/test`, `${key}-test`);
  return out.filter(Boolean) as string[];
}

/**
 * oiyo 의 정적 테스트 라우트. 이 목록에 있으면 존재하는 것으로 본다.
 * 라우트를 늘릴 때 여기도 같이 늘린다 — 없으면 CTA 가 조용히 사라진다.
 */
export const OIYO_TEST_ROUTES = new Set<string>([
  'mbti/test', 'mbti/career', 'big5/test', 'attachment-style/test', 'enneagram/test',
  'burnout/test', 'narcissism/test', 'self-esteem/test', 'empathy/test', 'love-language/test',
  'riasec-career-test', 'riasec-quick', 'disc-personality-test', 'emotional-mind-test',
  'cognitive-bias-test', 'color-personality-test', 'mindfulness-test', 'resilience-test',
  'growth-mindset-test', 'leadership-style-test', 'motivation-type-test', 'procrastination-type-test',
  'love-profile-test', 'career-values-test', 'life-values-test', 'introvert-extrovert-test',
  'coping-style-test', 'self-compassion-test', 'social-media-personality-test', 'stress-type-test',
  'stress-response-test', 'egogram-test', 'learning-style-test', 'hexaco-personality-test',
  'tci-personality-test', 'focus-blocker-test', 'anger-style/test', 'anxiety/test', 'depression/test',
  'adhd/test', 'social-anxiety/test', 'hsp-test', 'imposter-syndrome-test', 'loneliness-test',
  'perfectionism/test', 'emotion-regulation-test', 'cognitive-bias/about',
]);

/** 못 찾으면 null. 호출부는 null 이면 CTA 를 그리지 않는다. */
export async function resolveTestHref(key: string | undefined, locale: Locale): Promise<string | null> {
  if (!key) return null;
  const slugs = await known();
  for (const c of candidates(key)) {
    if (OIYO_TEST_ROUTES.has(c)) return `/${locale}/${c}/`;
    if (slugs.has(`${locale}/${c}`)) return `/${locale}/${c}/`;
  }
  return null;
}
