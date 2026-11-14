import { describe, expect, it } from "vitest";
import { getSolarPosition } from "./CelestialClock";

// Dates sit two or more days inside each term so the check does not depend on the exact hour a term begins.
const cases: Array<[string, string]> = [
  ["2026-03-23T03:00:00Z", "춘분"],
  ["2026-06-24T03:00:00Z", "하지"],
  ["2026-07-10T03:00:00Z", "소서"],
  ["2026-09-26T03:00:00Z", "추분"],
  ["2026-10-07T03:00:00Z", "추분"],
  ["2026-10-11T03:00:00Z", "한로"],
  ["2026-12-24T03:00:00Z", "동지"],
  ["2027-01-08T03:00:00Z", "소한"],
  ["2027-02-07T03:00:00Z", "입춘"],
];

describe("getSolarPosition solar term", () => {
  it.each(cases)("%s is %s", (iso, term) => {
    expect(getSolarPosition(new Date(iso)).jieqi).toBe(term);
  });
});
