/**
 * 도구 화면이 실제로 타는 사슬을 끝에서 끝까지 확인한다.
 *
 * TalismanTool 은 출생 기록 → 사주 해석 → 부적 읽기값 → SVG 순으로 넘긴다.
 * 화면 조작(도시 콤보박스 등)은 다른 도구와 같은 공용 컴포넌트를 쓰므로,
 * 여기서는 이 도구만의 연결부 — 사주의 weakElement 가 부적까지 흘러가고
 * 판이 실제로 그려지는지 — 를 잠근다.
 */
import { describe, it, expect } from "vitest";
import { calculateBirthSaju } from "../ontology/saju/birth-contract";
import { analyzeSaju } from "../ontology/saju/logic";
import { createBirthRecord, resolveBirthLocation } from "../user/birth-record";
import { CITIES } from "../ontology/natal/signs";
import { readingFromBirth } from "./sources";
import { drawTalisman } from "./draw";

function pipeline(civilDate: string, civilTime: string, cityId: string) {
  const city = CITIES.find((c) => c.id === cityId);
  if (!city) throw new Error(`no city ${cityId}`);
  const location = resolveBirthLocation({
    civilDate,
    civilTime,
    longitude: city.lon,
    zoneId: city.zoneId,
  });
  expect(location.status, "출생지 해석").toBe("resolved");
  if (location.status !== "resolved") throw new Error("unresolved");

  const record = createBirthRecord({ civilDate, civilTime, ...location.location });
  const resolution = calculateBirthSaju(record);
  expect(resolution.status, "사주 해석").toBe("resolved");
  if (resolution.status !== "resolved" || !resolution.standard.hour) throw new Error("no hour");

  const analysis = analyzeSaju({
    birthDate: resolution.instant,
    day: resolution.standard.day,
    dayMaster: resolution.standard.day.heavenlyStem,
    gender: "male",
    hour: resolution.standard.hour,
    isLunar: false,
    month: resolution.standard.month,
    year: resolution.standard.year,
  });

  const [y, m, d] = civilDate.split("-").map(Number);
  const reading = readingFromBirth({
    date: new Date(y, m - 1, d),
    hour: Number(civilTime.slice(0, 2)),
    element: analysis.weakElement,
  });
  return { analysis, reading, svg: drawTalisman(reading) };
}

describe("부적 도구 — 입력에서 판까지", () => {
  it("서울 출생 기록이 부적 한 장까지 끊기지 않고 간다", () => {
    const { analysis, reading, svg } = pipeline("2002-09-01", "09:00", "seoul");
    // 사주가 고른 보완 오행이 그대로 부적의 오행이어야 한다.
    expect(reading.element).toBe(analysis.weakElement);
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).not.toContain("NaN");
    // 네 기둥 여덟 자가 판에 올라간다.
    for (const gz of reading.pillars) {
      for (const ch of gz) expect(svg).toContain(`>${ch}</text>`);
    }
  });

  it("여러 도시·시각에서도 판이 깨지지 않는다", () => {
    const cases: [string, string, string][] = [
      ["1988-07-15", "22:00", "seoul"],
      ["1995-12-03", "05:00", "newyork"],
      ["2007-03-24", "14:00", "london"],
    ].filter(([, , id]) => CITIES.some((c) => c.id === id)) as [string, string, string][];
    expect(cases.length, "테스트할 도시가 하나도 없으면 이 테스트는 무의미하다").toBeGreaterThan(0);
    for (const [date, time, city] of cases) {
      const { svg } = pipeline(date, time, city);
      expect(svg, `${date} ${city}`).not.toContain("NaN");
      expect(svg.endsWith("</svg>")).toBe(true);
    }
  });

  it("같은 입력은 언제나 같은 부적을 준다", () => {
    expect(pipeline("2002-09-01", "09:00", "seoul").svg).toBe(
      pipeline("2002-09-01", "09:00", "seoul").svg,
    );
  });
});
