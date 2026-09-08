import { describe, expect, it } from "vitest";
import {
  consecutiveStreak,
  localDay,
  parseDailyLog,
  recordToday,
} from "./daily-log";

describe("localDay", () => {
  it("pads month and day", () => {
    expect(localDay(new Date(2026, 8, 8))).toBe("2026-09-08");
  });
});

describe("recordToday", () => {
  it("is idempotent for the same day", () => {
    const once = recordToday(["2026-09-07"], "2026-09-08");
    expect(recordToday(once, "2026-09-08")).toEqual(["2026-09-07", "2026-09-08"]);
  });

  it("drops invalid entries and keeps the newest cap", () => {
    expect(recordToday(["nope", "2026-09-01"], "2026-09-08", 1)).toEqual(["2026-09-08"]);
  });
});

describe("consecutiveStreak", () => {
  it("is 0 when today is missing", () => {
    expect(consecutiveStreak(["2026-09-07"], "2026-09-08")).toBe(0);
  });

  it("counts contiguous days ending today", () => {
    expect(consecutiveStreak(["2026-09-06", "2026-09-07", "2026-09-08"], "2026-09-08")).toBe(3);
  });

  it("stops at a gap", () => {
    expect(consecutiveStreak(["2026-09-05", "2026-09-07", "2026-09-08"], "2026-09-08")).toBe(2);
  });
});

describe("parseDailyLog", () => {
  it("fails closed on junk", () => {
    expect(parseDailyLog("{")).toEqual({ days: [] });
    expect(parseDailyLog('{"days":[1,"2026-09-08"]}')).toEqual({ days: ["2026-09-08"] });
  });
});
