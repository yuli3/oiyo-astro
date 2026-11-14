import {
  getDiscovery,
  json,
  OPENAI_API_BASE,
  pkceChallenge,
  randomToken,
  readConfig,
  redirect,
  safeReturnPath,
  setCookie,
  type SiwcEnv,
  type Transaction,
  TX_COOKIE,
} from "../../_shared/siwc";

interface Context {
  env: SiwcEnv;
  request: Request;
}

export async function onRequestGet({ env, request }: Context): Promise<Response> {
  const config = readConfig(env);
  if (!config) return json({ error: "disabled" }, 404);

  const url = new URL(request.url);
  const discovery = await getDiscovery();
  const txId = randomToken();
  const tx: Transaction = {
    state: randomToken(),
    nonce: randomToken(),
    verifier: randomToken(48),
    returnTo: safeReturnPath(url.searchParams.get("return_to")),
  };
  // One-time transaction, consumed by the callback (website guide: 10 minutes).
  await config.kv.put(`tx:${txId}`, JSON.stringify(tx), { expirationTtl: 600 });

  const authorize = new URL(discovery.authorization_endpoint);
  authorize.search = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    redirect_uri: `${url.origin}/api/siwc/callback`,
    scope: config.scopes.join(" "),
    resource: OPENAI_API_BASE,
    state: tx.state,
    nonce: tx.nonce,
    code_challenge: await pkceChallenge(tx.verifier),
    code_challenge_method: "S256",
  }).toString();

  return redirect(authorize.toString(), [setCookie(TX_COOKIE, txId, 600)]);
}

export function onRequest(): Response {
  return json({ error: "method-not-allowed" }, 405);
}
