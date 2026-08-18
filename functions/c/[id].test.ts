import { describe, expect, it } from "vitest";

import { onRequest } from "./[id]";

describe("short-share invite bridge", () => {
  it("forwards join=1 onto the locale compatibility page", () => {
    const response = onRequest({
      params: { id: "abcdefghijklmnopqrstuv" },
      request: new Request("https://oiyo.net/c/abcdefghijklmnopqrstuv?l=ko&join=1"),
    });
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("/ko/profile/symbolic-compatibility/?share=abcdefghijklmnopqrstuv&join=1");
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
  });

  it("keeps a plain share without join", () => {
    const response = onRequest({
      params: { id: "abcdefghijklmnopqrstuv" },
      request: new Request("https://oiyo.net/c/abcdefghijklmnopqrstuv?l=ja"),
    });
    expect(response.headers.get("Location")).toBe("/ja/profile/symbolic-compatibility/?share=abcdefghijklmnopqrstuv");
  });
});
