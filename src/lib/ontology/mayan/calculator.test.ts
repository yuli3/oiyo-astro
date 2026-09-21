import { describe, expect, it } from "vitest";
import { calculateMayanKin } from "./calculator";

/**
 * 킨은 달력 날짜만으로 정해진다. 보는 사람의 시간대나 서머타임이 끼어들면
 * 같은 생일인데 다른 킨이 나온다.
 *
 * 2026-09-21: 실제로 그랬다. 기준일을 모듈 로드 때 로컬 Date 로 굳혀 두고
 * 대상 날짜와 밀리초를 빼서 나눴기 때문에, 프로세스 안에서 TZ 가 바뀌면
 * 하루가 밀렸다(CI 에서 seal 7·tone 3 이 seal 6·tone 2 로 나왔다).
 */
function withTz<T>(tz: string, run: () => T): T {
  const original = process.env.TZ;
  try {
    process.env.TZ = tz;
    return run();
  } finally {
    process.env.TZ = original;
  }
}

const ZONES = ["UTC", "America/New_York", "Asia/Seoul", "Pacific/Kiritimati", "Pacific/Midway"];

describe("마야 킨", () => {
  it("시간대가 달라도 같은 날짜는 같은 킨을 준다", () => {
    for (const [y, m, d] of [[2002, 9, 1], [1988, 7, 15], [2007, 3, 24], [1995, 12, 3]]) {
      const seen = ZONES.map((tz) =>
        withTz(tz, () => {
          const kin = calculateMayanKin(new Date(y, m - 1, d));
          return `${kin?.kinNumber}/${kin?.seal.id}/${kin?.tone.number}`;
        }),
      );
      expect(new Set(seen).size, `${y}-${m}-${d} → ${seen.join(" ")}`).toBe(1);
    }
  });

  it("서머타임 전환일 앞뒤로 하루씩만 움직인다", () => {
    // 로컬 자정끼리 빼면 이 구간이 23시간·25시간이 되어 floor 가 어긋났다.
    withTz("America/New_York", () => {
      const before = calculateMayanKin(new Date(2024, 2, 9))!;
      const during = calculateMayanKin(new Date(2024, 2, 10))!;
      const after = calculateMayanKin(new Date(2024, 2, 11))!;
      const step = (a: number, b: number) => ((b - a) % 260 + 260) % 260;
      expect(step(before.kinNumber, during.kinNumber)).toBe(1);
      expect(step(during.kinNumber, after.kinNumber)).toBe(1);
    });
  });

  it("기준일은 킨 34 다", () => {
    expect(calculateMayanKin(new Date(1987, 6, 26))?.kinNumber).toBe(34);
  });
});
