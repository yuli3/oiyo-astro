import { describe, expect, it } from "vitest";

import { resolveNodeLabel } from "./label";

describe("resolveNodeLabel", () => {
  it("resolves a known ontology node i18nKey to a non-empty string", async () => {
    const label = await resolveNodeLabel("ko", "elements.wood.name");
    expect(typeof label).toBe("string");
    expect((label ?? "").length).toBeGreaterThan(0);
  });

  it("returns undefined for an unknown namespace", async () => {
    expect(await resolveNodeLabel("ko", "does-not-exist.foo")).toBeUndefined();
  });

  it("returns undefined for a key that doesn't resolve inside a real namespace", async () => {
    expect(await resolveNodeLabel("ko", "elements.does-not-exist.name")).toBeUndefined();
  });
});
