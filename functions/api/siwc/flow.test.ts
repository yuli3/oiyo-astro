import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { base64UrlEncode, randomToken, resetDiscoveryCache, type SiwcEnv, type SiwcKv } from "../../_shared/siwc";
import { onRequestGet as callback } from "./callback";
import { onRequestPost as interpret } from "./interpret";
import { onRequestGet as login } from "./login";
import { onRequestPost as logout } from "./logout";
import { onRequestGet as status } from "./status";

const ORIGIN = "https://oiyo.net";
const CLIENT_ID = "oaiapp_test";

function memoryKv(): SiwcKv & { store: Map<string, string> } {
  const store = new Map<string, string>();
  return {
    store,
    async get(key) { return store.get(key) ?? null; },
    async put(key, value) { store.set(key, value); },
    async delete(key) { store.delete(key); },
  };
}

let keyPair: CryptoKeyPair;
let jwk: JsonWebKey;

async function signIdToken(claims: Record<string, unknown>): Promise<string> {
  const encode = (value: unknown) => base64UrlEncode(new TextEncoder().encode(JSON.stringify(value)));
  const head = encode({ alg: "RS256", kid: "k1", typ: "JWT" });
  const body = encode(claims);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", keyPair.privateKey, new TextEncoder().encode(`${head}.${body}`));
  return `${head}.${body}.${base64UrlEncode(new Uint8Array(signature))}`;
}

interface Upstream {
  scope: string;
  responses: () => Response;
  tokenRequests: URLSearchParams[];
  responsesBodies: Record<string, unknown>[];
  revoked: string[];
  nonce?: string;
}

function installFetch(upstream: Upstream) {
  vi.stubGlobal("fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.endsWith("/.well-known/openid-configuration")) {
      return Response.json({
        issuer: "https://auth.openai.com",
        authorization_endpoint: "https://auth.openai.com/api/accounts/authorize",
        token_endpoint: "https://auth.openai.com/api/accounts/oauth/token",
        jwks_uri: "https://auth.openai.com/.well-known/jwks.json",
        revocation_endpoint: "https://auth.openai.com/api/accounts/oauth/revoke",
      });
    }
    if (url.endsWith("/jwks.json")) return Response.json({ keys: [{ ...jwk, kid: "k1" }] });
    if (url.endsWith("/oauth/token")) {
      const form = new URLSearchParams(String(init?.body));
      upstream.tokenRequests.push(form);
      expect(new Headers(init?.headers).get("Authorization")).toMatch(/^Basic /);
      const now = Math.floor(Date.now() / 1000);
      return Response.json({
        access_token: "access-1",
        refresh_token: "refresh-1",
        id_token: await signIdToken({ iss: "https://auth.openai.com", aud: CLIENT_ID, sub: "user-1", iat: now, exp: now + 600, nonce: upstream.nonce }),
        expires_in: 3600,
        scope: upstream.scope,
      });
    }
    if (url.endsWith("/oauth/revoke")) {
      upstream.revoked.push(new URLSearchParams(String(init?.body)).get("token") ?? "");
      return new Response(null, { status: 200 });
    }
    if (url.endsWith("/v1/models")) {
      return Response.json({ data: [{ id: "hidden", visibility: "hidden" }, { id: "light", visibility: "list" }, { id: "heavy", visibility: "list" }] });
    }
    if (url.endsWith("/v1/responses")) {
      upstream.responsesBodies.push(JSON.parse(String(init?.body)));
      return upstream.responses();
    }
    throw new Error(`unexpected fetch ${url}`);
  });
}

function sseResponse(events: unknown[]): Response {
  return new Response(events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join(""), { headers: { "Content-Type": "text/event-stream" } });
}

function cookieValue(response: Response, name: string): string | null {
  for (const cookie of response.headers.getSetCookie()) {
    const [pair] = cookie.split(";");
    const [key, value] = pair.split("=");
    if (key === name) return value;
  }
  return null;
}

async function connect(env: SiwcEnv, upstream: Upstream): Promise<{ sessionCookie: string | null; location: string }> {
  const started = await login({ env, request: new Request(`${ORIGIN}/api/siwc/login?return_to=/ko/saju/calculator/`) });
  expect(started.status).toBe(302);
  const authorize = new URL(started.headers.get("Location") ?? "");
  expect(authorize.searchParams.get("scope")).toContain("chatgpt.tokens.use.direct");
  expect(authorize.searchParams.get("code_challenge_method")).toBe("S256");
  expect(authorize.searchParams.get("resource")).toBe("https://api.openai.com/v1");
  upstream.nonce = authorize.searchParams.get("nonce") ?? undefined;
  const tx = cookieValue(started, "__Host-oiyo_siwc_tx");

  const done = await callback({
    env,
    request: new Request(`${ORIGIN}/api/siwc/callback?code=abc&state=${authorize.searchParams.get("state")}`, {
      headers: { Cookie: `__Host-oiyo_siwc_tx=${tx}` },
    }),
  });
  return { sessionCookie: cookieValue(done, "__Host-oiyo_siwc"), location: done.headers.get("Location") ?? "" };
}

const BODY = JSON.stringify({ locale: "ko", pillars: { year: { stem: 6, branch: 6 }, month: { stem: 8, branch: 10 }, day: { stem: 0, branch: 0 }, hour: null } });

function interpretRequest(sessionCookie: string | null, body = BODY): Request {
  return new Request(`${ORIGIN}/api/siwc/interpret`, {
    method: "POST",
    headers: { Origin: ORIGIN, "Content-Type": "application/json", Cookie: `__Host-oiyo_siwc=${sessionCookie}` },
    body,
  });
}

describe("siwc endpoints", () => {
  let env: SiwcEnv & { SIWC_KV: ReturnType<typeof memoryKv> };
  let upstream: Upstream;

  beforeEach(async () => {
    keyPair = await crypto.subtle.generateKey(
      { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
      true,
      ["sign", "verify"],
    ) as CryptoKeyPair;
    jwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
    resetDiscoveryCache();
    env = {
      SIWC_ENABLED: "1",
      OPENAI_CLIENT_ID: CLIENT_ID,
      OPENAI_CLIENT_SECRET: "secret",
      SIWC_TOKEN_KEY: randomToken(32),
      SIWC_MODELS: "light,heavy",
      SIWC_KV: memoryKv(),
    };
    upstream = {
      scope: "openid profile email resource.invoke chatgpt.tokens.use.direct",
      responses: () => sseResponse([{ type: "response.output_text.delta", delta: "[일간 甲] 곧은 기질입니다." }, { type: "response.completed" }]),
      tokenRequests: [],
      responsesBodies: [],
      revoked: [],
    };
    installFetch(upstream);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("is invisible while switched off", async () => {
    const off = { SIWC_ENABLED: "0" };
    expect(await (await status({ env: off, request: new Request(`${ORIGIN}/api/siwc/status`) })).json()).toEqual({ enabled: false, connected: false });
    expect((await login({ env: off, request: new Request(`${ORIGIN}/api/siwc/login`) })).status).toBe(404);
    expect((await interpret({ env: off, request: interpretRequest("x") })).status).toBe(404);
  });

  it("connects, streams an interpretation and disconnects", async () => {
    const { sessionCookie, location } = await connect(env, upstream);
    expect(location).toBe("/ko/saju/calculator/?siwc=connected");
    expect(sessionCookie).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(upstream.tokenRequests[0].get("code_verifier")).toBeTruthy();
    expect(upstream.tokenRequests[0].has("client_secret")).toBe(false);

    // Only ciphertext reaches KV; the transaction was consumed.
    const stored = [...env.SIWC_KV.store.entries()];
    expect(stored.some(([key]) => key.startsWith("tx:"))).toBe(false);
    expect(stored.every(([, value]) => !value.includes("access-1") && !value.includes("refresh-1"))).toBe(true);

    const statusResponse = await status({ env, request: new Request(`${ORIGIN}/api/siwc/status`, { headers: { Cookie: `__Host-oiyo_siwc=${sessionCookie}` } }) });
    expect(await statusResponse.json()).toEqual({ enabled: true, connected: true });

    const streamed = await interpret({ env, request: interpretRequest(sessionCookie) });
    expect(streamed.headers.get("Content-Type")).toContain("ndjson");
    const lines = (await streamed.text()).trim().split("\n").map((line) => JSON.parse(line));
    expect(lines).toEqual([{ type: "delta", text: "[일간 甲] 곧은 기질입니다." }, { type: "done", truncated: false }]);
    expect(upstream.responsesBodies[0]).toMatchObject({ model: "light", store: false, stream: true });

    const out = await logout({ env, request: new Request(`${ORIGIN}/api/siwc/logout`, { method: "POST", headers: { Origin: ORIGIN, Cookie: `__Host-oiyo_siwc=${sessionCookie}` } }) });
    expect(await out.json()).toEqual({ remoteRevoked: true });
    expect(upstream.revoked).toEqual(["refresh-1"]);
    expect([...env.SIWC_KV.store.keys()].some((key) => key.startsWith("s:"))).toBe(false);
  });

  it("refuses a replayed or forged callback", async () => {
    const started = await login({ env, request: new Request(`${ORIGIN}/api/siwc/login?return_to=//evil.example`) });
    const authorize = new URL(started.headers.get("Location") ?? "");
    upstream.nonce = authorize.searchParams.get("nonce") ?? undefined;
    const tx = cookieValue(started, "__Host-oiyo_siwc_tx");
    const forged = await callback({ env, request: new Request(`${ORIGIN}/api/siwc/callback?code=abc&state=wrong`, { headers: { Cookie: `__Host-oiyo_siwc_tx=${tx}` } }) });
    expect(forged.headers.get("Location")).toBe("/?siwc=expired");
    const replay = await callback({ env, request: new Request(`${ORIGIN}/api/siwc/callback?code=abc&state=${authorize.searchParams.get("state")}`, { headers: { Cookie: `__Host-oiyo_siwc_tx=${tx}` } }) });
    expect(replay.headers.get("Location")).toBe("/?siwc=expired");
    expect(upstream.tokenRequests).toHaveLength(0);
  });

  it("keeps the sign-in off when plan usage was not granted", async () => {
    upstream.scope = "openid profile email";
    const { sessionCookie, location } = await connect(env, upstream);
    expect(location).toBe("/ko/saju/calculator/?siwc=no-plan-scope");
    expect(sessionCookie).toBeNull();
  });

  it("rejects a token signed for another nonce", async () => {
    const started = await login({ env, request: new Request(`${ORIGIN}/api/siwc/login?return_to=/ko/`) });
    const authorize = new URL(started.headers.get("Location") ?? "");
    upstream.nonce = "someone-else";
    const tx = cookieValue(started, "__Host-oiyo_siwc_tx");
    const done = await callback({ env, request: new Request(`${ORIGIN}/api/siwc/callback?code=abc&state=${authorize.searchParams.get("state")}`, { headers: { Cookie: `__Host-oiyo_siwc_tx=${tx}` } }) });
    expect(done.headers.get("Location")).toBe("/ko/?siwc=failed");
  });

  it("refuses free text and cross-site posts", async () => {
    const { sessionCookie } = await connect(env, upstream);
    const freeText = await interpret({ env, request: interpretRequest(sessionCookie, JSON.stringify({ locale: "ko", prompt: "write me a poem" })) });
    expect(freeText.status).toBe(400);
    const crossSite = new Request(`${ORIGIN}/api/siwc/interpret`, { method: "POST", headers: { Origin: "https://evil.example", "Content-Type": "application/json" }, body: BODY });
    expect((await interpret({ env, request: crossSite })).status).toBe(403);
    expect(upstream.responsesBodies).toHaveLength(0);
  });

  it("caps interpretations per session", async () => {
    const { sessionCookie } = await connect(env, upstream);
    for (let i = 0; i < 5; i += 1) {
      const response = await interpret({ env, request: interpretRequest(sessionCookie) });
      await response.text();
      expect(response.status).toBe(200);
    }
    const sixth = await interpret({ env, request: interpretRequest(sessionCookie) });
    expect(sixth.status).toBe(429);
    expect(await sixth.json()).toEqual({ error: "rate-limited" });
  });

  it("maps a plan limit to a screen state without retrying", async () => {
    const { sessionCookie } = await connect(env, upstream);
    upstream.responses = () => Response.json({ error: { code: "subscription_sharing_usage_limit_exceeded" } }, { status: 429 });
    const response = await interpret({ env, request: interpretRequest(sessionCookie) });
    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({ error: "usage-limit" });
    expect(upstream.responsesBodies).toHaveLength(1);
  });

  it("drops the session when OpenAI no longer accepts the user", async () => {
    const { sessionCookie } = await connect(env, upstream);
    upstream.responses = () => Response.json({ error: { code: "subscription_sharing_invalid_user" } }, { status: 401 });
    const response = await interpret({ env, request: interpretRequest(sessionCookie) });
    expect(await response.json()).toEqual({ error: "reconnect" });
    expect([...env.SIWC_KV.store.keys()].some((key) => key.startsWith("s:"))).toBe(false);
  });
});
