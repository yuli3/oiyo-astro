import { getCollection } from 'astro:content';
import type { Locale } from '../i18n';

/**
 * 이관된 글이 실제로 존재하는 로케일.
 *
 * 왜 필요한가: 언어 전환기가 항상 6개 로케일을 다 제시하는데, 글은 로케일마다
 * 있지도 않다. 2026-09-08 실측으로 **내부 링크 4,566개가 하드 404** 였다
 * (fr 1,315 · es 1,315 · zh 1,268 · ja 420 · en 181 · ko 75). 방문자는 "Français"
 * 를 누르면 404 를 받고, 크롤러는 그 404 를 4,566번 따라간다.
 *
 * hreflang 쪽은 이미 정상이다 — Layout 이 존재하는 로케일만 내보낸다. 그래서 이건
 * 색인 신호가 아니라 **크롤 예산과 UX** 문제다.
 */
let cache: Map<string, Set<Locale>> | null = null;

export async function articleLocales(): Promise<Map<string, Set<Locale>>> {
  if (cache) return cache;
  const map = new Map<string, Set<Locale>>();
  for (const a of await getCollection('articles')) {
    const slug = a.id.split('/').pop()!.replace(/\.mdx?$/, '');
    const set = map.get(slug) ?? new Set<Locale>();
    set.add(a.data.locale as Locale);
    map.set(slug, set);
  }
  cache = map;
  return map;
}

/**
 * `pathWithoutLocale` 가 이관된 글이면 그 글이 있는 로케일을, 아니면 null 을 준다.
 * null 은 "제한하지 않는다"는 뜻이다 — 정적 라우트는 이 표에 없고, 없다는 이유로
 * 전환기를 잠그면 멀쩡한 링크까지 사라진다.
 */
export async function localesForPath(pathWithoutLocale: string): Promise<Set<Locale> | null> {
  const slug = pathWithoutLocale.replace(/^\/+|\/+$/g, '');
  if (!slug || slug.includes('/')) return null; // 글은 항상 한 세그먼트다
  const found = (await articleLocales()).get(slug);
  return found && found.size > 0 ? found : null;
}
