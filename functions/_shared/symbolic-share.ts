export const SHARE_KV_BINDING = "SYMBOLIC_SHARE_KV" as const;
export const SHARE_SCHEMA = "oiyo.symbolic-share-ciphertext" as const;
export const SHARE_SCHEMA_VERSION = 1 as const;
export const SHARE_DEFAULT_TTL_SECONDS = 7 * 86_400;
export const SHARE_MAX_TTL_SECONDS = 30 * 86_400;
export const SHARE_MAX_CIPHERTEXT_CHARS = 4_096;

export interface CiphertextEnvelope {
  ciphertext: string;
  iv: string;
  schema: typeof SHARE_SCHEMA;
  schemaVersion: typeof SHARE_SCHEMA_VERSION;
}

export interface ShareWriteRequest {
  ciphertext: string;
  iv: string;
  ttlSeconds?: number;
}

const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;

export function validateWriteRequest(value: unknown): { ok: false } | { ok: true; envelope: CiphertextEnvelope; ttlSeconds: number } {
  if (!value || typeof value !== "object") return { ok: false };
  const body = value as Partial<ShareWriteRequest>;
  if (Object.keys(body).some((key) => !["ciphertext", "iv", "ttlSeconds"].includes(key))) return { ok: false };
  const ttlSeconds = body.ttlSeconds ?? SHARE_DEFAULT_TTL_SECONDS;
  if (
    typeof body.ciphertext !== "string"
    || body.ciphertext.length < 24
    || body.ciphertext.length > SHARE_MAX_CIPHERTEXT_CHARS
    || !BASE64URL_PATTERN.test(body.ciphertext)
    || typeof body.iv !== "string"
    || body.iv.length !== 16
    || !BASE64URL_PATTERN.test(body.iv)
    || !Number.isInteger(ttlSeconds)
    || ttlSeconds < 60
    || ttlSeconds > SHARE_MAX_TTL_SECONDS
  ) return { ok: false };
  return {
    ok: true,
    envelope: {
      ciphertext: body.ciphertext,
      iv: body.iv,
      schema: SHARE_SCHEMA,
      schemaVersion: SHARE_SCHEMA_VERSION,
    },
    ttlSeconds,
  };
}

export function randomBase64Url(byteLength: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function sha256Base64Url(value: string): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
  let binary = "";
  for (const byte of digest) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function jsonResponse(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export function isSameOrigin(request: Request): boolean {
  return request.headers.get("Origin") === new URL(request.url).origin;
}
