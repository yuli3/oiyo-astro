import { describe, expect, it } from "vitest";

import { civilDateString, civilDay, periodKey, stepIndex } from "./periodic";

/**
 * "오늘"은 보는 사람의 로컬 날짜다.
 *
 * 2026-09-22: 운세 엔진이 UTC 날짜 필드를 오늘로 썼다. 한국에서는 자정부터
 * 오전 9시까지 어제 운세가 떴다(그날 오전 화면이 9-21 이었다).
 */
function inZone<T>(tz: string, run: () => T): T {
  const original = process.env.TZ;
  try {
    process.env.TZ = tz;
    return run();
  } finally {
    process.env.TZ = original;
  }
}

// 한국 2026-09-22 00:30 = UTC 2026-09-21 15:30
const KOREAN_DAWN = new Date(Date.UTC(2026, 8, 21, 15, 30));

describe("운세의 오늘 — 로컬 날짜", () => {
  it("한국 새벽에도 오늘은 그날이다", () => {
    inZone("Asia/Seoul", () => {
      expect(periodKey("today", civilDay(KOREAN_DAWN))).toBe("2026-9-22");
      expect(civilDateString(KOREAN_DAWN)).toBe("2026-09-22");
    });
  });

  it("그대로 넘기면 어제가 된다 — 고치기 전의 증상", () => {
    // 이 단언이 깨지면 엔진 내부가 로컬 필드를 읽기 시작한 것이다. 그러면
    // civilDay 를 두 번 적용하는 셈이 되어 서반구에서 하루가 밀린다.
    inZone("Asia/Seoul", () => {
      expect(periodKey("today", KOREAN_DAWN)).toBe("2026-9-21");
    });
  });

  it("서반구에서도 로컬 날짜를 지킨다", () => {
    // 뉴욕 2026-09-21 21:00 = UTC 2026-09-22 01:00 — UTC 로는 이미 다음 날이다.
    const nyEvening = new Date(Date.UTC(2026, 8, 22, 1, 0));
    inZone("America/New_York", () => {
      expect(periodKey("today", civilDay(nyEvening))).toBe("2026-9-21");
    });
  });

  it("한 날의 모든 시각이 같은 순번을 받는다", () => {
    inZone("Asia/Seoul", () => {
      const steps = new Set(
        [0, 1, 8, 9, 12, 23].map((hour) => stepIndex("today", civilDay(new Date(2026, 8, 22, hour, 30)))),
      );
      expect(steps.size).toBe(1);
    });
  });
});
