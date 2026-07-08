/* eslint-disable no-restricted-syntax */
import { Locale } from "@/i18n";
import { features } from "@/registry/features";

// Sister sites for family nav (footer + mobile drawer). news/ai are
// single-locale (ko) sites — they have no /{locale}/ routes, so appending
// the locale path would land on their 404 page.
export const FAMILY_SITES = [
  { host: "blog.oiyo.net", localePath: true, name: "OIYO Blog", tag: { en: "Read — guides & magazine", es: "Leer — guías y revista", fr: "Lire — guides & magazine", ja: "読む — 講座・マガジン", ko: "읽는 곳 — 강의·매거진", zh: "阅读 — 课程·杂志" } },
  { host: "wiki.oiyo.net", localePath: true, name: "OIYO Wiki", tag: { en: "Look up — dictionary", es: "Buscar — diccionario", fr: "Chercher — dictionnaire", ja: "調べる — 用語事典", ko: "찾아보는 곳 — 개념 사전", zh: "查找 — 概念辞典" } },
  { host: "game.oiyo.net", localePath: true, name: "OIYO Arcade", tag: { en: "Play — games", es: "Jugar — juegos", fr: "Jouer — jeux", ja: "遊ぶ — ゲーム", ko: "노는 곳 — 게임", zh: "玩 — 游戏" } },
  { host: "news.oiyo.net", localePath: false, name: "OIYO News", tag: { en: "Watch — daily curation", es: "Ver — curación diaria", fr: "Voir — curation", ja: "見る — デイリー", ko: "보는 곳 — 데일리 큐레이션", zh: "看 — 每日精选" } },
  { host: "ai.oiyo.net", localePath: false, name: "OIYO AI", tag: { en: "AX — AI-native OS", es: "AX — OS con IA", fr: "AX — OS IA-native", ja: "AX — AI運用", ko: "AX — AI 운영 시스템", zh: "AX — AI 系统" } },
] as const;

export type FamilySite = (typeof FAMILY_SITES)[number];

export const familySiteHref = (f: FamilySite, locale: Locale, medium: string) =>
  `https://${f.host}/${f.localePath ? `${locale}/` : ""}?utm_source=oiyo&utm_medium=${medium}&utm_campaign=family_nav`;

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
  violet: "#8B5CF6",
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
    color: getColor(resonance?.color) || "#8B5CF6",
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
