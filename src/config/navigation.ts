/* eslint-disable no-restricted-syntax */
import type { Locale } from "@/i18n";

// Sister sites for family nav (footer only — 세운 결정 2026-09-24). news is a
// single-locale (ko) site — it has no /{locale}/ routes, so appending
// the locale path would land on their 404 page.
export const FAMILY_SITES = [
  { host: "oiyo.net", localePath: true, name: "OIYO tests", tag: { en: "Psychology tests", es: "Tests psicológicos", fr: "Tests psychologiques", ja: "心理テスト", ko: "심리테스트", zh: "心理测试" } },
  { host: "blog.oiyo.net", localePath: true, name: "OIYO blog", tag: { en: "Courses", es: "Cursos", fr: "Cours", ja: "講座", ko: "강의", zh: "课程" } },
  { host: "game.oiyo.net", localePath: true, name: "OIYO game", tag: { en: "Games", es: "Juegos", fr: "Jeux", ja: "ゲーム", ko: "게임", zh: "游戏" } },
  { host: "news.oiyo.net", localePath: false, name: "OIYO news", tag: { en: "News & AI", es: "Noticias e IA", fr: "Actualités et IA", ja: "ニュース・AI", ko: "뉴스·AI", zh: "新闻·AI" } },
] as const;

export type FamilySite = (typeof FAMILY_SITES)[number];

export const familySiteHref = (f: FamilySite, locale: Locale, medium: string) => {
  // 2026-09-28 O11: news 도 홈으로 보낸다. 2026-08-24 에는 "news 홈을 구글이 모른다"는 이유로
  // ai/curator/ 로 보냈지만, 9/27 GSC 에서 news 가 노출 47·평균 5.4위를 받고 있고 다른 네 사이트
  // 푸터는 모두 홈으로 보낸다. 라벨도 "뉴스·AI" 라서 AI 큐레이터 한 페이지로 가면 이름과 어긋난다.
  const path = f.localePath ? `${locale}/` : "";
  return `https://${f.host}/${path}?utm_source=oiyo&utm_medium=${medium}&utm_campaign=family_nav`;
};

export const familySiteTag = (f: FamilySite, locale: Locale) =>
  f.tag[locale as keyof typeof f.tag] ?? f.tag.en;
