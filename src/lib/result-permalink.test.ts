import { describe, expect, it } from "vitest";

import { decodeResult, encodeResult } from "./result-permalink";

describe("result-permalink", () => {
  it("round-trips a simple array-of-numbers state (WorkaholicTest answers)", () => {
    const toolId = "workaholic-test";
    const state = { answers: [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4] };

    const encoded = encodeResult(toolId, state);
    expect(encoded).not.toBeNull();

    const decoded = decodeResult<typeof state>(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded?.toolId).toBe(toolId);
    expect(decoded?.state).toEqual(state);
  });

  it("round-trips a nested object state (tarot draw)", () => {
    const toolId = "tarot-reading";
    const state = {
      spread: 3,
      drawn: [
        { id: 0, reversed: false },
        { id: 12, reversed: true },
        { id: 21, reversed: false },
      ],
    };

    const encoded = encodeResult(toolId, state);
    const decoded = decodeResult<typeof state>(encoded);
    expect(decoded?.state).toEqual(state);
  });

  it("decodes a value still prefixed with #r= or r=", () => {
    const encoded = encodeResult("t", { a: 1 });
    expect(decodeResult(`#r=${encoded}`)?.state).toEqual({ a: 1 });
    expect(decodeResult(`r=${encoded}`)?.state).toEqual({ a: 1 });
  });

  it("returns null for a version mismatch instead of throwing", () => {
    expect(decodeResult("9.someBogusPayload")).toBeNull();
  });

  it("returns null for garbage input instead of throwing", () => {
    expect(decodeResult("not-a-valid-hash")).toBeNull();
    expect(decodeResult("")).toBeNull();
    expect(decodeResult(null)).toBeNull();
    expect(decodeResult(undefined)).toBeNull();
    expect(decodeResult("1.")).toBeNull();
    expect(decodeResult("1.%%%invalid%%%")).toBeNull();
  });

  it("falls back to null when the encoded payload would exceed the size guard", () => {
    // High-entropy (non-repeating) blob so LZ compression cannot shrink it
    // below the guard — repetitive strings would compress too well to test this.
    const hugeState = {
      blob: Array.from({ length: 8000 }, (_, i) =>
        Math.random().toString(36).slice(2, 5),
      ).join(String(Math.random())),
    };
    const encoded = encodeResult("huge-tool", hugeState);
    expect(encoded).toBeNull();
  });
});
