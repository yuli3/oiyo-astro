import type { SymbolicProfile } from "./types";
import {
  createSymbolicShareArtifact,
  decodeSymbolicShareArtifact,
  encodeSymbolicShareArtifact,
  SYMBOLIC_SHARE_DEFAULT_TTL_DAYS,
} from "./share-artifact";

const AAD = new TextEncoder().encode("oiyo.symbolic-share:v1");
const ID_PATTERN = /^[A-Za-z0-9_-]{22}$/;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

interface CiphertextEnvelope {
  ciphertext: string;
  iv: string;
  schema: "oiyo.symbolic-share-ciphertext";
  schemaVersion: 1;
}

export interface EncryptedShortShare {
  deleteToken: string;
  expiresAt: string;
  id: string;
  url: string;
}

export type ReadEncryptedShortShareResult =
  | { artifact: ReturnType<typeof createSymbolicShareArtifact>; ok: true }
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

export async function createEncryptedShortShare(
  profile: SymbolicProfile,
  options: {
    fetcher?: typeof fetch;
    locale: string;
    now?: Date;
    origin: string;
    ttlDays?: number;
  },
): Promise<EncryptedShortShare> {
  const fetcher = options.fetcher ?? fetch;
  const ttlDays = options.ttlDays ?? SYMBOLIC_SHARE_DEFAULT_TTL_DAYS;
  const artifact = createSymbolicShareArtifact(profile, { now: options.now, ttlDays });
  const keyBytes = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await importAesKey(keyBytes);
  const plaintext = new TextEncoder().encode(JSON.stringify(artifact));
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ additionalData: AAD, iv, name: "AES-GCM" }, key, plaintext));
  const response = await fetcher("/api/symbolic-share", {
    body: JSON.stringify({
      ciphertext: bytesToBase64Url(encrypted),
      iv: bytesToBase64Url(iv),
      ttlSeconds: ttlDays * 86_400,
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  if (!response.ok) throw new Error("Short share storage failed");
  const stored = await response.json() as { deleteToken?: string; id?: string };
  if (!stored.id || !ID_PATTERN.test(stored.id) || !stored.deleteToken || !TOKEN_PATTERN.test(stored.deleteToken)) {
    throw new Error("Short share storage returned an invalid receipt");
  }
  const locale = ["en", "es", "fr", "ja", "ko", "zh"].includes(options.locale) ? options.locale : "ko";
  return {
    deleteToken: stored.deleteToken,
    expiresAt: artifact.expiresAt,
    id: stored.id,
    url: `${options.origin}/c/${stored.id}?l=${locale}#k=${bytesToBase64Url(keyBytes)}`,
  };
}

export async function readEncryptedShortShare(
  id: string,
  fragment: string,
  options: { fetcher?: typeof fetch; now?: Date } = {},
): Promise<ReadEncryptedShortShareResult> {
  if (!ID_PATTERN.test(id)) return { ok: false, reason: "damaged" };
  const keyText = new URLSearchParams(fragment.replace(/^#/, "")).get("k");
  if (!keyText || !TOKEN_PATTERN.test(keyText)) return { ok: false, reason: "damaged" };
  const fetcher = options.fetcher ?? fetch;
  let response: Response;
  try {
    response = await fetcher(`/api/symbolic-share/${id}`, { headers: { Accept: "application/json" } });
  } catch {
    return { ok: false, reason: "network" };
  }
  if (response.status === 404) return { ok: false, reason: "not-found" };
  if (!response.ok) return { ok: false, reason: "network" };
  try {
    const envelope = await response.json() as CiphertextEnvelope;
    if (envelope.schema !== "oiyo.symbolic-share-ciphertext" || envelope.schemaVersion !== 1) {
      return { ok: false, reason: "unsupported" };
    }
    const key = await importAesKey(base64UrlToBytes(keyText));
    const decrypted = await crypto.subtle.decrypt(
      { additionalData: AAD, iv: base64UrlToBytes(envelope.iv) as BufferSource, name: "AES-GCM" },
      key,
      base64UrlToBytes(envelope.ciphertext) as BufferSource,
    );
    const artifact = JSON.parse(new TextDecoder().decode(decrypted));
    const validated = decodeSymbolicShareArtifact(encodeSymbolicShareArtifact(artifact), { now: options.now });
    return validated.ok ? validated : { ok: false, reason: validated.reason };
  } catch {
    return { ok: false, reason: "damaged" };
  }
}

export async function deleteEncryptedShortShare(
  id: string,
  deleteToken: string,
  fetcher: typeof fetch = fetch,
): Promise<boolean> {
  if (!ID_PATTERN.test(id) || !TOKEN_PATTERN.test(deleteToken)) return false;
  const response = await fetcher(`/api/symbolic-share/${id}`, {
    headers: { Authorization: `Bearer ${deleteToken}` },
    method: "DELETE",
  });
  return response.status === 204;
}
