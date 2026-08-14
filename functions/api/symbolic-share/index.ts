import {
  isSameOrigin,
  jsonResponse,
  randomBase64Url,
  validateWriteRequest,
} from "../../_shared/symbolic-share";

interface ShareKv {
  put(key: string, value: string, options: { expirationTtl: number; metadata: Record<string, string> }): Promise<void>;
}

interface Context {
  env: { SYMBOLIC_SHARE_KV?: ShareKv };
  request: Request;
}

export async function onRequestPost({ env, request }: Context): Promise<Response> {
  if (!isSameOrigin(request)) return jsonResponse({ error: "origin-not-allowed" }, 403);
  if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
    return jsonResponse({ error: "content-type-required" }, 415);
  }
  if (!env.SYMBOLIC_SHARE_KV) return jsonResponse({ error: "storage-unavailable" }, 503);

  const declaredLength = Number(request.headers.get("Content-Length") ?? 0);
  if (declaredLength > 6_000) return jsonResponse({ error: "payload-too-large" }, 413);

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (rawBody.length > 6_000) return jsonResponse({ error: "payload-too-large" }, 413);
    body = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: "invalid-json" }, 400);
  }
  const validated = validateWriteRequest(body);
  if (!validated.ok) return jsonResponse({ error: "invalid-payload" }, 400);

  const id = randomBase64Url(16);
  const deleteToken = randomBase64Url(32);
  const deleteVerifier = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(deleteToken));
  const verifierBytes = new Uint8Array(deleteVerifier);
  let verifierBinary = "";
  for (const byte of verifierBytes) verifierBinary += String.fromCharCode(byte);
  const serverDeleteVerifier = btoa(verifierBinary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

  await env.SYMBOLIC_SHARE_KV.put(id, JSON.stringify(validated.envelope), {
    expirationTtl: validated.ttlSeconds,
    metadata: {
      createdAt: new Date().toISOString(),
      deleteVerifier: serverDeleteVerifier,
    },
  });
  return jsonResponse({ deleteToken, id, ttlSeconds: validated.ttlSeconds }, 201);
}

export function onRequest(): Response {
  return jsonResponse({ error: "method-not-allowed" }, 405);
}
