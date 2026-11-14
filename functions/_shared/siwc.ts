// Sign in with ChatGPT + ChatGPT plan usage for the saju interpretation.
// Design: company-brain projects/oiyo-ecosystem/chatgpt-plan-interpretation-supplement-2026-10-12.md
// Off unless SIWC_ENABLED=1 and every secret is present. OpenAI has not issued
// a client ID yet (2026-10-12), so this ships dark.

export const OPENAI_ISSUER = "https://auth.openai.com";
export const OPENAI_API_BASE = "https://api.openai.com/v1";
const DISCOVERY_URL = `${OPENAI_ISSUER}/.well-known/openid-configuration`;

export const PLAN_SCOPE = "chatgpt.tokens.use.direct";
const BASE_SCOPES = ["openid", "profile", "email", "resource.invoke", PLAN_SCOPE];

export const TX_COOKIE = "__Host-oiyo_siwc_tx";
export const SESSION_COOKIE = "__Host-oiyo_siwc";
const TX_TTL_SECONDS = 600;
// Tokens never outlive one access token (1h). No long-lived refresh storage.
const SESSION_MAX_SECONDS = 3600;
const KV_MIN_TTL = 60;
export const INTERPRETATIONS_PER_SESSION = 5;

export interface SiwcKv {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options: { expirationTtl: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface SiwcEnv {
  SIWC_ENABLED?: string;
  OPENAI_CLIENT_ID?: string;
  OPENAI_CLIENT_SECRET?: string;
  /** base64url, 32 bytes. Encrypts tokens at rest in KV. */
  SIWC_TOKEN_KEY?: string;
  /** Comma-separated preferred models, lightest first. */
  SIWC_MODELS?: string;
  /** "1" adds offline_access, only if OpenAI rejects plan usage without it. */
  SIWC_OFFLINE_ACCESS?: string;
  SIWC_KV?: SiwcKv;
}

export interface SiwcConfig {
  clientId: string;
  clientSecret: string;
  tokenKey: string;
  kv: SiwcKv;
  models: string[];
  scopes: string[];
}

export function readConfig(env: SiwcEnv): SiwcConfig | null {
  if (env.SIWC_ENABLED !== "1") return null;
  if (!env.OPENAI_CLIENT_ID || !env.OPENAI_CLIENT_SECRET || !env.SIWC_TOKEN_KEY || !env.SIWC_KV) return null;
  return {
    clientId: env.OPENAI_CLIENT_ID,
    clientSecret: env.OPENAI_CLIENT_SECRET,
    tokenKey: env.SIWC_TOKEN_KEY,
    kv: env.SIWC_KV,
    models: (env.SIWC_MODELS ?? "").split(",").map((model) => model.trim()).filter(Boolean),
    scopes: env.SIWC_OFFLINE_ACCESS === "1" ? [...BASE_SCOPES, "offline_access"] : BASE_SCOPES,
  };
}

// ---------------------------------------------------------------------------
// Responses

const SECURITY_HEADERS = {
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
} as const;

export function json(body: unknown, status = 200, extra: HeadersInit = {}): Response {
  const headers = new Headers({ ...SECURITY_HEADERS, "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'" });
  new Headers(extra).forEach((value, key) => headers.append(key, value));
  return Response.json(body, { status, headers });
}

export function redirect(location: string, cookies: string[] = []): Response {
  const headers = new Headers({ ...SECURITY_HEADERS, Location: location });
  for (const cookie of cookies) headers.append("Set-Cookie", cookie);
  return new Response(null, { status: 302, headers });
}

export function isSameOrigin(request: Request): boolean {
  return request.headers.get("Origin") === new URL(request.url).origin;
}

// ---------------------------------------------------------------------------
// Encoding, randomness, cookies

export function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function base64UrlDecode(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function randomToken(byteLength = 32): string {
  return base64UrlEncode(crypto.getRandomValues(new Uint8Array(byteLength)));
}

export async function pkceChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64UrlEncode(new Uint8Array(digest));
}

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("Cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=") || null;
  }
  return null;
}

export function setCookie(name: string, value: string, maxAge: number): string {
  return `${name}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

export function clearCookie(name: string): string {
  return setCookie(name, "", 0);
}

/** Only same-site absolute paths; anything else falls back to the home page. */
export function safeReturnPath(value: string | null): string {
  if (!value || value.length > 200) return "/";
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  if (/[\u0000-\u001f]/.test(value)) return "/";
  return value;
}

export function withQuery(path: string, key: string, value: string): string {
  const url = new URL(path, "https://oiyo.invalid");
  url.searchParams.set(key, value);
  return `${url.pathname}${url.search}${url.hash}`;
}

// ---------------------------------------------------------------------------
// Token encryption at rest (AES-GCM). KV only ever holds ciphertext.

async function importTokenKey(rawKey: string): Promise<CryptoKey> {
  const bytes = base64UrlDecode(rawKey);
  if (bytes.length !== 32) throw new Error("SIWC_TOKEN_KEY must be 32 bytes");
  return crypto.subtle.importKey("raw", bytes, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function sealJson(rawKey: string, value: unknown): Promise<string> {
  const key = await importTokenKey(rawKey);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(value));
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext));
  return `${base64UrlEncode(iv)}.${base64UrlEncode(ciphertext)}`;
}

export async function openJson<T>(rawKey: string, sealed: string): Promise<T | null> {
  const [iv, ciphertext] = sealed.split(".");
  if (!iv || !ciphertext) return null;
  try {
    const key = await importTokenKey(rawKey);
    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: base64UrlDecode(iv) }, key, base64UrlDecode(ciphertext));
    return JSON.parse(new TextDecoder().decode(plaintext)) as T;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// OIDC discovery, transactions, sessions

export interface Discovery {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  jwks_uri: string;
  revocation_endpoint?: string;
}

let discoveryCache: { value: Discovery; at: number } | null = null;

export async function getDiscovery(fetcher: typeof fetch = fetch): Promise<Discovery> {
  if (discoveryCache && Date.now() - discoveryCache.at < 3_600_000) return discoveryCache.value;
  const response = await fetcher(DISCOVERY_URL);
  if (!response.ok) throw new Error(`discovery ${response.status}`);
  const value = (await response.json()) as Discovery;
  if (value.issuer !== OPENAI_ISSUER) throw new Error("unexpected issuer");
  discoveryCache = { value, at: Date.now() };
  return value;
}

export function resetDiscoveryCache(): void {
  discoveryCache = null;
}

export interface Transaction {
  state: string;
  nonce: string;
  verifier: string;
  returnTo: string;
}

export interface Session {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  model?: string;
  used: number;
}

export function sessionTtl(session: Session, now = Date.now()): number {
  return Math.min(SESSION_MAX_SECONDS, Math.floor((session.expiresAt - now) / 1000));
}

export async function saveSession(config: SiwcConfig, sessionId: string, session: Session): Promise<boolean> {
  const ttl = sessionTtl(session);
  if (ttl < KV_MIN_TTL) return false;
  await config.kv.put(`s:${sessionId}`, await sealJson(config.tokenKey, session), { expirationTtl: ttl });
  return true;
}

export async function loadSession(config: SiwcConfig, request: Request): Promise<{ id: string; session: Session } | null> {
  const id = readCookie(request, SESSION_COOKIE);
  if (!id || !/^[A-Za-z0-9_-]{43}$/.test(id)) return null;
  const sealed = await config.kv.get(`s:${id}`);
  if (!sealed) return null;
  const session = await openJson<Session>(config.tokenKey, sealed);
  if (!session || session.expiresAt <= Date.now()) return null;
  return { id, session };
}

export function basicAuth(config: SiwcConfig): string {
  return `Basic ${btoa(`${encodeURIComponent(config.clientId)}:${encodeURIComponent(config.clientSecret)}`)}`;
}

// ---------------------------------------------------------------------------
// ID token verification (RS256 via JWKS). The token is discarded afterwards.

interface Jwk extends JsonWebKey {
  kid?: string;
}

function decodeJwtPart<T>(part: string): T {
  return JSON.parse(new TextDecoder().decode(base64UrlDecode(part))) as T;
}

export async function verifyIdToken(
  idToken: string,
  expected: { clientId: string; nonce: string; jwksUri: string },
  fetcher: typeof fetch = fetch,
  now = Math.floor(Date.now() / 1000),
): Promise<boolean> {
  const parts = idToken.split(".");
  if (parts.length !== 3) return false;
  let header: { alg?: string; kid?: string };
  let claims: { iss?: string; aud?: string | string[]; exp?: number; iat?: number; nonce?: string; sub?: string };
  try {
    header = decodeJwtPart(parts[0]);
    claims = decodeJwtPart(parts[1]);
  } catch {
    return false;
  }
  if (header.alg !== "RS256") return false;

  const jwksResponse = await fetcher(expected.jwksUri);
  if (!jwksResponse.ok) return false;
  const { keys } = (await jwksResponse.json()) as { keys: Jwk[] };
  const jwk = keys.find((key) => key.kid === header.kid);
  if (!jwk) return false;
  const key = await crypto.subtle.importKey(
    "jwk",
    { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const signed = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
  const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, base64UrlDecode(parts[2]), signed);
  if (!valid) return false;

  const skew = 5;
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  return claims.iss === OPENAI_ISSUER
    && audiences.includes(expected.clientId)
    && typeof claims.exp === "number" && claims.exp > now - skew
    && typeof claims.iat === "number" && claims.iat <= now + skew
    && claims.nonce === expected.nonce
    && typeof claims.sub === "string" && claims.sub.length > 0;
}

// ---------------------------------------------------------------------------
// The interpretation request: calculated pillars only, never free text.

export const LOCALES = ["ko", "en", "ja", "zh", "fr", "es"] as const;
export type SiwcLocale = (typeof LOCALES)[number];

const STEM_HANJA = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
const BRANCH_HANJA = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
type Element = "Wood" | "Fire" | "Earth" | "Metal" | "Water";
const ELEMENT_ORDER: Element[] = ["Wood", "Fire", "Earth", "Metal", "Water"];
// Index order matches STEM_ORDER / BRANCH_ORDER in src/manifest/data/saju.
const STEM_ELEMENT: Element[] = ["Wood", "Wood", "Fire", "Fire", "Earth", "Earth", "Metal", "Metal", "Water", "Water"];
const BRANCH_ELEMENT: Element[] = ["Water", "Earth", "Wood", "Wood", "Earth", "Fire", "Fire", "Earth", "Metal", "Metal", "Earth", "Water"];

export interface PillarInput {
  stem: number;
  branch: number;
}

export interface InterpretRequest {
  locale: SiwcLocale;
  pillars: { year: PillarInput; month: PillarInput; day: PillarInput; hour: PillarInput | null };
}

function isPillar(value: unknown): value is PillarInput {
  if (!value || typeof value !== "object") return false;
  const pillar = value as Record<string, unknown>;
  if (Object.keys(pillar).some((key) => key !== "stem" && key !== "branch")) return false;
  return Number.isInteger(pillar.stem) && (pillar.stem as number) >= 0 && (pillar.stem as number) < 10
    && Number.isInteger(pillar.branch) && (pillar.branch as number) >= 0 && (pillar.branch as number) < 12
    // A real ganzhi pairs stems and branches of the same parity.
    && (pillar.stem as number) % 2 === (pillar.branch as number) % 2;
}

export function validateInterpretRequest(value: unknown): InterpretRequest | null {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  if (Object.keys(body).some((key) => key !== "locale" && key !== "pillars")) return null;
  if (!LOCALES.includes(body.locale as SiwcLocale)) return null;
  const pillars = body.pillars as Record<string, unknown> | undefined;
  if (!pillars || typeof pillars !== "object") return null;
  if (Object.keys(pillars).some((key) => !["year", "month", "day", "hour"].includes(key))) return null;
  if (!isPillar(pillars.year) || !isPillar(pillars.month) || !isPillar(pillars.day)) return null;
  if (pillars.hour !== null && !isPillar(pillars.hour)) return null;
  return {
    locale: body.locale as SiwcLocale,
    pillars: {
      year: pillars.year,
      month: pillars.month,
      day: pillars.day,
      hour: (pillars.hour as PillarInput | null) ?? null,
    },
  };
}

export function countElements(pillars: InterpretRequest["pillars"]): Record<Element, number> {
  const counts: Record<Element, number> = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
  for (const pillar of [pillars.year, pillars.month, pillars.day, pillars.hour]) {
    if (!pillar) continue;
    counts[STEM_ELEMENT[pillar.stem]] += 1;
    counts[BRANCH_ELEMENT[pillar.branch]] += 1;
  }
  return counts;
}

const GENERATES: Record<Element, Element> = { Wood: "Fire", Fire: "Earth", Earth: "Metal", Metal: "Water", Water: "Wood" };
const CONTROLS: Record<Element, Element> = { Wood: "Earth", Earth: "Water", Water: "Fire", Fire: "Metal", Metal: "Wood" };

/** Ten god of another heavenly stem relative to the day master (same rule as src/lib/ontology/saju/logic.ts). */
export function tenGodOfStem(dayStem: number, otherStem: number): string {
  const day = STEM_ELEMENT[dayStem];
  const other = STEM_ELEMENT[otherStem];
  const samePolarity = dayStem % 2 === otherStem % 2;
  if (day === other) return samePolarity ? "比肩" : "劫財";
  if (GENERATES[day] === other) return samePolarity ? "食神" : "傷官";
  if (GENERATES[other] === day) return samePolarity ? "偏印" : "正印";
  if (CONTROLS[day] === other) return samePolarity ? "偏財" : "正財";
  return samePolarity ? "偏官" : "正官";
}

function describePillar(name: string, pillar: PillarInput, dayStem: number): string {
  const polarity = pillar.stem % 2 === 0 ? "Yang" : "Yin";
  const tenGod = name === "day" ? "day master" : `ten god ${tenGodOfStem(dayStem, pillar.stem)}`;
  return `${name} pillar ${STEM_HANJA[pillar.stem]}${BRANCH_HANJA[pillar.branch]}: stem ${polarity} ${STEM_ELEMENT[pillar.stem]} (${tenGod}), branch ${BRANCH_ELEMENT[pillar.branch]}`;
}

const LANGUAGE_NAME: Record<SiwcLocale, string> = {
  ko: "Korean", en: "English", ja: "Japanese", zh: "Simplified Chinese", fr: "French", es: "Spanish",
};

export function buildInstructions(locale: SiwcLocale): string {
  return [
    "You explain a Korean four-pillars (saju) chart that has already been calculated.",
    `Write in ${LANGUAGE_NAME[locale]}. Plain prose, no headings, no lists, no markdown.`,
    "Write at most 5 paragraphs of 3 to 4 sentences each.",
    "Start every paragraph with the values it rests on in square brackets, for example [day master 甲, Wood 3], then the explanation.",
    "Use only the values given. Do not add pillars, hidden stems, luck cycles, dates or any value that is not listed.",
    "This is a symbolic, cultural interpretation, not science. Say so once.",
    "Never predict specific events or dates. Never give medical, legal or financial advice. Never mention illnesses, treatments or investments.",
    "Describe tendencies and questions worth reflecting on, not fixed fate.",
  ].join("\n");
}

export function buildInputText(request: InterpretRequest): string {
  const { pillars } = request;
  const dayStem = pillars.day.stem;
  const counts = countElements(pillars);
  const lines = [
    `day master: ${STEM_HANJA[dayStem]} (${dayStem % 2 === 0 ? "Yang" : "Yin"} ${STEM_ELEMENT[dayStem]})`,
    describePillar("year", pillars.year, dayStem),
    describePillar("month", pillars.month, dayStem),
    describePillar("day", pillars.day, dayStem),
    pillars.hour ? describePillar("hour", pillars.hour, dayStem) : "hour pillar: unknown (birth time not given; do not guess it)",
    `five elements count: ${ELEMENT_ORDER.map((element) => `${element} ${counts[element]}`).join(", ")}`,
  ];
  return lines.join("\n");
}

export function buildResponsesBody(model: string, request: InterpretRequest): Record<string, unknown> {
  // Plan usage rejects max_output_tokens, temperature, metadata, user and
  // system-role items (preview limitations, 2026-10-12): length is set in the
  // instructions and enforced by the relay's character cap instead.
  return {
    model,
    instructions: buildInstructions(request.locale),
    input: [{ role: "user", content: [{ type: "input_text", text: buildInputText(request) }] }],
    store: false,
    stream: true,
  };
}

export const CHAR_CAP: Record<SiwcLocale, number> = { ko: 2500, ja: 2500, zh: 2000, en: 4000, fr: 4500, es: 4500 };

export async function pickModel(config: SiwcConfig, accessToken: string, fetcher: typeof fetch = fetch): Promise<string | null> {
  const response = await fetcher(`${OPENAI_API_BASE}/models`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) return null;
  const body = (await response.json()) as { data?: { id?: string; visibility?: string }[] };
  const listed = (body.data ?? []).filter((model) => model.visibility === "list" && model.id).map((model) => model.id as string);
  for (const preferred of config.models) if (listed.includes(preferred)) return preferred;
  return listed[0] ?? null;
}

// ---------------------------------------------------------------------------
// Errors → one of a few screen states (errors-and-recovery, 2026-10-12)

export type UiError =
  | "not-connected"
  | "no-plan-scope"
  | "not-eligible"
  | "usage-limit"
  | "temporarily-unavailable"
  | "region-or-policy"
  | "reconnect"
  | "rate-limited"
  | "misconfigured"
  | "unknown";

export function classifyOpenAIError(status: number, code: string | undefined): UiError {
  switch (code) {
    case "subscription_sharing_user_not_eligible": return "not-eligible";
    case "subscription_sharing_usage_limit_exceeded": return "usage-limit";
    case "subscription_sharing_usage_unavailable":
    case "subscription_sharing_user_unavailable": return "temporarily-unavailable";
    case "subscription_sharing_invalid_user": return "reconnect";
    case "subscription_sharing_unsupported_capability":
    case "subscription_sharing_route_not_supported":
    case "chatpass_v2_scope_not_authorized":
    case "chatpass_v2_invalid_authorization_context": return "misconfigured";
    default: break;
  }
  if (status === 401) return "reconnect";
  if (status === 403) return "region-or-policy";
  if (status === 429) return "usage-limit";
  if (status === 503) return "temporarily-unavailable";
  return "unknown";
}

export async function readErrorCode(response: Response): Promise<string | undefined> {
  try {
    const body = (await response.json()) as { error?: { code?: string } };
    return body.error?.code ?? undefined;
  } catch {
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// Output guard: drop sentences that cross the site's YMYL line.

const BLOCKED_SENTENCE = [
  // health
  /(완치|치료|진단|처방|질병|암에|투병|cure|diagnos|prescri|treatment|illness|disease|治愈|治疗|治療|診断|诊断|病気|疾病|guéri|diagnostic|maladie|curar|diagnóstico|enfermedad)/i,
  // money
  /(주식|코인|투자하|부동산을 사|invest in|buy (stocks|crypto|shares)|株を買|投資す|买股票|投资|investir dans|acheter des actions|invertir en|comprar acciones)/i,
  // dated events
  /((19|20)\d{2}\s*(년|年)|\bin (19|20)\d{2}\b|\ben (19|20)\d{2}\b).{0,40}(사고|사망|죽|이혼|결혼|accident|death|die|divorce|marr|事故|死|離婚|结婚|結婚|mort|décès|accidente|muerte|divorcio|matrimonio)/i,
];

export function isBlockedSentence(sentence: string): boolean {
  return BLOCKED_SENTENCE.some((pattern) => pattern.test(sentence));
}

const SENTENCE_END = /[.!?。！？\n]/;

/** Splits buffered text into complete sentences and the unfinished tail. */
export function takeSentences(buffer: string): { sentences: string[]; rest: string } {
  const sentences: string[] = [];
  let start = 0;
  for (let i = 0; i < buffer.length; i += 1) {
    if (SENTENCE_END.test(buffer[i])) {
      sentences.push(buffer.slice(start, i + 1));
      start = i + 1;
    }
  }
  return { sentences, rest: buffer.slice(start) };
}

export type RelayEvent =
  | { type: "delta"; text: string }
  | { type: "filtered" }
  | { type: "done"; truncated: boolean }
  | { type: "error"; code: UiError };

/**
 * Turns the upstream Responses SSE stream into NDJSON events for the page:
 * only output text, filtered per sentence, cut at the locale's character cap.
 */
export function relayResponsesStream(upstream: ReadableStream<Uint8Array>, cap: number): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = upstream.getReader();
  let sse = "";
  let text = "";
  let emitted = 0;
  let filteredAny = false;
  let finished = false;

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      let sent = false;
      const send = (event: RelayEvent) => {
        sent = true;
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };
      const flushSentences = (sentences: string[]): boolean => {
        for (const sentence of sentences) {
          if (!sentence) continue;
          if (isBlockedSentence(sentence)) {
            if (!filteredAny) send({ type: "filtered" });
            filteredAny = true;
            continue;
          }
          if (emitted + sentence.length > cap) return false;
          emitted += sentence.length;
          send({ type: "delta", text: sentence });
        }
        return true;
      };
      const finish = async (event: RelayEvent) => {
        if (finished) return;
        finished = true;
        send(event);
        controller.close();
        await reader.cancel().catch(() => undefined);
      };

      while (!finished) {
        const { value, done } = await reader.read();
        if (done) {
          if (!flushSentences([text])) return finish({ type: "done", truncated: true });
          return finish({ type: "done", truncated: false });
        }
        sse += decoder.decode(value, { stream: true });
        const blocks = sse.split("\n\n");
        sse = blocks.pop() ?? "";
        for (const block of blocks) {
          const data = block.split("\n").filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trim()).join("");
          if (!data || data === "[DONE]") continue;
          let event: { type?: string; delta?: string; code?: string; error?: { code?: string }; response?: { error?: { code?: string } } };
          try {
            event = JSON.parse(data);
          } catch {
            continue;
          }
          if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
            text += event.delta;
            const { sentences, rest } = takeSentences(text);
            text = rest;
            if (!flushSentences(sentences)) return finish({ type: "done", truncated: true });
          } else if (event.type === "response.failed" || event.type === "error") {
            const code = event.response?.error?.code ?? event.error?.code ?? event.code;
            return finish({ type: "error", code: classifyOpenAIError(0, code) });
          } else if (event.type === "response.completed") {
            if (!flushSentences([text])) return finish({ type: "done", truncated: true });
            text = "";
            return finish({ type: "done", truncated: false });
          }
        }
        // pull() is not called again unless this call enqueued something,
        // so keep reading until there is output for the page.
        if (sent) return;
      }
    },
    async cancel() {
      await reader.cancel().catch(() => undefined);
    },
  });
}
