/* eslint-disable no-restricted-syntax */
import type { Locale } from "@/i18n";
import { features } from "@/registry/features";

// Sister sites for family nav (footer + mobile drawer). news is a
// single-locale (ko) site — it has no /{locale}/ routes, so appending
// the locale path would land on their 404 page.
export const FAMILY_SITES = [
  { host: "oiyo.net", localePath: true, name: "OIYO tests", tag: { en: "Psychology tests", es: "Tests psicológicos", fr: "Tests psychologiques", ja: "心理テスト", ko: "심리테스트", zh: "心理测试" } },
  { host: "blog.oiyo.net", localePath: true, name: "OIYO blog", tag: { en: "Courses", es: "Cursos", fr: "Cours", ja: "講座", ko: "강의", zh: "课程" } },
  { host: "wiki.oiyo.net", localePath: true, name: "OIYO wiki", tag: { en: "Knowledge repository", es: "Archivo de conocimiento", fr: "Réserve de connaissances", ja: "知識倉庫", ko: "지식창고", zh: "知识库" } },
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

export interface DesktopNavItem {
  className?: string;
  featureId?: string;
  href: string;
  id: string;
}

export interface MobileNavItem {
  color: string;
  featureId?: string;
  href: string;
  icon: string;
  id: string;
  labelEn: string; // Fallback labels
  translationKey: string;
}

const COLOR_MAP: Record<string, string> = {
  amber: "#F59E0B",
  blue: "#3B82F6",
  cyan: "#06B6D4",
  green: "#10B981",
  lime: "#84CC16",
  neutral: "#737373",
  orange: "#F97316",
  pink: "#EC4899",
  purple: "#14B8A6", // Mapped to Teal
  red: "#EF4444",
  rose: "#F43F5E",
  sky: "#0EA5E9",
  slate: "#64748B",
  stone: "#78716C",
  teal: "#14B8A6",
  violet: "#5B915F",
  yellow: "#EAB308",
  zinc: "#71717A",
};

const getColor = (colorName: string | undefined): string => {
  if (!colorName) return "#6b7280";
  if (colorName.startsWith("#")) return colorName;
  return COLOR_MAP[colorName] || colorName;
};

// Features of Interest
const ontology = features["ontology"];
const resonance = features["resonance"]; // V2 Path
const dailyLucky = features["daily-lucky-v2"] || features["daily-lucky"];

export const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  {
    color: "#000000",
    href: "/",
    icon: "home",
    id: "home",
    labelEn: "Home",
    translationKey: "home",
  },
  {
    color: getColor(dailyLucky?.color) || "#10B981",
    featureId: dailyLucky?.id,
    href: dailyLucky?.path || "/today",
    icon: "Sparkles",
    id: "daily",
    labelEn: "Daily",
    translationKey: "daily",
  },
  {
    color: getColor(ontology?.color) || "#06B6D4",
    featureId: ontology?.id,
    href: ontology?.path || "/ontology",
    icon: "Moon",
    id: "ontology",
    labelEn: "Destiny",
    translationKey: "saju", // Keep translation key if 'Destiny' is desired, or change to 'ontology'
  },
  {
    color: getColor(resonance?.color) || "#5B915F",
    featureId: resonance?.id,
    href: resonance?.path || "/resonance",
    icon: "Waves",
    id: "resonance",
    labelEn: "Resonance",
    translationKey: "resonance",
  },
  {
    color: "#000000",
    href: "/me",
    icon: "User",
    id: "me",
    labelEn: "Me",
    translationKey: "profile",
  },
];

export const DESKTOP_NAV_ITEMS: DesktopNavItem[] = [
  {
    className: "hover:text-green-500",
    featureId: "ontology",
    href: "/ontology",
    id: "ontology",
  },
  {
    className: "hover:text-green-500",
    featureId: "resonance",
    href: "/resonance",
    id: "resonance",
  },
  {
    className: "hover:text-green-500",
    featureId: "horoscope",
    href: "/horoscope",
    id: "horoscope",
  },
  {
    className: "hover:text-green-500",
    href: "https://blog.oiyo.net",
    id: "blog",
  },
];
