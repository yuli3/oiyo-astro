// 사이트맵에서 빼야 하는 noindex 라우트.
//
// 왜: astro.config.mjs 의 크롤 예산 주석이 "sitemap-listed but noindex is a
// contradictory signal"이라고 못박고 있는데, 실측(2026-08-31) 결과 14개 URL이
// 사이트맵에 있으면서 동시에 noindex 였다. 색인하지 말라고 해놓고 색인하라고
// 제출하는 셈이라 크롤 예산만 쓴다.
//
// robots meta 는 각 페이지가 <Layout noindex> 로 선언하므로 여기와 두 곳에서
// 정해진다. 어긋나면 audit-sitemap-noindex-consistency 가 잡는다.
const NOINDEX_PATTERNS = [
  /^\/$/,                                  // 루트 로케일 감지 스플래시
  /^\/about\/?$/,                          // 로케일 없는 about
  /^\/[a-z]{2}\/contact\/?$/,
  /^\/[a-z]{2}\/labs\//,
  /^\/[a-z]{2}\/profile\/relationship-comparison\/?$/,
];

export function isNoindexRoute(pathname) {
  return NOINDEX_PATTERNS.some((re) => re.test(pathname));
}
