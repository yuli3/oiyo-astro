/* eslint-disable no-restricted-syntax */
import { features } from "@/registry/features";

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
    href: dailyLucky?.path || "/daily",
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
