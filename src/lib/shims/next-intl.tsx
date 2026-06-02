/**
 * Shim for next-intl in Astro/non-Next.js environments.
 * Reads locale from <html lang> attribute or URL pathname at runtime.
 */
import React, { createContext, useContext, type ReactNode } from 'react';

type Messages = Record<string, unknown>;

interface IntlContextValue {
  locale: string;
  messages: Messages;
}

const IntlContext = createContext<IntlContextValue>({
  locale: 'ko',
  messages: {},
});

export function IntlProvider({
  locale,
  messages,
  children,
}: {
  locale: string;
  messages: Messages;
  children: ReactNode;
}) {
  return (
    <IntlContext.Provider value={{ locale, messages }}>
      {children}
    </IntlContext.Provider>
  );
}

export function useLocale(): string {
  // First try context, then fall back to DOM/URL
  const ctx = useContext(IntlContext);
  if (ctx.locale) return ctx.locale;
  if (typeof document !== 'undefined') {
    const lang = document.documentElement.lang;
    if (lang) return lang;
  }
  if (typeof window !== 'undefined') {
    const parts = window.location.pathname.split('/');
    if (parts[1] && ['en', 'ko', 'ja', 'cn', 'fr', 'es'].includes(parts[1])) {
      return parts[1];
    }
  }
  return 'ko';
}

function getNestedValue(obj: unknown, path: string): string {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return path;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === 'string' ? cur : path;
}

export function useTranslations(namespace?: string) {
  const { messages } = useContext(IntlContext);

  return function t(key: string, params?: Record<string, string | number>): string {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    // Try namespace-scoped lookup first
    let value: string;
    if (namespace && messages[namespace]) {
      value = getNestedValue(messages[namespace], key);
      if (value !== key) {
        return applyParams(value, params);
      }
    }
    // Fall back to flat lookup
    value = getNestedValue(messages, fullKey);
    return applyParams(value, params);
  };
}

function applyParams(str: string, params?: Record<string, string | number>): string {
  if (!params) return str;
  return Object.entries(params).reduce(
    (s, [k, v]) => s.replaceAll(`{${k}}`, String(v)),
    str,
  );
}

// Named re-export for compatibility
export const getTranslator = useTranslations;

export function useMessages(): Messages {
  const { messages } = useContext(IntlContext);
  return messages;
}

