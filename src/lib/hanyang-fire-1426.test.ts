import { describe, expect, it } from "vitest";
import { DAMAGE, PICKS, PROPOSALS, formatPicks, parsePicks, rankOf, score } from "./hanyang-fire-1426";

describe("hanyang-fire-1426", () => {
  it("keeps the Sillok damage numbers", () => {
    expect(DAMAGE.housesTotal).toBe(2170);
    expect(DAMAGE.dead.men + DAMAGE.dead.women).toBe(32);
  });
  it("scores picks against the real measures", () => {
    const s = score(["relief", "firewall", "agency", "bell", "pass"]);
    expect(s.adopted).toBe(5);
    expect(s.firstDay).toBe(1);
    expect(rankOf(s)).toBe("sage");
    const t = score(["insurance", "pump", "noWine", "bell", "tiles"]);
    expect(t).toMatchObject({ adopted: 2, declined: 1, absent: 2, firstDay: 14 });
    expect(rankOf(t)).toBe("clerk");
    expect(score(["bell"]).firstDay).toBe(18);
  });
  it("round-trips the share link and rejects bad ones", () => {
    const ids = PROPOSALS.slice(0, PICKS).map((p) => p.id);
    expect(parsePicks(`?${formatPicks(ids)}`)).toEqual(ids);
    expect(parsePicks("?p=relief.relief.firewall")).toBeNull();
    expect(parsePicks("?p=a.b.c.d.e")).toBeNull();
    expect(parsePicks("")).toBeNull();
  });
});
