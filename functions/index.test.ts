import { describe, expect, it } from "vitest";

import { onRequest, pickLocale } from "./index";

describe("root locale redirect", () => {
  it("keeps Korean for no header (crawlers) and Korean browsers", () => {
    expect(pickLocale(null)).toBe("ko");
    expect(pickLocale("")).toBe("ko");
    expect(pickLocale("ko-KR,ko;q=0.9,en;q=0.8")).toBe("ko");
  });

  it("sends unsupported languages to English", () => {
    expect(pickLocale("tr-TR,tr;q=0.9")).toBe("en");
    expect(pickLocale("tr-TR,tr;q=0.9,en-US;q=0.8")).toBe("en");
    expect(pickLocale("de-DE")).toBe("en");
  });

  it("honours q weights and supported languages", () => {
    expect(pickLocale("ja;q=0.5,fr;q=0.9")).toBe("fr");
    expect(pickLocale("zh-TW,zh;q=0.9")).toBe("zh");
    expect(pickLocale("es-MX")).toBe("es");
    expect(pickLocale("ko;q=0,ja")).toBe("ja");
  });

  it("redirects with 302, Vary and the query string", () => {
    const res = onRequest({ request: new Request("https://oiyo.net/?ref=producthunt", { headers: { "Accept-Language": "tr-TR" } }) });
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/en/?ref=producthunt");
    expect(res.headers.get("Vary")).toBe("Accept-Language");
  });
});
