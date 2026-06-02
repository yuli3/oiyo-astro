"use client";

import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

export interface DaySymbols {
  flower: { meaning: string; name: string };
  star: { meaning: string; name: string };
  stone: { meaning: string; name: string };
}

export type MonthlyAlmanac = Record<string, DaySymbols>;

const MONTH_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

// Static import map — dynamic template literals with aliases don't resolve at runtime.
// Webpack/bundler requires statically analyzable import paths.
type AlmanacImporter = () => Promise<{ default: MonthlyAlmanac }>;
const ALMANAC_IMPORTS: Record<string, AlmanacImporter> = {
  "cn/april": () => import("../messages/cn/april.json"),
  "cn/august": () => import("../messages/cn/august.json"),
  "cn/december": () => import("../messages/cn/december.json"),
  "cn/february": () => import("../messages/cn/february.json"),
  "cn/january": () => import("../messages/cn/january.json"),
  "cn/july": () => import("../messages/cn/july.json"),
  "cn/june": () => import("../messages/cn/june.json"),
  "cn/march": () => import("../messages/cn/march.json"),
  "cn/may": () => import("../messages/cn/may.json"),
  "cn/november": () => import("../messages/cn/november.json"),
  "cn/october": () => import("../messages/cn/october.json"),
  "cn/september": () => import("../messages/cn/september.json"),
  "en/april": () => import("../messages/en/april.json"),
  "en/august": () => import("../messages/en/august.json"),
  "en/december": () => import("../messages/en/december.json"),
  "en/february": () => import("../messages/en/february.json"),
  "en/january": () => import("../messages/en/january.json"),
  "en/july": () => import("../messages/en/july.json"),
  "en/june": () => import("../messages/en/june.json"),
  "en/march": () => import("../messages/en/march.json"),
  "en/may": () => import("../messages/en/may.json"),
  "en/november": () => import("../messages/en/november.json"),
  "en/october": () => import("../messages/en/october.json"),
  "en/september": () => import("../messages/en/september.json"),
  "es/april": () => import("../messages/es/april.json"),
  "es/august": () => import("../messages/es/august.json"),
  "es/december": () => import("../messages/es/december.json"),
  "es/february": () => import("../messages/es/february.json"),
  "es/january": () => import("../messages/es/january.json"),
  "es/july": () => import("../messages/es/july.json"),
  "es/june": () => import("../messages/es/june.json"),
  "es/march": () => import("../messages/es/march.json"),
  "es/may": () => import("../messages/es/may.json"),
  "es/november": () => import("../messages/es/november.json"),
  "es/october": () => import("../messages/es/october.json"),
  "es/september": () => import("../messages/es/september.json"),
  "fr/april": () => import("../messages/fr/april.json"),
  "fr/august": () => import("../messages/fr/august.json"),
  "fr/december": () => import("../messages/fr/december.json"),
  "fr/february": () => import("../messages/fr/february.json"),
  "fr/january": () => import("../messages/fr/january.json"),
  "fr/july": () => import("../messages/fr/july.json"),
  "fr/june": () => import("../messages/fr/june.json"),
  "fr/march": () => import("../messages/fr/march.json"),
  "fr/may": () => import("../messages/fr/may.json"),
  "fr/november": () => import("../messages/fr/november.json"),
  "fr/october": () => import("../messages/fr/october.json"),
  "fr/september": () => import("../messages/fr/september.json"),
  "ja/april": () => import("../messages/ja/april.json"),
  "ja/august": () => import("../messages/ja/august.json"),
  "ja/december": () => import("../messages/ja/december.json"),
  "ja/february": () => import("../messages/ja/february.json"),
  "ja/january": () => import("../messages/ja/january.json"),
  "ja/july": () => import("../messages/ja/july.json"),
  "ja/june": () => import("../messages/ja/june.json"),
  "ja/march": () => import("../messages/ja/march.json"),
  "ja/may": () => import("../messages/ja/may.json"),
  "ja/november": () => import("../messages/ja/november.json"),
  "ja/october": () => import("../messages/ja/october.json"),
  "ja/september": () => import("../messages/ja/september.json"),
  "ko/april": () => import("../messages/ko/april.json"),
  "ko/august": () => import("../messages/ko/august.json"),
  "ko/december": () => import("../messages/ko/december.json"),
  "ko/february": () => import("../messages/ko/february.json"),
  "ko/january": () => import("../messages/ko/january.json"),
  "ko/july": () => import("../messages/ko/july.json"),
  "ko/june": () => import("../messages/ko/june.json"),
  "ko/march": () => import("../messages/ko/march.json"),
  "ko/may": () => import("../messages/ko/may.json"),
  "ko/november": () => import("../messages/ko/november.json"),
  "ko/october": () => import("../messages/ko/october.json"),
  "ko/september": () => import("../messages/ko/september.json"),
};

/**
 * useAlmanac hook
 * Dynamically loads monthly almanac data based on the provided date.
 * Implements Temporal Sharding to maintain performance.
 */
export function useAlmanac(date: Date) {
  const locale = useLocale();
  const [data, setData] = useState<MonthlyAlmanac | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const monthIndex = date.getMonth();
  const monthName = MONTH_NAMES[monthIndex];
  const dayKey = `day_${date.getDate().toString().padStart(2, "0")}`;

  useEffect(() => {
    let isMounted = true;

    async function loadAlmanac() {
      if (isMounted) setIsLoading(true);
      try {
        const key = `${locale}/${monthName}`;
        const importer =
          ALMANAC_IMPORTS[key] ?? ALMANAC_IMPORTS[`en/${monthName}`];
        const almanacModule = await importer();

        if (isMounted) {
          setData(almanacModule.default);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err : new Error("Failed to load almanac"),
          );
          setIsLoading(false);
          console.error(
            `[useAlmanac] Error loading ${monthName} for ${locale}:`,
            err,
          );
        }
      }
    }

    loadAlmanac();

    return () => {
      isMounted = false;
    };
  }, [locale, monthName]);

  const dayData = data ? data[dayKey] : null;

  return {
    dayData,
    error,
    isLoading,
    monthData: data,
  };
}
