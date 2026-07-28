import { describe, expect, it } from "vitest";
import { formatClock, parseClock, sleepSchedule } from "./sleep-schedule";

describe("sleep schedule", () => {
  it("parses and formats 24-hour clocks without a date or timezone", () => {
    expect(parseClock("07:00")).toBe(420);
    expect(parseClock("24:00")).toBeNull();
    expect(parseClock("7:00")).toBeNull();
    expect(formatClock(-30)).toBe("23:30");
  });

  it("calculates bedtime references from a wake time across midnight", () => {
    expect(sleepSchedule("07:00", "bedtime")?.map((entry) => entry.time)).toEqual(["00:00", "23:30", "23:00", "22:30", "22:00"]);
  });

  it("calculates wake references from a bedtime", () => {
    expect(sleepSchedule("23:00", "wake")?.map((entry) => entry.time)).toEqual(["06:00", "06:30", "07:00", "07:30", "08:00"]);
  });
});
