/**
 * Shim for next/navigation in non-Next.js environments.
 */

export function useRouter() {
  return {
    push: (href: string) => {
      if (typeof window !== 'undefined') window.location.href = href;
    },
    replace: (href: string) => {
      if (typeof window !== 'undefined') window.location.replace(href);
    },
    back: () => {
      if (typeof window !== 'undefined') window.history.back();
    },
    forward: () => {
      if (typeof window !== 'undefined') window.history.forward();
    },
    refresh: () => {
      if (typeof window !== 'undefined') window.location.reload();
    },
    prefetch: () => {},
  };
}

export function usePathname(): string {
  if (typeof window !== 'undefined') return window.location.pathname;
  return '/';
}

export function useSearchParams() {
  const params =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();

  return {
    get: (key: string) => params.get(key),
    getAll: (key: string) => params.getAll(key),
    has: (key: string) => params.has(key),
    entries: () => params.entries(),
    keys: () => params.keys(),
    values: () => params.values(),
    toString: () => params.toString(),
    forEach: params.forEach.bind(params),
  };
}

export function useParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const parts = window.location.pathname.split('/').filter(Boolean);
  return { locale: parts[0] ?? 'ko' };
}

export function redirect(url: string): never {
  if (typeof window !== 'undefined') window.location.href = url;
  throw new Error('redirect');
}

export function notFound(): never {
  throw new Error('not-found');
}
