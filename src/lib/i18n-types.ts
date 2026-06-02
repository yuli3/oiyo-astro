import { getRequestConfig } from "next-intl/server";

import { i18nRegistry } from "./lib/i18n/registry";

export const locales = ["en", "ko", "ja", "cn", "fr", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale = "en";

function deepMerge(target: any, source: any) {
  if (!source) return target;
  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

/**
 * Loads messages for a given locale using the pre-generated registry.
 * This approach is compatible with Next.js Edge Runtime.
 */
async function loadLocaleMessages(
  locale: string,
  registry: any,
  container: any = {},
) {
  for (const [key, value] of Object.entries(registry)) {
    if (typeof value === "function") {
      try {
        const nsModule = await value(locale);
        const content = nsModule.default;

        if (key === "_root") {
          deepMerge(container, content);
          continue;
        }

        // Special handling for dot-notation namespaces like "ontology.catalog"
        if (key.includes(".")) {
          const parts = key.split(".");
          let current = container;
          for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) current[parts[i]] = {};
            current = current[parts[i]];
          }
          current[parts[parts.length - 1]] = content;
          continue;
        }

        if (key === "core") {
          deepMerge(container, content);
        } else {
          if (!container[key]) container[key] = {};
          deepMerge(container[key], content);
        }
      } catch (e) {
        // Namespace might not exist for this locale, skip
      }
    } else if (typeof value === "object") {
      if (!container[key]) container[key] = {};
      await loadLocaleMessages(locale, value, container[key]);
    }
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) || "en";
  const messages: Record<string, any> = {};

  // Load English as base
  await loadLocaleMessages("en", i18nRegistry, messages);

  // Load target locale to override English
  if (locale !== "en") {
    await loadLocaleMessages(locale, i18nRegistry, messages);
  }

  return {
    getMessageFallback({ key, namespace }) {
      return "";
    },
    locale,
    messages,
    onError(error) {
      if (
        error.code === "MISSING_MESSAGE" &&
        process.env.NODE_ENV === "production"
      ) {
        return;
      }
      console.error(error);
    },
    timeZone: "UTC",
  };
});
