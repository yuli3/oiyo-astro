import { jsonResponse, sha256Base64Url } from "../../_shared/symbolic-share";

interface ShareKv {
  delete(key: string): Promise<void>;
  getWithMetadata<T>(key: string): Promise<{ metadata: T | null; value: string | null }>;
}

interface Context {
  env: { SYMBOLIC_SHARE_KV?: ShareKv };
  params: { id?: string };
  request: Request;
}

const ID_PATTERN = /^[A-Za-z0-9_-]{22}$/;

function idOf(context: Context): string | null {
  const id = context.params.id;
  return typeof id === "string" && ID_PATTERN.test(id) ? id : null;
}

export async function onRequestGet(context: Context): Promise<Response> {
  const id = idOf(context);
  if (!id) return jsonResponse({ error: "invalid-id" }, 400);
  if (!context.env.SYMBOLIC_SHARE_KV) return jsonResponse({ error: "storage-unavailable" }, 503);
  const stored = await context.env.SYMBOLIC_SHARE_KV.getWithMetadata<{ deleteVerifier: string }>(id);
  if (!stored.value) return jsonResponse({ error: "not-found" }, 404);
  return new Response(stored.value, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
      "Content-Type": "application/json; charset=utf-8",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function onRequestDelete(context: Context): Promise<Response> {
  const id = idOf(context);
  if (!id) return jsonResponse({ error: "invalid-id" }, 400);
  if (!context.env.SYMBOLIC_SHARE_KV) return jsonResponse({ error: "storage-unavailable" }, 503);
  const token = context.request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token || token.length !== 43) return jsonResponse({ error: "delete-forbidden" }, 403);
  const stored = await context.env.SYMBOLIC_SHARE_KV.getWithMetadata<{ deleteVerifier: string }>(id);
  if (!stored.value) return jsonResponse({ error: "not-found" }, 404);
  if (!stored.metadata?.deleteVerifier || await sha256Base64Url(token) !== stored.metadata.deleteVerifier) {
    return jsonResponse({ error: "delete-forbidden" }, 403);
  }
  await context.env.SYMBOLIC_SHARE_KV.delete(id);
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}

export function onRequest(): Response {
  return jsonResponse({ error: "method-not-allowed" }, 405);
}
