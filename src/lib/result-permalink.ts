// Stateless, shareable permalinks for oiyo tool results (T6 / #32).
//
// Encodes {toolId, state} into a URL hash fragment (`#r=<version>.<compressed>`)
// so a result view can be reconstructed purely on the client — no DB, no SSR,
// no server-side transmission of the (sometimes sensitive) state. See the
// design decision: company-brain/AI-Sessions/wiki/decisions/oiyo-result-permalink-hash.md
//
// Compression: lz-string (sync API, ~4KB, zero deps) — chosen over
// CompressionStream/DecompressionStream because those are async (stream-based),
// which does not fit the synchronous encodeResult/decodeResult contract below.

// lz-string ships a UMD build (`module.exports = LZString`), which Node's
// ESM/CJS interop cannot statically resolve into named exports during
// Astro's static-route prerendering — default-import and destructure instead.
import LZString from "lz-string";
const { compressToEncodedURIComponent, decompressFromEncodedURIComponent } =
  LZString;

const VERSION = "1";

/** Hard cap on the encoded payload length. Past this, callers should fall
 *  back to the existing hub-URL + text share instead of a permalink. */
const MAX_ENCODED_LENGTH = 1500;

export interface DecodedResult<T = unknown> {
  version: string;
  toolId: string;
  state: T;
}

/**
 * Encode a tool result into a compact, URL-safe permalink payload
 * (without the leading `#r=`). Returns null if serialization fails or the
 * encoded payload exceeds MAX_ENCODED_LENGTH — callers must fall back to the
 * tool's existing (non-permalink) share behavior in that case.
 */
export function encodeResult<T>(toolId: string, state: T): string | null {
  try {
    const json = JSON.stringify({ toolId, state });
    const compressed = compressToEncodedURIComponent(json);
    if (!compressed) return null;
    const encoded = `${VERSION}.${compressed}`;
    if (encoded.length > MAX_ENCODED_LENGTH) return null;
    return encoded;
  } catch {
    return null;
  }
}

/**
 * Decode a permalink payload back into {version, toolId, state}. Accepts the
 * raw encoded value or one still prefixed with `#r=` / `r=`. Returns null on
 * any version mismatch, malformed, or corrupted input — callers must treat
 * that as a safe, silent fallback (render the empty tool, never crash).
 */
export function decodeResult<T = unknown>(
  hash: string | null | undefined,
): DecodedResult<T> | null {
  if (!hash) return null;
  try {
    const value = hash.replace(/^#?r=/, "");
    const dotIndex = value.indexOf(".");
    if (dotIndex === -1) return null;
    const version = value.slice(0, dotIndex);
    if (version !== VERSION) return null;
    const payload = value.slice(dotIndex + 1);
    if (!payload) return null;
    const json = decompressFromEncodedURIComponent(payload);
    if (!json) return null;
    const parsed = JSON.parse(json);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.toolId !== "string"
    ) {
      return null;
    }
    return { version, toolId: parsed.toolId, state: parsed.state as T };
  } catch {
    return null;
  }
}

/**
 * Read the current window.location.hash and decode it if it is a result
 * permalink. Returns null on the server, when there is no hash, or when
 * decoding fails.
 */
export function readResultHash<T = unknown>(): DecodedResult<T> | null {
  if (typeof window === "undefined") return null;
  return decodeResult<T>(window.location.hash);
}

/**
 * Encode a result and write it into the current URL's hash via
 * history.replaceState (no reload, no new history entry), returning the
 * full shareable URL. Returns null if encoding failed (size guard or
 * serialization error) or when called on the server — callers must fall
 * back to their existing share() behavior in that case.
 */
export function writeResultHash<T>(toolId: string, state: T): string | null {
  if (typeof window === "undefined") return null;
  const encoded = encodeResult(toolId, state);
  if (!encoded) return null;
  const url = new URL(window.location.href);
  url.hash = `r=${encoded}`;
  window.history.replaceState(null, "", url.toString());
  return url.toString();
}
