import { describe, expect, it } from "vitest";

import { BRANCHES, BRANCH_ORDER } from "@/manifest/data/saju/branches";
import { STEMS, STEM_ORDER } from "@/manifest/data/saju/stems";
import { calculateTenGod } from "@/lib/ontology/saju/logic";
import { HeavenlyStem, TenGod } from "@/lib/ontology/saju/types";

import {
  buildInputText,
  buildResponsesBody,
  classifyOpenAIError,
  countElements,
  isBlockedSentence,
  openJson,
  randomToken,
  readConfig,
  relayResponsesStream,
  safeReturnPath,
  sealJson,
  takeSentences,
  tenGodOfStem,
  validateInterpretRequest,
  withQuery,
  type RelayEvent,
} from "./siwc";

const PILLARS = {
  year: { stem: 6, branch: 6 }, // 庚午
  month: { stem: 8, branch: 10 }, // 壬戌
  day: { stem: 0, branch: 0 }, // 甲子
  hour: { stem: 3, branch: 9 }, // 丁酉
};

describe("siwc config", () => {
  const full = {
    SIWC_ENABLED: "1",
    OPENAI_CLIENT_ID: "oaiapp_x",
    OPENAI_CLIENT_SECRET: "secret",
    SIWC_TOKEN_KEY: randomToken(32),
    SIWC_KV: { get: async () => null, put: async () => undefined, delete: async () => undefined },
  };

  it("stays off without the switch or any secret", () => {
    expect(readConfig({})).toBeNull();
    expect(readConfig({ ...full, SIWC_ENABLED: "0" })).toBeNull();
    expect(readConfig({ ...full, OPENAI_CLIENT_SECRET: undefined })).toBeNull();
    expect(readConfig({ ...full, SIWC_KV: undefined })).toBeNull();
  });

  it("asks for plan usage without offline_access unless told to", () => {
    expect(readConfig(full)?.scopes).toEqual(["openid", "profile", "email", "resource.invoke", "chatgpt.tokens.use.direct"]);
    expect(readConfig({ ...full, SIWC_OFFLINE_ACCESS: "1" })?.scopes).toContain("offline_access");
  });
});

describe("siwc request boundary", () => {
  it("accepts calculated pillars only", () => {
    expect(validateInterpretRequest({ locale: "ko", pillars: PILLARS })).not.toBeNull();
    expect(validateInterpretRequest({ locale: "ko", pillars: { ...PILLARS, hour: null } })).not.toBeNull();
  });

  it("rejects free text, extra fields, impossible ganzhi and unknown locales", () => {
    expect(validateInterpretRequest({ locale: "ko", pillars: PILLARS, prompt: "ignore that" })).toBeNull();
    expect(validateInterpretRequest({ locale: "ko", pillars: { ...PILLARS, day: { stem: 0, branch: 1 } } })).toBeNull();
    expect(validateInterpretRequest({ locale: "ko", pillars: { ...PILLARS, day: { stem: 10, branch: 0 } } })).toBeNull();
    expect(validateInterpretRequest({ locale: "ko", pillars: { ...PILLARS, day: { stem: "甲", branch: 0 } } })).toBeNull();
    expect(validateInterpretRequest({ locale: "de", pillars: PILLARS })).toBeNull();
    expect(validateInterpretRequest({ locale: "ko", pillars: { ...PILLARS, extra: PILLARS.day } })).toBeNull();
  });
});

describe("siwc derived values match the site's saju engine", () => {
  it("uses the same stem and branch elements", () => {
    const counts = countElements(PILLARS);
    const expected: Record<string, number> = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
    const name = (element: string) => element[0].toUpperCase() + element.slice(1);
    for (const pillar of Object.values(PILLARS)) {
      expected[name(STEMS[STEM_ORDER[pillar.stem]].element)] += 1;
      expected[name(BRANCHES[BRANCH_ORDER[pillar.branch]].element)] += 1;
    }
    expect(counts).toEqual(expected);
  });

  it("uses the same ten gods for every stem pair except 辛 as the other stem", () => {
    const hanja: Record<TenGod, string> = {
      [TenGod.BI_GYEON]: "比肩", [TenGod.GEOP_JAE]: "劫財", [TenGod.SIK_SIN]: "食神", [TenGod.SANG_GWAN]: "傷官",
      [TenGod.PYEON_JAE]: "偏財", [TenGod.JEONG_JAE]: "正財", [TenGod.PYEON_GWAN]: "偏官", [TenGod.JEONG_GWAN]: "正官",
      [TenGod.PYEON_IN]: "偏印", [TenGod.JEONG_IN]: "正印",
    };
    for (let day = 0; day < 10; day += 1) {
      for (let other = 0; other < 10; other += 1) {
        // calculateTenGod looks the target up in earthlyBranches first, and
        // "SIN" is both the stem 辛 and the branch 申, so the site reads 辛 as
        // 申's main stem 庚 (2026-10-12, reported separately). Checked below.
        if (other === 7) continue;
        const site = calculateTenGod(STEM_ORDER[day] as HeavenlyStem, STEM_ORDER[other] as HeavenlyStem);
        expect(tenGodOfStem(day, other)).toBe(hanja[site]);
      }
    }
  });
});

describe("siwc ten gods for 辛", () => {
  it("treats 辛 as Yin Metal", () => {
    expect(tenGodOfStem(0, 7)).toBe("正官"); // 甲 day, 辛: metal controls wood, opposite polarity
    expect(tenGodOfStem(5, 7)).toBe("食神"); // 己 day, 辛: earth generates metal, same polarity
    expect(tenGodOfStem(6, 7)).toBe("劫財");
  });
});

describe("siwc model request", () => {
  it("sends only the derived values and none of the fields plan usage rejects", () => {
    const body = buildResponsesBody("model-x", { locale: "ja", pillars: PILLARS });
    expect(body).toMatchObject({ model: "model-x", store: false, stream: true });
    for (const forbidden of ["max_output_tokens", "temperature", "metadata", "user", "previous_response_id", "safety_identifier", "top_p"]) {
      expect(body).not.toHaveProperty(forbidden);
    }
    expect(JSON.stringify(body)).not.toContain('"system"');
    expect(String(body.instructions)).toContain("Japanese");
  });

  it("describes an unknown hour without inventing one", () => {
    const text = buildInputText({ locale: "en", pillars: { ...PILLARS, hour: null } });
    expect(text).toContain("hour pillar: unknown");
    expect(text).toContain("day master: 甲 (Yang Wood)");
    expect(text).not.toContain("丁酉");
  });
});

describe("siwc tokens at rest", () => {
  it("round-trips and rejects a wrong key", async () => {
    const key = randomToken(32);
    const sealed = await sealJson(key, { accessToken: "at", expiresAt: 1 });
    expect(sealed).not.toContain("at\"");
    expect(await openJson(key, sealed)).toEqual({ accessToken: "at", expiresAt: 1 });
    expect(await openJson(randomToken(32), sealed)).toBeNull();
  });
});

describe("siwc redirects", () => {
  it("keeps return paths on this site", () => {
    expect(safeReturnPath("/ko/saju/calculator/")).toBe("/ko/saju/calculator/");
    expect(safeReturnPath("//evil.example")).toBe("/");
    expect(safeReturnPath("https://evil.example")).toBe("/");
    expect(safeReturnPath("/\\evil.example")).toBe("/");
    expect(safeReturnPath(null)).toBe("/");
    expect(withQuery("/ko/saju/calculator/?x=1", "siwc", "connected")).toBe("/ko/saju/calculator/?x=1&siwc=connected");
  });
});

describe("siwc errors", () => {
  it("maps documented codes to screen states", () => {
    expect(classifyOpenAIError(403, "subscription_sharing_user_not_eligible")).toBe("not-eligible");
    expect(classifyOpenAIError(429, "subscription_sharing_usage_limit_exceeded")).toBe("usage-limit");
    expect(classifyOpenAIError(503, "subscription_sharing_usage_unavailable")).toBe("temporarily-unavailable");
    expect(classifyOpenAIError(401, "subscription_sharing_invalid_user")).toBe("reconnect");
    expect(classifyOpenAIError(400, "subscription_sharing_unsupported_capability")).toBe("misconfigured");
    expect(classifyOpenAIError(403, "chatpass_v2_scope_not_authorized")).toBe("misconfigured");
    expect(classifyOpenAIError(403, undefined)).toBe("region-or-policy");
    expect(classifyOpenAIError(500, undefined)).toBe("unknown");
  });
});

describe("siwc output guard", () => {
  it("drops health, money and dated-event sentences", () => {
    expect(isBlockedSentence("이 구성은 병을 치료하는 데 도움이 됩니다.")).toBe(true);
    expect(isBlockedSentence("You should invest in stocks this year.")).toBe(true);
    expect(isBlockedSentence("2027년에 결혼하게 됩니다.")).toBe(true);
    expect(isBlockedSentence("[일간 甲, 목 3] 곧게 뻗으려는 기질로 읽힙니다.")).toBe(false);
  });

  it("splits complete sentences from the tail", () => {
    expect(takeSentences("하나. 둘! 셋")).toEqual({ sentences: ["하나.", " 둘!"], rest: " 셋" });
  });
});

function sse(events: unknown[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const chunks = events.map((event) => `event: x\ndata: ${JSON.stringify(event)}\n\n`);
  return new ReadableStream({
    start(controller) {
      // Split mid-event to prove the parser buffers across chunks.
      const all = chunks.join("");
      const middle = Math.floor(all.length / 2);
      controller.enqueue(encoder.encode(all.slice(0, middle)));
      controller.enqueue(encoder.encode(all.slice(middle)));
      controller.close();
    },
  });
}

async function collect(stream: ReadableStream<Uint8Array>): Promise<RelayEvent[]> {
  const text = await new Response(stream).text();
  return text.trim().split("\n").map((line) => JSON.parse(line) as RelayEvent);
}

describe("siwc stream relay", () => {
  const delta = (text: string) => ({ type: "response.output_text.delta", delta: text });

  it("relays text sentence by sentence and filters blocked ones", async () => {
    const events = await collect(relayResponsesStream(sse([
      delta("[일간 甲] 곧게 뻗"), delta("는 기질입니다. 이 사주는 병을 치료"), delta("합니다. 끝"),
      { type: "response.completed" },
    ]), 1000));
    expect(events).toEqual([
      { type: "delta", text: "[일간 甲] 곧게 뻗는 기질입니다." },
      { type: "filtered" },
      { type: "delta", text: " 끝" },
      { type: "done", truncated: false },
    ]);
  });

  it("stops at the character cap", async () => {
    const events = await collect(relayResponsesStream(sse([delta("가나다라. 마바사아. 자차카타."), { type: "response.completed" }]), 12));
    expect(events.at(-1)).toEqual({ type: "done", truncated: true });
    expect(events.filter((event) => event.type === "delta").map((event) => (event as { text: string }).text).join("").length).toBeLessThanOrEqual(12);
  });

  it("keeps what arrived and reports a usage limit hit mid-stream", async () => {
    const events = await collect(relayResponsesStream(sse([
      delta("첫 문장입니다. "),
      { type: "response.failed", response: { error: { code: "subscription_sharing_usage_limit_exceeded" } } },
    ]), 1000));
    expect(events).toEqual([
      { type: "delta", text: "첫 문장입니다." },
      { type: "error", code: "usage-limit" },
    ]);
  });
});
