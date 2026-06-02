"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

interface FallbackTranslator {
  (key: string, values?: TranslationValues): string;
  has: (key: string) => boolean;
  raw: (key: string) => unknown;
}

type TranslationValues = Record<string, unknown>;

export function useNamespacedFallback(
  primaryNamespace: string,
  fallbackNamespace: string,
): FallbackTranslator {
  const primary = useTranslations(primaryNamespace as never) as any;
  const fallback = useTranslations(fallbackNamespace as never) as any;

  return useMemo(() => {
    return Object.assign(
      (key: string, values?: TranslationValues) => {
        if (primary.has?.(key)) {
          return primary(key, values);
        }

        if (fallback.has?.(key)) {
          return fallback(key, values);
        }

        return primary(key, values);
      },
      {
        has: (key: string) =>
          Boolean(primary.has?.(key) || fallback.has?.(key)),
        raw: (key: string) => {
          if (primary.has?.(key)) {
            return primary.raw(key);
          }

          return fallback.raw(key);
        },
      },
    ) as FallbackTranslator;
  }, [fallback, primary]);
}
