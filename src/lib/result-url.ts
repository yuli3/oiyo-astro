// Permanent, shareable result URLs for static (Astro) test/tool pages.
// A test result is encoded as a short code in a URL query param (e.g. ?type=INTJ).
// On mount a component reads the code and restores the result view directly,
// so results can be linked, revisited, and shared without any server state.

/** Read a result code from the current URL query string. Returns null on server/SSR. */
export function readResultCode(key: string): string | null {
  if (typeof window === 'undefined') return null;
  const v = new URLSearchParams(window.location.search).get(key);
  return v ? v.trim() : null;
}

/** Write a result code into the URL without reloading or adding a history entry. */
export function writeResultCode(key: string, code: string): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.set(key, code);
  window.history.replaceState(null, '', url.toString());
}

/** Remove a result code from the URL (e.g. when retaking a test). */
export function clearResultCode(key: string): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.delete(key);
  window.history.replaceState(null, '', url.toString());
}

/** The full current URL, used as the shareable link. */
export function currentShareUrl(): string {
  if (typeof window === 'undefined') return 'https://oiyo.net';
  return window.location.href;
}
