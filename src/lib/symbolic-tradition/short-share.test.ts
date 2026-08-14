import { describe, expect, it } from "vitest";

import { deriveSymbolicProfile } from ".";
import { createEncryptedShortShare, readEncryptedShortShare } from "./short-share";

const NOW = new Date("2026-08-14T00:00:00.000Z");
const ID = "abcdefghijklmnopqrstuv";
const DELETE_TOKEN = "d".repeat(43);
const profile = deriveSymbolicProfile({ civilDate: "1991-02-04", civilTime: "08:30", longitude: 126.978, utcOffsetMinutes: 540 });

describe("encrypted symbolic short share", () => {
  it("keeps the AES key in the fragment and round-trips ciphertext", async () => {
    let storedBody: Record<string, unknown> | null = null;
    const writeFetcher = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      storedBody = JSON.parse(String(init?.body));
      return Response.json({ deleteToken: DELETE_TOKEN, id: ID }, { status: 201 });
    }) as typeof fetch;
    const created = await createEncryptedShortShare(profile, { fetcher: writeFetcher, locale: "ko", now: NOW, origin: "https://oiyo.net" });

    expect(created.url).toMatch(/^https:\/\/oiyo\.net\/c\/[A-Za-z0-9_-]{22}\?l=ko#k=[A-Za-z0-9_-]{43}$/);
    expect(JSON.stringify(storedBody)).not.toContain("1991-02-04");
    expect(JSON.stringify(storedBody)).not.toContain(new URL(created.url).hash.slice(3));

    const readFetcher = (async () => Response.json({
      ciphertext: storedBody?.ciphertext,
      iv: storedBody?.iv,
      schema: "oiyo.symbolic-share-ciphertext",
      schemaVersion: 1,
    })) as typeof fetch;
    const read = await readEncryptedShortShare(ID, new URL(created.url).hash, { fetcher: readFetcher, now: NOW });
    expect(read.ok).toBe(true);
    if (read.ok) expect(read.artifact.profile.sunSign).toEqual(profile.sunSign);
  });

  it("fails closed for a wrong key and missing record", async () => {
    const missing = (async () => Response.json({ error: "not-found" }, { status: 404 })) as typeof fetch;
    expect(await readEncryptedShortShare(ID, `#k=${"x".repeat(43)}`, { fetcher: missing })).toEqual({ ok: false, reason: "not-found" });
  });
});
