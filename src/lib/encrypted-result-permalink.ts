import { decodeResult, encodeResult, type DecodedResult } from "./result-permalink";

const AAD = new TextEncoder().encode("oiyo.encrypted-result:v1");
const ID_PATTERN = /^[A-Za-z0-9_-]{22}$/;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const DEFAULT_TTL_DAYS = 7;

interface CiphertextEnvelope {
  ciphertext: string;
  iv: string;
  schema: "oiyo.symbolic-share-ciphertext";
  schemaVersion: 1;
}

interface EncryptedResultPayload {
  encoded: string;
  expiresAt: string;
  schema: "oiyo.encrypted-result";
  schemaVersion: 1;
}

export interface EncryptedResultPermalink {
  deleteToken: string;
  expiresAt: string;
  id: string;
  url: string;
}

export type ReadEncryptedResultPermalink =
  | { ok: true; result: DecodedResult }
  | { ok: false; reason: "damaged" | "expired" | "network" | "not-found" | "unsupported" };

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function importAesKey(raw: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", raw as BufferSource, "AES-GCM", false, ["decrypt", "encrypt"]);
}

export async function createEncryptedResultPermalink<T>(
  toolId: string,
  state: T,
  options: { fetcher?: typeof fetch; now?: Date; pageUrl: string; ttlDays?: number },
): Promise<EncryptedResultPermalink> {
  const encoded = encodeResult(toolId, state);
  if (!encoded) throw new TypeError("Result is too large to share");
  const ttlDays = options.ttlDays ?? DEFAULT_TTL_DAYS;
  if (!Number.isInteger(ttlDays) || ttlDays < 1 || ttlDays > 30) throw new TypeError("Invalid share lifetime");
  const now = options.now ?? new Date();
  const expiresAt = new Date(now.getTime() + ttlDays * 86_400_000).toISOString();
  const payload: EncryptedResultPayload = {
    encoded,
    expiresAt,
    schema: "oiyo.encrypted-result",
    schemaVersion: 1,
  };
  const keyBytes = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await importAesKey(keyBytes);
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ additionalData: AAD, iv, name: "AES-GCM" }, key, plaintext));
  const response = await (options.fetcher ?? fetch)("/api/symbolic-share", {
    body: JSON.stringify({ ciphertext: bytesToBase64Url(ciphertext), iv: bytesToBase64Url(iv), ttlSeconds: ttlDays * 86_400 }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  if (!response.ok) throw new Error("Encrypted result storage failed");
  const stored = await response.json() as { deleteToken?: string; id?: string };
  if (!stored.id || !ID_PATTERN.test(stored.id) || !stored.deleteToken || !TOKEN_PATTERN.test(stored.deleteToken)) {
    throw new Error("Encrypted result storage returned an invalid receipt");
  }
  const url = new URL(options.pageUrl);
  url.searchParams.set("result", stored.id);
  url.hash = `k=${bytesToBase64Url(keyBytes)}`;
  return { deleteToken: stored.deleteToken, expiresAt, id: stored.id, url: url.toString() };
}

export async function readEncryptedResultPermalink(
  id: string,
  fragment: string,
  options: { fetcher?: typeof fetch; now?: Date } = {},
): Promise<ReadEncryptedResultPermalink> {
  if (!ID_PATTERN.test(id)) return { ok: false, reason: "damaged" };
  const keyText = new URLSearchParams(fragment.replace(/^#/, "")).get("k");
  if (!keyText || !TOKEN_PATTERN.test(keyText)) return { ok: false, reason: "damaged" };
  let response: Response;
  try {
    response = await (options.fetcher ?? fetch)(`/api/symbolic-share/${id}`, { headers: { Accept: "application/json" } });
  } catch {
    return { ok: false, reason: "network" };
  }
  if (response.status === 404) return { ok: false, reason: "not-found" };
  if (!response.ok) return { ok: false, reason: "network" };
  try {
    const envelope = await response.json() as CiphertextEnvelope;
    if (envelope.schema !== "oiyo.symbolic-share-ciphertext" || envelope.schemaVersion !== 1) return { ok: false, reason: "unsupported" };
    const key = await importAesKey(base64UrlToBytes(keyText));
    const decrypted = await crypto.subtle.decrypt(
      { additionalData: AAD, iv: base64UrlToBytes(envelope.iv) as BufferSource, name: "AES-GCM" },
      key,
      base64UrlToBytes(envelope.ciphertext) as BufferSource,
    );
    const payload = JSON.parse(new TextDecoder().decode(decrypted)) as Partial<EncryptedResultPayload>;
    if (payload.schema !== "oiyo.encrypted-result" || payload.schemaVersion !== 1 || typeof payload.encoded !== "string" || typeof payload.expiresAt !== "string") {
      return { ok: false, reason: "unsupported" };
    }
    const expiry = Date.parse(payload.expiresAt);
    if (!Number.isFinite(expiry)) return { ok: false, reason: "damaged" };
    if (expiry <= (options.now ?? new Date()).getTime()) return { ok: false, reason: "expired" };
    const result = decodeResult(payload.encoded);
    return result ? { ok: true, result } : { ok: false, reason: "damaged" };
  } catch {
    return { ok: false, reason: "damaged" };
  }
}
