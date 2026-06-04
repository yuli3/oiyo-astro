/**
 * Shim for next-intl in Astro/non-Next.js environments.
 * Messages structure: { namespaceName: { key: value, ... }, ... }
 */
import React, { createContext, useContext, type ReactNode } from 'react';

type Messages = Record<string, unknown>;
type TranslationValues = Record<string, unknown>;

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
  const ctx = useContext(IntlContext);
  if (ctx.locale) return ctx.locale;
  if (typeof document !== 'undefined') {
    const lang = document.documentElement.lang;
    if (lang) return lang;
  }
  if (typeof window !== 'undefined') {
    const [, maybeLocale] = window.location.pathname.split('/');
    if (['en', 'ko', 'ja', 'zh', 'fr', 'es'].includes(maybeLocale)) {
      return maybeLocale;
    }
  }
  return 'ko';
}

/** Navigate a dotted path into an object, returning the value or undefined */
function resolvePath(obj: unknown, path: string): unknown {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

/** Resolve a dotted namespace like "ontology.dashboard" into the messages subtree */
function resolveNamespace(messages: Messages, namespace: string): unknown {
  // Direct lookup first: messages["dashboard"]
  if (messages[namespace] !== undefined) return messages[namespace];
  // Dotted path: "ontology.dashboard" → messages["ontology"]["dashboard"]
  return resolvePath(messages, namespace);
}

function getStringValue(obj: unknown, key: string): string | undefined {
  const val = resolvePath(obj, key);
  if (typeof val === 'string') return val;
  return undefined;
}

function applyParams(str: string, params?: TranslationValues): string {
  if (!params) return str;
  return Object.entries(params).reduce(
    (s, [k, v]) => s.replaceAll(`{${k}}`, String(v)),
    str,
  );
}

export function useTranslations(namespace?: string) {
  const { messages } = useContext(IntlContext);
  const nsObj = namespace ? resolveNamespace(messages, namespace) : messages;

  function t(key: string, params?: TranslationValues): string {
    // 1. Look up key in resolved namespace
    const inNs = getStringValue(nsObj, key);
    if (inNs !== undefined) return applyParams(inNs, params);

    // 2. Try flat path from root: "namespace.key"
    if (namespace) {
      const flat = getStringValue(messages, `${namespace}.${key}`);
      if (flat !== undefined) return applyParams(flat, params);
    }

    // 3. Return key as fallback (empty string avoids showing raw keys in UI)
    return '';
  }

  t.has = (key: string): boolean => {
    const inNs = getStringValue(nsObj, key);
    if (inNs !== undefined) return true;
    if (namespace) {
      const flat = getStringValue(messages, `${namespace}.${key}`);
      return flat !== undefined;
    }
    return false;
  };

  t.raw = (key: string): unknown => {
    const val = resolvePath(nsObj, key);
    if (val !== undefined) return val;
    if (namespace) return resolvePath(messages, `${namespace}.${key}`);
    return undefined;
  };

  return t;
}

export function useMessages(): Messages {
  return useContext(IntlContext).messages;
}

export const getTranslator = useTranslations;
