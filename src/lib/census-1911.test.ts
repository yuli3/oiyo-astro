import { describe, expect, it } from "vitest";
import { ORDERS, TOTAL, drawPerson, formatCensus1911, makePerson, oneIn, orderById, parseCensus1911, scheduleOf } from "./census-1911";

describe("census-1911", () => {
  it("matches the 1911 occupied and unoccupied totals", () => {
    const m = ORDERS.reduce((s, o) => s + o.m, 0);
    const f = ORDERS.reduce((s, o) => s + o.f, 0);
    expect(m).toBe(11430);
    expect(f).toBe(4830 + 10030);
    expect(TOTAL).toBe(26290);
    expect(orderById("other")!.m).toBeGreaterThan(0);
    expect(orderById("other")!.f).toBeGreaterThan(0);
    expect(oneIn(orderById("domestic")!, "f")).toBe(15);
  });

  it("draws both ends of the table", () => {
    expect(drawPerson(() => 0)).toMatchObject({ sex: "m" });
    expect(drawPerson(() => 0).order.id).toBe("domestic");
    expect(drawPerson(() => 0.999999).order.id).toBe("home");
    expect(drawPerson(() => 0.999999).sex).toBe("f");
  });

  it("writes the schedule in the form's words", () => {
    const maid = scheduleOf(makePerson(orderById("domestic")!, "f", () => 0));
    expect(maid.relation).toBe("Servant");
    expect(maid.occupation).toBe("General servant (domestic)");
    expect(maid.years).toBe("");
    const home = scheduleOf(makePerson(orderById("home")!, "f", () => 0.1));
    expect(home.occupation).toBe("");
    expect(home.status).toBe("");
    for (const o of ORDERS) for (const sex of ["m", "f"] as const) {
      if (!o.jobs[sex].length) continue;
      for (let k = 0; k < 40; k += 1) {
        const p = makePerson(o, sex);
        const s = scheduleOf(p);
        expect(s.name).toMatch(/^\w+ \w+$/);
        expect(s.birthplace).toBeTruthy();
        expect(p.died).toBeLessThanOrEqual(p.kids);
        if (s.relation === "Wife") expect(Number(s.born)).toBe(Number(s.living) + Number(s.died));
        else expect(s.born).toBe("");
      }
    }
  });

  it("round-trips the share link and rejects junk", () => {
    const p = makePerson(orderById("textiles")!, "f", () => 0.62);
    expect(parseCensus1911(formatCensus1911(p))).toEqual(p);
    expect(parseCensus1911("o=home&x=m")).toBeNull();
    expect(parseCensus1911(formatCensus1911(p).replace("j=", "j=9"))).toBeNull();
    expect(parseCensus1911(formatCensus1911({ ...p, kids: 1, died: 2 }))).toBeNull();
  });
});
