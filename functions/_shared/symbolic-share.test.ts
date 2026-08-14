import { describe, expect, it } from "vitest";

import { randomBase64Url, validateWriteRequest } from "./symbolic-share";

describe("Cloudflare symbolic share boundary", () => {
  it("accepts only bounded ciphertext envelopes and TTLs", () => {
    const valid = { ciphertext: "a".repeat(24), iv: "b".repeat(16), ttlSeconds: 604_800 };
    expect(validateWriteRequest(valid)).toMatchObject({ ok: true, ttlSeconds: 604_800 });
    expect(validateWriteRequest({ ...valid, ciphertext: "birth-date:1991-02-04" })).toEqual({ ok: false });
    expect(validateWriteRequest({ ...valid, ttlSeconds: 2_592_001 })).toEqual({ ok: false });
    expect(validateWriteRequest({ ...valid, civilDate: "1991-02-04" })).toEqual({ ok: false });
  });

  it("creates a full 128-bit opaque id", () => {
    const id = randomBase64Url(16);
    expect(id).toMatch(/^[A-Za-z0-9_-]{22}$/);
  });
});
