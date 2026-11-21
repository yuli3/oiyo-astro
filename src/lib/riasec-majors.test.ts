import { describe, expect, it } from "vitest";
import { MAJOR_GROUPS, RIASEC, rankMajors } from "./riasec-majors";

describe("riasec majors", () => {
  it("every code reaches at least two fields", () => {
    for (const c of RIASEC) expect(MAJOR_GROUPS.filter((g) => g.codes.includes(c)).length).toBeGreaterThanOrEqual(2);
  });
  it("I+C puts 컴퓨터·데이터 first, R+I puts 공학 first", () => {
    expect(rankMajors("I", "C")[0].field).toBe("컴퓨터·데이터");
    expect(rankMajors("R", "I")[0].field).toBe("공학");
  });
  it("first code outweighs second", () => {
    expect(rankMajors("E", "C")[0].field).toBe("경영·경제");
    expect(rankMajors("C", "E")[0].field).toBe("회계·금융");
  });
});
