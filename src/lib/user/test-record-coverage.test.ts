import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";

const DIR = new URL("../../components/tests/", import.meta.url);

describe("every test records a finished result", () => {
  it("imports recordTestResult or useRecordFinishedTest", () => {
    const files = readdirSync(DIR)
      .filter((name) => name.endsWith(".tsx") && !name.includes(".test."));
    const missing = files.filter((name) => {
      const src = readFileSync(new URL(name, DIR), "utf8");
      return !src.includes("recordTestResult") && !src.includes("useRecordFinishedTest");
    });
    expect(missing).toEqual([]);
  });
});
