import { LocalizedContent } from "@/types/manifest";

import { SixLangString } from "./../interpretation/engine.contract";

export type ConnectorKey =
  | "and"
  | "consequently"
  | "however"
  | "simultaneously"
  | "therefore";

export const CONNECTORS: Record<string, Record<ConnectorKey, string>> = {
  zh: {
    and: "而且",
    consequently: "因此，",
    however: "然而，",
    simultaneously: "同时，",
    therefore: "所以，",
  },
  en: {
    and: "And",
    consequently: "Consequently,",
    however: "However,",
    simultaneously: "Simultaneously,",
    therefore: "Therefore,",
  },
  es: {
    and: "Y",
    consequently: "Por lo tanto,",
    however: "Sin embargo,",
    simultaneously: "Simultáneamente,",
    therefore: "Así que,",
  },
  fr: {
    and: "Et",
    consequently: "Par conséquent,",
    however: "Cependant,",
    simultaneously: "Simultanément,",
    therefore: "Donc,",
  },
  ja: {
    and: "そして",
    consequently: "その結果、",
    however: "しかし、",
    simultaneously: "同時に、",
    therefore: "したがって、",
  },
  ko: {
    and: "그리고",
    consequently: "그 결과,",
    however: "하지만,",
    simultaneously: "동시에,",
    therefore: "그러므로,",
  },
};

/**
 * Retrieves the localized string for a given locale.
 * Falls back to English if the requested locale is not available.
 */
export function getLang(str: SixLangString, locale: string): string {
  const lang = locale.substring(0, 2) as keyof SixLangString;
  return str[lang] || str.en || Object.values(str)[0] || "";
}

export function weave(locale: string, ...parts: string[]): string {
  // Simple weaver for now, can be expanded with more complex logic
  return parts.filter(Boolean).join(" ");
}
