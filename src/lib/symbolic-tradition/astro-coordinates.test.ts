import { describe, expect, it } from "vitest";

import { computeNatalChart } from "@/lib/ontology/natal/calculator";
import { CITIES } from "@/lib/ontology/natal/signs";

import { astroCoordinates, isAstroCoordinates, signOfLongitude } from "./astro-coordinates";
import { comparisonFromCivil } from "./circle-input";
import { isSymbolicGroupParticipant } from "./group-snapshot";

const seoul = CITIES.find((c) => c.id === "seoul")!;

describe("별자리 좌표 — natal 엔진과 같은 하늘", () => {
  it("시각과 도시가 있으면 해·달·상승이 natal 차트와 같다", () => {
    const astro = astroCoordinates({ civilDate: "1990-05-17", civilTime: "14:30", utcOffsetMinutes: 540, latitude: seoul.lat, longitude: seoul.lon });
    const chart = computeNatalChart({ date: new Date(Date.UTC(1990, 4, 17, 5, 30)), latitude: seoul.lat, longitude: seoul.lon });
    expect(Math.abs(astro.sun - chart.sun.longitude)).toBeLessThanOrEqual(0.5 + 1e-9);
    expect(astro.moon).toEqual([chart.moon.sign]);
    expect(astro.ascendant).toBe(chart.ascendant.sign);
  });

  it("시각을 모르면 상승궁을 만들지 않고, 달 후보에 그날의 실제 달이 들어 있다", () => {
    for (let d = 0; d < 120; d += 1) {
      const date = new Date(Date.UTC(1985, 0, 1) + d * 86_400_000).toISOString().slice(0, 10);
      const astro = astroCoordinates({ civilDate: date, civilTime: null, utcOffsetMinutes: 540, latitude: seoul.lat, longitude: seoul.lon });
      expect(astro.ascendant).toBeNull();
      for (const hh of ["00:00", "08:00", "16:00", "23:59"]) {
        const exact = astroCoordinates({ civilDate: date, civilTime: hh, utcOffsetMinutes: 540, latitude: null, longitude: null });
        expect(astro.moon, `${date} ${hh}`).toContain(exact.moon[0]);
      }
    }
  });

  it("상승궁은 도(度)가 아니라 궁 이름만 싣는다 — 출생 시각을 분 단위로 드러내지 않는다", () => {
    const astro = comparisonFromCivil({ date: "1990-05-17", time: "14:30", city: seoul }, { astro: true }).astro!;
    expect(typeof astro.ascendant).toBe("string");
    expect(astro.moon.every((m) => typeof m === "string")).toBe(true);
    expect(Number.isInteger(astro.sun)).toBe(true);
  });

  it("태양 황경의 궁이 태양궁 표와 거의 늘 같다 (경계일만 다를 수 있다)", () => {
    let mismatch = 0;
    let days = 0;
    for (let d = 0; d < 7305; d += 3) {
      const date = new Date(Date.UTC(1960, 0, 1) + d * 86_400_000).toISOString().slice(0, 10);
      const p = comparisonFromCivil({ date }, { astro: true });
      days += 1;
      if (signOfLongitude(p.astro!.sun) !== p.sunSign.sign) mismatch += 1;
    }
    expect(mismatch / days).toBeLessThan(0.02);
  });

  it("astro 를 청하지 않으면 셈하지 않는다 — 오늘을 참가자로 만들 때는 필요 없다", () => {
    expect(comparisonFromCivil({ date: "2026-09-22" }).astro).toBeUndefined();
  });
});

describe("별자리 좌표 — 저장·공유된 값 검사", () => {
  const base = comparisonFromCivil({ date: "1990-05-17" });

  it("옛 참가자(별자리 좌표 없음)도 그대로 받는다", () => {
    expect(isSymbolicGroupParticipant({ id: "a", label: "A", profile: base })).toBe(true);
  });

  it("모양이 틀린 별자리 좌표는 거른다", () => {
    for (const astro of [{ sun: 400, moon: ["leo"], ascendant: null }, { sun: 10.5, moon: ["leo"], ascendant: null }, { sun: 10, moon: [], ascendant: null }, { sun: 10, moon: ["pluto"], ascendant: null }, { sun: 10, moon: ["leo"], ascendant: "x" }]) {
      expect(isAstroCoordinates(astro)).toBe(false);
      expect(isSymbolicGroupParticipant({ id: "a", label: "A", profile: { ...base, astro } })).toBe(false);
    }
    expect(isAstroCoordinates({ sun: 10, moon: ["leo", "virgo"], ascendant: null })).toBe(true);
  });
});
