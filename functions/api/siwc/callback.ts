import {
  basicAuth,
  clearCookie,
  getDiscovery,
  json,
  PLAN_SCOPE,
  randomToken,
  readConfig,
  readCookie,
  redirect,
  saveSession,
  SESSION_COOKIE,
  sessionTtl,
  setCookie,
  type Session,
  type SiwcEnv,
  type Transaction,
  TX_COOKIE,
  verifyIdToken,
  withQuery,
} from "../../_shared/siwc";

interface Context {
  env: SiwcEnv;
  request: Request;
}

interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
  scope?: string;
}

export async function onRequestGet({ env, request }: Context): Promise<Response> {
  const config = readConfig(env);
  if (!config) return json({ error: "disabled" }, 404);

  const url = new URL(request.url);
  const clearTx = clearCookie(TX_COOKIE);
  const txId = readCookie(request, TX_COOKIE);
  const rawTx = txId ? await config.kv.get(`tx:${txId}`) : null;
  if (!txId || !rawTx) return redirect("/?siwc=expired", [clearTx]);
  // Consume before anything else so a replayed callback finds nothing.
  await config.kv.delete(`tx:${txId}`);
  const tx = JSON.parse(rawTx) as Transaction;
  const back = (status: string, cookies: string[] = []) => redirect(withQuery(tx.returnTo, "siwc", status), [clearTx, ...cookies]);

  if (url.searchParams.get("state") !== tx.state) return back("expired");
  if (url.searchParams.get("error")) return back("denied");
  const code = url.searchParams.get("code");
  if (!code) return back("denied");

  const discovery = await getDiscovery();
  const tokenResponse = await fetch(discovery.token_endpoint, {
    method: "POST",
    headers: { Authorization: basicAuth(config), "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: `${url.origin}/api/siwc/callback`,
      client_id: config.clientId,
      code_verifier: tx.verifier,
    }),
  });
  if (!tokenResponse.ok) {
    console.warn("siwc token exchange failed", tokenResponse.status, tokenResponse.headers.get("x-request-id"));
    return back("failed");
  }
  const tokens = (await tokenResponse.json()) as TokenResponse;
  if (!tokens.id_token || !tokens.access_token) return back("failed");

  const verified = await verifyIdToken(tokens.id_token, { clientId: config.clientId, nonce: tx.nonce, jwksUri: discovery.jwks_uri });
  if (!verified) return back("failed");
  // Plan usage is on only when the grant includes it; a valid ID token alone is not enough.
  if (!(tokens.scope ?? "").split(" ").includes(PLAN_SCOPE)) return back("no-plan-scope");

  const session: Session = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + (tokens.expires_in ?? 3600) * 1000,
    used: 0,
  };
  const sessionId = randomToken();
  if (!(await saveSession(config, sessionId, session))) return back("failed");
  return back("connected", [setCookie(SESSION_COOKIE, sessionId, sessionTtl(session))]);
}

export function onRequest(): Response {
  return json({ error: "method-not-allowed" }, 405);
}
