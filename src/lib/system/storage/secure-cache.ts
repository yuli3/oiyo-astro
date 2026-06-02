"use client";

import {
  clearSecureItemsByPrefix,
  getSecureItem,
  removeSecureItem,
  setSecureItem,
} from "@/lib/system/secure-storage";

/**
 * Shared cache wrapper around secure storage that keeps legacy keys intact
 * while ensuring all cached data is encrypted at rest.
 */
export const secureCache = {
  clearByPrefix(prefix: string): void {
    clearSecureItemsByPrefix(prefix);
  },
  get<T>(key: string, fallback: T): T {
    return getSecureItem<T>(key, fallback);
  },
  getOrNull<T>(key: string): null | T {
    return getSecureItem<null | T>(key, null);
  },
  remove(key: string): void {
    removeSecureItem(key);
  },
  set<T>(key: string, value: null | T | undefined): void {
    setSecureItem(key, value);
  },
};

export function updateSecureCache<T>(
  key: string,
  fallback: T,
  updater: (current: T) => T,
): T {
  const current = secureCache.get(key, fallback);
  const next = updater(current);
  secureCache.set(key, next);
  return next;
}
