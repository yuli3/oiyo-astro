import { describe, expect, it } from "vitest";
import { ORIGINS, OVER_50_SHARE, TOTAL, drawOrigin, formatEllis, makePassenger, manifestLine, oneIn, originById, parseEllis } from "./ellis-1907";

describe("ellis-1907", () => {
  it("uses the FY1907 country counts", () => {
    expect(originById("austria-hungary")!.n).toBe(355452);
    expect(originById("italy")!.n).toBe(253751);
    expect(TOTAL).toBe(1095201);
    expect(oneIn(originById("france")!)).toBe(113);
    expect(OVER_50_SHARE).toBeCloseTo(0.158, 3);
  });

  it("draws every origin at the edges", () => {
    expect(drawOrigin(() => 0).id).toBe(ORIGINS[0]!.id);
    expect(drawOrigin(() => 0.999999).id).toBe(ORIGINS[ORIGINS.length - 1]!.id);
  });

  it("writes a manifest line in the form's words", () => {
    const p = makePassenger(originById("italy")!, () => 0);
    const line = manifestLine(p);
    expect(line.name).toBe("Russo, Giuseppe");
    expect(line.nationality).toBe("Italy");
    expect(line.port).toBe("Naples");
    expect(line.money).toMatch(/^\$\d+$/);
    for (const o of ORIGINS) for (let k = 0; k < 30; k += 1) {
      const l = manifestLine(makePassenger(o));
      expect(l.calling).toBeTruthy();
      expect(l.residence).toBeTruthy();
    }
  });

  it("round-trips the share link and rejects junk", () => {
    const p = makePassenger(originById("greece")!, () => 0.73);
    expect(parseEllis(formatEllis(p))).toEqual(p);
    expect(parseEllis("o=nope&x=m")).toBeNull();
    expect(parseEllis(formatEllis(p).replace("f=", "f=99"))).toBeNull();
  });
});
