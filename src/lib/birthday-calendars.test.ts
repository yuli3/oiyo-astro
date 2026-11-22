import { describe, expect, it } from "vitest";
import { REPUBLICAN_DAYS } from "../data/republican-days";
import { allCalendars, dayGanzhi, hebrewMonthName, japaneseEra, jdn, mayaFromJdn, parseYmd, republicanFromJdn, roman } from "./birthday-calendars";

// Hebrew, Islamic, Maya and Julian expected values from convertdate 2.5.1. French Republican
// values follow convertdate's romme leap() rule day by day (its schematic to_jd shifts
// the century rule by 12 years, e.g. treats an 100 as leap, so it is not used here).
const REF: [string, number[], number[], number[], string, number[]][] = [
  ["1900-01-01", [108, 4, 12], [5660, 11, 1], [1317, 8, 28], "12.14.5.6.18", [1899, 12, 20]],
  ["1912-07-30", [120, 11, 12], [5672, 5, 16], [1330, 8, 15], "12.14.18.2.11", [1912, 7, 17]],
  ["1926-12-25", [135, 4, 4], [5687, 10, 20], [1345, 6, 19], "12.15.12.13.12", [1926, 12, 12]],
  ["1955-03-21", [163, 6, 30], [5715, 12, 27], [1374, 7, 27], "12.17.1.7.5", [1955, 3, 8]],
  ["1970-09-22", [178, 13, 5], [5730, 6, 21], [1390, 7, 21], "12.17.17.2.9", [1970, 9, 9]],
  ["1989-01-08", [197, 4, 18], [5749, 11, 2], [1409, 5, 30], "12.18.15.12.12", [1988, 12, 26]],
  ["1990-05-17", [198, 8, 27], [5750, 2, 22], [1410, 10, 21], "12.18.17.1.6", [1990, 5, 4]],
  ["1999-12-31", [208, 4, 11], [5760, 10, 22], [1420, 9, 23], "12.19.6.15.1", [1999, 12, 18]],
  ["2000-02-29", [208, 6, 11], [5760, 12, 23], [1420, 11, 24], "12.19.7.0.1", [2000, 2, 16]],
  ["2004-09-21", [212, 13, 6], [5765, 7, 6], [1425, 8, 6], "12.19.11.11.7", [2004, 9, 8]],
  ["2012-12-21", [221, 4, 1], [5773, 10, 8], [1434, 2, 7], "13.0.0.0.0", [2012, 12, 8]],
  ["2019-05-01", [227, 8, 12], [5779, 1, 26], [1440, 8, 25], "13.0.6.8.2", [2019, 4, 18]],
  ["2024-03-10", [232, 6, 21], [5784, 12, 30], [1445, 8, 29], "13.0.11.6.17", [2024, 2, 26]],
  ["2026-11-22", [235, 3, 2], [5787, 9, 12], [1448, 6, 11], "13.0.14.2.4", [2026, 11, 9]],
  ["1960-09-23", [169, 1, 1], [5721, 7, 2], [1380, 4, 1], "12.17.6.17.18", [1960, 9, 10]],
  ["1984-10-02", [193, 1, 10], [5745, 7, 6], [1405, 1, 6], "12.18.11.6.13", [1984, 9, 19]],
];

describe("birthday calendars", () => {
  it.each(REF)("%s matches convertdate", (s, fr, he, isl, maya, jul) => {
    const all = allCalendars(parseYmd(s)!);
    const r = all.republican!;
    expect([r.y, r.m, r.d]).toEqual(fr);
    expect([all.hebrew.y, all.hebrew.m, all.hebrew.d]).toEqual(he);
    expect([all.islamic.y, all.islamic.m, all.islamic.d]).toEqual(isl);
    expect(all.maya.longCount).toBe(maya);
    expect([all.julian.y, all.julian.m, all.julian.d]).toEqual(jul);
  });

  it("knows the famous dates", () => {
    const t = republicanFromJdn(jdn({ y: 1794, m: 7, d: 27 }))!; // 9 Thermidor an II
    expect([t.y, t.m, t.d]).toEqual([2, 11, 9]);
    const b = republicanFromJdn(jdn({ y: 1799, m: 11, d: 9 }))!; // 18 Brumaire an VIII
    expect([b.y, b.m, b.d]).toEqual([8, 2, 18]);
    const m = mayaFromJdn(jdn({ y: 2012, m: 12, d: 21 }));
    expect(m.tzolkin).toEqual({ n: 4, name: "Ajaw" });
    expect(m.haab).toEqual({ d: 3, month: "K'ank'in" });
    expect(dayGanzhi(jdn({ y: 2000, m: 1, d: 1 })).hanja).toBe("戊午");
    expect(dayGanzhi(jdn({ y: 1949, m: 10, d: 1 })).hanja).toBe("甲子");
  });

  it("names Japanese eras at their boundaries", () => {
    expect(japaneseEra({ y: 1989, m: 1, d: 7 })!.text).toBe("昭和64年1月7日");
    expect(japaneseEra({ y: 1989, m: 1, d: 8 })!.text).toBe("平成元年1月8日");
    expect(japaneseEra({ y: 2019, m: 4, d: 30 })!.text).toBe("平成31年4月30日");
    expect(japaneseEra({ y: 2019, m: 5, d: 1 })!.text).toBe("令和元年5月1日");
    expect(japaneseEra({ y: 1900, m: 1, d: 1 })!.text).toBe("明治33年1月1日");
    expect(japaneseEra({ y: 1926, m: 12, d: 25 })!.text).toBe("昭和元年12月25日");
  });

  it("has every day name in three languages", () => {
    for (const lang of ["fr", "en", "ko"] as const) {
      const rows = REPUBLICAN_DAYS[lang];
      expect(rows).toHaveLength(13);
      rows.slice(0, 12).forEach((r) => expect(r).toHaveLength(30));
      expect(rows[12]).toHaveLength(6);
    }
    expect(REPUBLICAN_DAYS.fr[0]![6]).toBe("Carotte");
    expect(REPUBLICAN_DAYS.ko[0]![6]).toBe("당근");
  });

  it("labels Adar in leap years and writes roman years", () => {
    expect(hebrewMonthName(5784, 12)).toBe("Adar I");
    expect(hebrewMonthName(5785, 12)).toBe("Adar");
    expect(roman(198)).toBe("CXCVIII");
    expect(parseYmd("2001-02-29")).toBeNull();
  });

  it("uses the lichun year for the year pillar", () => {
    const a = allCalendars({ y: 1990, m: 1, d: 20 });
    expect(a.ganzhi.year.lichun.hanja).toBe("己巳");
    const b = allCalendars({ y: 1990, m: 5, d: 17 });
    expect(b.ganzhi.year.lichun.hanja).toBe("庚午");
  });
});
