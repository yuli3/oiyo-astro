import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { formatQuery, parseQuery, reignTitle, summarize, wikisourceUrl, type MonthFile } from "./sejong-birthdays";

const load = (m: string) => JSON.parse(readFileSync(`public/data/sejong-birthday/${m}.json`, "utf8")) as MonthFile;

describe("sejong-birthdays", () => {
  it("matches the 1426 calendar: 17 Feb 1426 = lunar 1/1 of Sejong 8", () => {
    const row = load("02")["17"]!.find((r) => r[0] === 1426)!;
    expect(row.slice(1, 5)).toEqual([8, 1, 0, 1]);
  });
  it("keeps rows in year order within the reign", () => {
    const rows = load("05")["5"]!;
    expect(rows.length).toBeGreaterThan(20);
    for (let i = 1; i < rows.length; i += 1) expect(rows[i]![0]).toBeGreaterThan(rows[i - 1]![0]);
    expect(rows.every((r) => r[0] >= 1419 && r[0] <= 1450 && r[5] > 0)).toBe(true);
  });
  it("summarizes and links", () => {
    const rows = load("10")["9"]!;
    const s = summarize(rows);
    expect(s.years).toBe(rows.length);
    expect(s.entries).toBe(rows.reduce((a, r) => a + r[5], 0));
    expect(reignTitle(1)).toBe("元年");
    expect(reignTitle(11)).toBe("十一年");
    expect(reignTitle(20)).toBe("二十年");
    expect(reignTitle(32)).toBe("三十二年");
    expect(decodeURIComponent(wikisourceUrl([1426, 8, 1, 0, 7, 3, ""]))).toContain("世宗實錄/八年#1月7日");
  });
  it("round-trips the month/day query", () => {
    expect(parseQuery(`?${formatQuery({ month: 2, day: 29 })}`)).toEqual({ month: 2, day: 29 });
    expect(parseQuery("?m=4&d=31")).toBeNull();
  });
});
