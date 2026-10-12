import {
  CHAR_CAP,
  classifyOpenAIError,
  clearCookie,
  INTERPRETATIONS_PER_SESSION,
  isSameOrigin,
  json,
  loadSession,
  OPENAI_API_BASE,
  pickModel,
  readConfig,
  readErrorCode,
  relayResponsesStream,
  buildResponsesBody,
  saveSession,
  SESSION_COOKIE,
  type SiwcEnv,
  validateInterpretRequest,
} from "../../_shared/siwc";

interface Context {
  env: SiwcEnv;
  request: Request;
}

export async function onRequestPost({ env, request }: Context): Promise<Response> {
  const config = readConfig(env);
  if (!config) return json({ error: "disabled" }, 404);
  if (!isSameOrigin(request)) return json({ error: "origin-not-allowed" }, 403);
  if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
    return json({ error: "content-type-required" }, 415);
  }

  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 1_000) return json({ error: "payload-too-large" }, 413);
    body = JSON.parse(raw);
  } catch {
    return json({ error: "invalid-json" }, 400);
  }
  // Only calculated pillar indices are accepted, so this endpoint cannot be
  // used as a general ChatGPT proxy under OIYO's client ID.
  const input = validateInterpretRequest(body);
  if (!input) return json({ error: "invalid-payload" }, 400);

  const current = await loadSession(config, request);
  if (!current) return json({ error: "not-connected" }, 401);
  const { id, session } = current;
  if (session.used >= INTERPRETATIONS_PER_SESSION) return json({ error: "rate-limited" }, 429);

  if (!session.model) {
    const model = await pickModel(config, session.accessToken);
    if (!model) return json({ error: "temporarily-unavailable" }, 503);
    session.model = model;
  }
  session.used += 1;
  await saveSession(config, id, session);

  const upstream = await fetch(`${OPENAI_API_BASE}/responses`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.accessToken}`, "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify(buildResponsesBody(session.model, input)),
  });
  if (!upstream.ok || !upstream.body) {
    const code = await readErrorCode(upstream);
    const error = classifyOpenAIError(upstream.status, code);
    console.warn("siwc responses failed", upstream.status, code ?? "", upstream.headers.get("x-request-id"));
    if (error === "reconnect") {
      await config.kv.delete(`s:${id}`);
      return json({ error }, 401, { "Set-Cookie": clearCookie(SESSION_COOKIE) });
    }
    return json({ error }, upstream.status >= 400 ? upstream.status : 502);
  }

  return new Response(relayResponsesStream(upstream.body, CHAR_CAP[input.locale]), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export function onRequest(): Response {
  return json({ error: "method-not-allowed" }, 405);
}
