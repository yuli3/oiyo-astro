import { describe, expect, it } from "vitest";
import { CSV_COLUMNS, datasetCsv, datasetRows } from "./reincarnation-dataset";

describe("reincarnation dataset", () => {
  const rows = datasetRows();
  it("covers every country once, ranked by births", () => {
    expect(rows.length).toBe(217);
    expect(new Set(rows.map((r) => r.iso3)).size).toBe(217);
    expect(rows[0].iso2).toBe("IN");
    for (let i = 1; i < rows.length; i++) expect(rows[i].births).toBeLessThanOrEqual(rows[i - 1].births);
  });
  it("shares add up to 100%", () => {
    expect(rows.reduce((s, r) => s + r.birthSharePct, 0)).toBeCloseTo(100, 1);
    expect(rows.reduce((s, r) => s + r.populationSharePct, 0)).toBeCloseTo(100, 1);
  });
  it("India is about one in six births (the figure quoted on the page and in launch copy)", () => {
    expect(rows[0].oneInNBirths).toBe(6);
  });
  it("CSV has a header and one line per country", () => {
    const lines = datasetCsv().trim().split("\n");
    expect(lines[0]).toBe(CSV_COLUMNS.join(","));
    expect(lines.length).toBe(218);
  });
});
