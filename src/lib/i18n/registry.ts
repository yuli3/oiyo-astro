/**
 * 화면에 닿는 번역 묶음 목록.
 *
 * 2026-09-23 까지 이 파일은 "AUTO-GENERATED — DO NOT EDIT" 라고 적혀 있었지만
 * 만들던 스크립트(scripts/generate-i18n-registry.mjs)는 이미 없었고, 가리키는
 * 경로(`../../messages/...`)도 존재하지 않는 폴더였다. 실제 묶음은
 * `src/i18n/messages/<locale>/` 에 있다.
 *
 * 같은 날 읽히지 않는 묶음 316개(1,896 파일)를 지우면서 손으로 다시 적었다.
 * 지금은 `src/i18n/index.ts` 의 로더 목록, 백과사전 페이지, 그래프 라벨이
 * 읽는 묶음만 남는다. 새 묶음을 더하면 여기에도 한 줄을 더한다 —
 * `npm run audit:i18n-runtime-namespaces` 가 이 목록과 실제 사용을 대조한다.
 */

export const i18nRegistry: Record<string, (locale: string) => Promise<unknown>> = {
  about: (locale: string) => import(`@/i18n/messages/${locale}/about.json`),
  akashic: (locale: string) => import(`@/i18n/messages/${locale}/akashic.json`),
  big5: (locale: string) => import(`@/i18n/messages/${locale}/big5.json`),
  career: (locale: string) => import(`@/i18n/messages/${locale}/career.json`),
  catalog: (locale: string) => import(`@/i18n/messages/${locale}/catalog.json`),
  common: (locale: string) => import(`@/i18n/messages/${locale}/common.json`),
  contact: (locale: string) => import(`@/i18n/messages/${locale}/contact.json`),
  dashboard: (locale: string) => import(`@/i18n/messages/${locale}/dashboard.json`),
  elements: (locale: string) => import(`@/i18n/messages/${locale}/elements.json`),
  error: (locale: string) => import(`@/i18n/messages/${locale}/error.json`),
  faq: (locale: string) => import(`@/i18n/messages/${locale}/faq.json`),
  header: (locale: string) => import(`@/i18n/messages/${locale}/header.json`),
  hero: (locale: string) => import(`@/i18n/messages/${locale}/hero.json`),
  hobby: (locale: string) => import(`@/i18n/messages/${locale}/hobby.json`),
  landing: (locale: string) => import(`@/i18n/messages/${locale}/landing.json`),
  legal: (locale: string) => import(`@/i18n/messages/${locale}/legal.json`),
  marketing: (locale: string) => import(`@/i18n/messages/${locale}/marketing.json`),
  nav: (locale: string) => import(`@/i18n/messages/${locale}/nav.json`),
  navigation: (locale: string) => import(`@/i18n/messages/${locale}/navigation.json`),
  onomancy: (locale: string) => import(`@/i18n/messages/${locale}/onomancy.json`),
  ontology: (locale: string) => import(`@/i18n/messages/${locale}/ontology.json`),
  page: (locale: string) => import(`@/i18n/messages/${locale}/page.json`),
  saju: (locale: string) => import(`@/i18n/messages/${locale}/saju.json`),
  "saju-daymaster": (locale: string) => import(`@/i18n/messages/${locale}/saju-daymaster.json`),
  seo: (locale: string) => import(`@/i18n/messages/${locale}/seo.json`),
  support: (locale: string) => import(`@/i18n/messages/${locale}/support.json`),
  ui: (locale: string) => import(`@/i18n/messages/${locale}/ui.json`),
  universal: (locale: string) => import(`@/i18n/messages/${locale}/universal.json`),
  zodiac: (locale: string) => import(`@/i18n/messages/${locale}/zodiac.json`),
};
