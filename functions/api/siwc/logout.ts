import {
  basicAuth,
  clearCookie,
  getDiscovery,
  isSameOrigin,
  json,
  loadSession,
  readConfig,
  readCookie,
  SESSION_COOKIE,
  type SiwcEnv,
} from "../../_shared/siwc";

interface Context {
  env: SiwcEnv;
  request: Request;
}

export async function onRequestPost({ env, request }: Context): Promise<Response> {
  const config = readConfig(env);
  if (!config) return json({ error: "disabled" }, 404);
  if (!isSameOrigin(request)) return json({ error: "origin-not-allowed" }, 403);

  const current = await loadSession(config, request);
  // remoteRevoked: true = OpenAI confirmed, false = tried and failed, null = nothing to revoke
  // (no refresh token). The page tells the user to disconnect in ChatGPT settings unless true.
  let remoteRevoked: boolean | null = null;
  if (current?.session.refreshToken) {
    const discovery = await getDiscovery();
    if (discovery.revocation_endpoint) {
      const response = await fetch(discovery.revocation_endpoint, {
        method: "POST",
        headers: { Authorization: basicAuth(config), "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ token: current.session.refreshToken, token_type_hint: "refresh_token", client_id: config.clientId }),
      }).catch(() => null);
      remoteRevoked = response?.status === 200;
    }
  }
  const sessionId = current?.id ?? readCookie(request, SESSION_COOKIE);
  if (sessionId) await config.kv.delete(`s:${sessionId}`);
  return json({ remoteRevoked }, 200, { "Set-Cookie": clearCookie(SESSION_COOKIE) });
}

export function onRequest(): Response {
  return json({ error: "method-not-allowed" }, 405);
}
