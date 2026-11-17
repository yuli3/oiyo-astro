import { describe, expect, it } from "vitest";
import { seededRandom } from "./past-life-1426";
import {
  JOBS, STATUSES, STATUS_SHARE, ageFromBirthday, compare1789, draw1789, format1789, ganzhi, hanjaNumber,
  parse1789, registerLine, registerName, share1789, type Life1789,
} from "./joseon-1789";

const base: Life1789 = { status: "yangban", sex: "m", job: "yuhak", age: 35, surname: 0, bon: 0, given: 0, mark: null, household: 3, spouse: true, kids: 2 };

describe("joseon 1789 register", () => {
  it("status shares sum to 1", () => {
    expect(STATUSES.reduce((s, x) => s + STATUS_SHARE[x], 0)).toBeCloseTo(1, 10);
  });
  it("job shares sum to the status share for each sex", () => {
    for (const status of STATUSES) for (const sex of ["f", "m"] as const) {
      const sum = JOBS[status][sex].reduce((s, j) => s + share1789({ status, sex, job: j.id }), 0);
      expect(sum).toBeCloseTo(STATUS_SHARE[status], 10);
    }
  });
  it("writes ages and years like the registers", () => {
    expect([1, 10, 11, 20, 35, 99].map(hanjaNumber)).toEqual(["一", "十", "十一", "二十", "三十五", "九十九"]);
    expect(ganzhi(1784)).toBe("甲辰");
    expect(ganzhi(1789)).toBe("己酉");
  });
  it("builds the register line", () => {
    expect(registerLine(base)).toBe("第三戶 幼學 金致遠 年三十五 甲戌生 本金海");
    expect(registerLine({ ...base, status: "nobi", sex: "f", job: "sabi", given: 1 })).toBe("第三戶 私婢 春梅 年三十五 甲戌生");
    expect(registerLine({ ...base, age: 9 })).toContain(" 子 ");
  });
  it("leaves yangban and commoner women unnamed and names slave women", () => {
    expect(registerName({ ...base, sex: "f", job: "cheo", given: -1 })).toEqual({ hanja: "金氏", ko: "김씨", named: false });
    expect(registerName({ ...base, status: "sangmin", sex: "f", job: "cheo", given: -1, mark: "soshi" }).hanja).toBe("金召史");
    expect(registerName({ ...base, status: "sangmin", sex: "f", job: "cheo", given: -1, mark: "seong" }).hanja).toBe("金姓");
    expect(registerName({ ...base, status: "nobi", sex: "f", job: "sabi", given: 0 }).named).toBe(true);
  });
  it("keeps the user's sex and age", () => {
    for (let i = 0; i < 50; i += 1) {
      const life = draw1789({ sex: "f", age: 41 }, seededRandom(`t${i}`));
      expect(life.sex).toBe("f");
      expect(life.age).toBe(41);
      expect(parse1789(format1789(life))).toEqual(life);
    }
  });
  it("round-trips random draws and rejects junk", () => {
    for (let i = 0; i < 200; i += 1) {
      const life = draw1789({}, seededRandom(`r${i}`));
      expect(parse1789(format1789(life))).toEqual(life);
    }
    expect(parse1789("s=k&x=m&j=yuhak&a=30&n=0.0.0&h=1&k=0.0")).toBeNull();
    expect(parse1789("s=y&x=m&j=sano&a=30&n=0.0.0&h=1&k=0.0")).toBeNull();
    expect(parse1789("s=y&x=f&j=cheo&a=30&n=0.0.2&h=1&k=0.0")).toBeNull();
    expect(parse1789("s=y&x=m&j=yuhak&a=300&n=0.0.0&h=1&k=0.0")).toBeNull();
  });
  it("keeps family consistent with the register title", () => {
    for (let i = 0; i < 500; i += 1) {
      const life = draw1789({}, seededRandom(`f${i}`));
      if (life.job === "cheo" && life.age >= 16) expect(life.spouse).toBe(true);
      if (life.job === "gwabu" || life.job === "gwanyeo") expect(life.spouse).toBe(false);
      if (!life.spouse && life.job !== "gwabu" && life.job !== "gwanyeo") expect(life.kids).toBe(0);
    }
  });
  it("computes age from a birthday", () => {
    expect(ageFromBirthday("1990-11-14", new Date("2026-11-13T00:00:00Z"))).toBe(35);
    expect(ageFromBirthday("1990-11-13", new Date("2026-11-13T00:00:00Z"))).toBe(36);
  });
  it("orders status for friend comparison", () => {
    expect(compare1789(base, { ...base, status: "nobi" })).toBe("me");
    expect(compare1789({ ...base, status: "sangmin" }, base)).toBe("friend");
    expect(compare1789(base, base)).toBe("same");
  });
});
