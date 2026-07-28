import type { LocalizedContent } from "@/lib/system/i18n/locale-helper";

import { APP_ROUTES } from "./routes";

export interface RouteMetadata {
  description: LocalizedContent<string>;
  ogImage?: string;
  priority?: number;
  title: LocalizedContent<string>;
}

/**
 * Centralized SEO Configuration (One Source of Truth)
 *
 * Defines metadata for every route in the application.
 * Keys MUST match APP_ROUTES structure.
 */

export const SITE_CONFIG = {
  keywords: ["personality test", "saju", "fortune", "mbti", "ai"],
  name: "Oiyo",
  ogImage: "https://oiyo.net/og.png",
  url: "https://oiyo.net",
};
