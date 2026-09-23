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
  // news home is unknown to Google. /radar/ was retired 2026-08-24 (merged
  // into the AI curator) — ai/curator/ is now the durable indexable page.
  const path = f.host === "news.oiyo.net" ? "ai/curator/" : f.localePath ? `${locale}/` : "";
  return `https://${f.host}/${path}?utm_source=oiyo&utm_medium=${medium}&utm_campaign=family_nav`;
};

export const familySiteTag = (f: FamilySite, locale: Locale) =>
  f.tag[locale as keyof typeof f.tag] ?? f.tag.en;
