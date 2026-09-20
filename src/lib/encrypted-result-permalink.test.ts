import { describe, expect, it } from "vitest";

import { createEncryptedResultPermalink, readEncryptedResultPermalink } from "./encrypted-result-permalink";

const ID = "abcdefghijklmnopqrstuv";
const TOKEN = "d".repeat(43);
const NOW = new Date("2026-09-20T00:00:00.000Z");

describe("encrypted result permalink", () => {
  it("keeps raw birth inputs out of the URL and server envelope", async () => {
    let requestBody = "";
    const stored: { body?: unknown } = {};
    const writeFetcher: typeof fetch = async (_input, init) => {
      requestBody = String(init?.body ?? "");
      stored.body = JSON.parse(requestBody);
      return Response.json({ deleteToken: TOKEN, id: ID });
    };
    const state = { day: 1, gender: "female", hour: 9, minute: 0, month: 9, schemaVersion: 2, year: 2002 };

    const created = await createEncryptedResultPermalink("saju-calculator", state, {
      fetcher: writeFetcher,
      now: NOW,
      pageUrl: "https://oiyo.net/ko/saju/",
    });

    expect(created.url).toMatch(new RegExp(`^https://oiyo.net/ko/saju/\\?result=${ID}#k=`));
    expect(created.url).not.toContain("2002");
    expect(requestBody).not.toContain("2002");

    const readFetcher: typeof fetch = async () => Response.json({
      ...(stored.body as object),
      schema: "oiyo.symbolic-share-ciphertext",
      schemaVersion: 1,
    });
    const read = await readEncryptedResultPermalink(ID, new URL(created.url).hash, { fetcher: readFetcher, now: NOW });
    expect(read).toMatchObject({ ok: true, result: { state, toolId: "saju-calculator" } });
  });

  it("rejects a wrong key without exposing partial data", async () => {
    const missing: typeof fetch = async () => new Response("missing", { status: 404 });
    expect(await readEncryptedResultPermalink(ID, `#k=${"x".repeat(43)}`, { fetcher: missing })).toEqual({ ok: false, reason: "not-found" });
  });
});
