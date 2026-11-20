import { describe, expect, it } from "vitest";
import { ROLES, TOTAL, drawRole, formatTongsinsa, parseTongsinsa, roleById } from "./tongsinsa-1763";

describe("tongsinsa-1763", () => {
  it("roles add up to the 477 of the 1763 mission, with 228 oarsmen", () => {
    expect(ROLES.reduce((s, r) => s + r.n, 0)).toBe(TOTAL);
    expect(roleById("gyeokgun")?.n).toBe(228);
    expect(ROLES.every((r) => r.n > 0)).toBe(true);
  });
  it("draws every role", () => {
    const seen = new Set<string>();
    for (let i = 0; i < TOTAL; i++) seen.add(drawRole(() => (i + 0.5) / TOTAL).id);
    expect(seen.size).toBe(ROLES.length);
  });
  it("round-trips", () => {
    expect(parseTongsinsa("?" + formatTongsinsa("uiwon"))?.id).toBe("uiwon");
    expect(parseTongsinsa("?r=zz")).toBeNull();
  });
});
