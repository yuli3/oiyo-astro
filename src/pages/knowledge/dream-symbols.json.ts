import type { APIRoute } from 'astro';
import { SITE_CONFIG } from '../../config/seo.config';
import { LOCALES } from '../../i18n';
import { DREAM_SYMBOLS, DREAM_CATEGORY_LABELS } from '../../data/dream-symbols';

/**
 * 꿈 상징 사전을 기계가 읽을 수 있게 낸다. /knowledge/dream-symbols.json
 *
 * 이 사전은 우리가 직접 만든 데이터다. 로케일별 항목을 통째로 실어 두면
 * 사이트 밖에서도 인용·검증할 수 있고, 우리 쪽 데이터셋으로도 쌓인다.
 */
export const GET: APIRoute = async () => {
  const base = SITE_CONFIG.url;
  const body = {
    name: `${SITE_CONFIG.name} — Dream symbol dictionary`,
    role: 'dataset',
    description:
      'Dream symbols with the traditional East Asian reading and the dream-research view kept in separate fields. ' +
      'Cultural symbol interpretation, not prediction.',
    publisher: { name: 'Oiyo Tech', url: base },
    license: 'https://creativecommons.org/licenses/by/4.0/',
    locales: LOCALES,
    count: DREAM_SYMBOLS.length,
    categories: DREAM_CATEGORY_LABELS,
    symbols: DREAM_SYMBOLS.map((s) => ({
      id: s.id,
      emoji: s.emoji,
      category: s.category,
      related: s.related,
      url: `${base}/{locale}/dream/${s.id}/`,
      l10n: s.l10n,
    })),
  };
  return new Response(JSON.stringify(body, null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
};
