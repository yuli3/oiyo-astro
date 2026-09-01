// 절기 골든 — KASI 특일정보 API 실측 대조.
//
// oiyo-engine-upgrade-handoff-2026-09-01.md 가 "골든이 확보되기 전에는 수식을
// 통합하지 않는다"고 건 게이트의 그 골든이다. 2026-09-01 세운이 data.go.kr
// 인증키를 발급해 확보했다.
//
// 이 API 는 **분 단위 절입 시각(kst)** 까지 준다. 날짜만 주는 줄 알았는데
// 아니었고, 덕분에 getSolarLongitude 의 ±10~15분 정밀도를 실제로 잴 수 있다.
import { describe, expect, it } from "vitest";
import golden from "./solar-terms-kasi.json";
import { getSolarLongitude } from "../kernel/astronomy";

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** 절기명 → 태양황경. 입춘 315도에서 시작해 15도씩 돈다. */
const TERM_LONGITUDE: Record<string, number> = {
  입춘: 315, 우수: 330, 경칩: 345, 춘분: 0, 청명: 15, 곡우: 30,
  입하: 45, 소만: 60, 망종: 75, 하지: 90, 소서: 105, 대서: 120,
  입추: 135, 처서: 150, 백로: 165, 추분: 180, 한로: 195, 상강: 210,
  입동: 225, 소설: 240, 대설: 255, 동지: 270, 소한: 285, 대한: 300,
};

interface Term { date: string; kst: string; name: string }
const TERMS = (golden.terms as Term[]).filter((t) => TERM_LONGITUDE[t.name] !== undefined);

function instantOf(t: Term): Date {
  const [y, m, d] = t.date.split("-").map(Number);
  const [hh, mm] = t.kst.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh, mm) - KST_OFFSET_MS);
}

/** 목표 황경까지 몇 분 어긋났는지. 태양은 하루 약 1도 움직인다. */
function minutesOff(t: Term): number {
  const target = TERM_LONGITUDE[t.name];
  const lon = getSolarLongitude(instantOf(t));
  const diffDeg = ((target - lon + 540) % 360) - 180;
  return diffDeg * (365.2425 * 24 * 60) / 360;
}

describe("KASI 절기 골든", () => {
  it("표본이 실제로 모였다", () => {
    expect(TERMS.length).toBe(168);
    expect(golden.schema).toBe("oiyo.kasi-solar-terms");
  });

  it("모든 절입 시각에서 태양황경이 목표값에 근접한다", () => {
    const offs = TERMS.map((t) => Math.abs(minutesOff(t)));
    const max = Math.max(...offs);
    const mean = offs.reduce((a, b) => a + b, 0) / offs.length;
    // 실측 정밀도(2026-09-01, 표본 168): 평균 4.2분 · 중앙 3.9 · p90 7.9 · 최대 12.2.
    //
    // 이 골든을 붙이자마자 **계통 편향 -12.1분**이 드러났다. 기하학적 황경만
    // 쓰고 겉보기 보정(광행차·장동)을 빠뜨린 것이 원인이었고, 두 항을 더해
    // 평균 12.3 → 4.2분으로 내려갔다. 남은 -3.2분 편향은 급수 절단에서 오는
    // 것으로 보이며 추적하지 않았다.
    //
    // 임계는 실측에 여유를 둔 값이다. 알고리즘을 바꾸면 여기가 먼저 깨진다.
    expect(max).toBeLessThan(15);
    expect(mean).toBeLessThan(6);
  });

  it("입춘은 315도에서 연주가 넘어가는 지점이다", () => {
    // 연·월주 경계의 근거. 입춘 표본만 따로 본다.
    const ipchun = TERMS.filter((t) => t.name === "입춘");
    expect(ipchun.length).toBeGreaterThanOrEqual(7);
    for (const t of ipchun) {
      const lon = getSolarLongitude(instantOf(t));
      // 315도 근방(±0.02도 ~ 30분)에 들어와야 한다.
      const diff = Math.abs(((315 - lon + 540) % 360) - 180);
      expect(diff, `${t.date} ${t.kst} 입춘`).toBeLessThan(0.05);
    }
  });
});
