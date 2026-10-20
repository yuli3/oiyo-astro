import { describe, expect, it } from "vitest";
import { isKrNonBusinessDay, krTaxDeadline } from "./kr-business-day";

const d = (s: string) => new Date(`${s}T00:00:00`);
const iso = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;

describe("krTaxDeadline", () => {
  it("keeps a weekday deadline", () => {
    expect(iso(krTaxDeadline(d("2026-03-31")))).toBe("2026-03-31");
  });
  it("moves a Saturday deadline to Monday", () => {
    expect(iso(krTaxDeadline(d("2026-07-25")))).toBe("2026-07-27");
  });
  it("skips a weekend and a substitute holiday", () => {
    // 2026-10-03 is a Saturday, 10/4 a Sunday and 10/5 the substitute holiday
    expect(iso(krTaxDeadline(d("2026-10-03")))).toBe("2026-10-06");
  });
  it("moves past 설날 into the next business day", () => {
    expect(iso(krTaxDeadline(d("2027-02-06")))).toBe("2027-02-10");
  });
  it("treats 제헌절 as a holiday from 2026", () => {
    expect(isKrNonBusinessDay(d("2026-07-17"))).toBe(true);
  });
  it("moves the 2026 comprehensive income tax deadline (Sun 5/31) to 6/1", () => {
    expect(iso(krTaxDeadline(d("2026-05-31")))).toBe("2026-06-01");
  });
});
