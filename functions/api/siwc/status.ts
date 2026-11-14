import { json, loadSession, readConfig, type SiwcEnv } from "../../_shared/siwc";

interface Context {
  env: SiwcEnv;
  request: Request;
}

export async function onRequestGet({ env, request }: Context): Promise<Response> {
  const config = readConfig(env);
  if (!config) return json({ enabled: false, connected: false });
  const current = await loadSession(config, request);
  return json({ enabled: true, connected: Boolean(current) });
}

export function onRequest(): Response {
  return json({ error: "method-not-allowed" }, 405);
}
