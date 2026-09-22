/**
 * 이집트 12신 달력 — 흔히 "이집트 별자리"라 부르는 것.
 *
 * **현대에 만들어진 체계다.** 고대 이집트가 실제로 쓴 것은 36개 데칸(별 무리)
 * 이고, 신 열둘에 날짜를 나눠 준 이 표는 20세기에 서양 12궁 틀에 이집트 신을
 * 얹어 만든 것이다. 화면에서도 그렇게 밝힌다.
 *
 * 표는 널리 실린 판본을 따른다(TheCollector, What's Your Sign — 2026-09-22 확인).
 * 두 판본이 다른 두 곳은 이렇게 정했다:
 *   - 나일 6월: 6/19–28 (6/12–18 은 세트와 겹친다)
 *   - 아문라 1월: 1/8–21 (1/8–12 면 1/13–21 이 빈다)
 * 이렇게 하면 1년의 모든 날이 정확히 한 신에게 간다(egyptian.test 가 확인).
 *
 * 2026-09-22 전 `ontology/egyptian` 의 표는 와제트·하토르·누트가 섞이고 나일·
 * 아문라·무트가 빠져 1년 중 약 60일이 라(Ra)로 떨어졌다. 그 모듈은 화면에
 * 쓰이지 않아 여기서 새로 정한다.
 */

export type EgyptianDeityId =
  | "nile" | "amun-ra" | "mut" | "geb" | "osiris" | "isis"
  | "thoth" | "horus" | "anubis" | "seth" | "bastet" | "sekhmet";

type Range = readonly [startMonth: number, startDay: number, endMonth: number, endDay: number];

export const EGYPTIAN_TABLE: ReadonlyArray<{ id: EgyptianDeityId; ranges: Range[] }> = [
  { id: "nile", ranges: [[1, 1, 1, 7], [6, 19, 6, 28], [9, 1, 9, 7], [11, 18, 11, 26]] },
  { id: "amun-ra", ranges: [[1, 8, 1, 21], [2, 1, 2, 11]] },
  { id: "mut", ranges: [[1, 22, 1, 31], [9, 8, 9, 22]] },
  { id: "geb", ranges: [[2, 12, 2, 29], [8, 20, 8, 31]] },
  { id: "osiris", ranges: [[3, 1, 3, 10], [11, 27, 12, 18]] },
  { id: "isis", ranges: [[3, 11, 3, 31], [10, 18, 10, 29], [12, 19, 12, 31]] },
  { id: "thoth", ranges: [[4, 1, 4, 19], [11, 8, 11, 17]] },
  { id: "horus", ranges: [[4, 20, 5, 7], [8, 12, 8, 19]] },
  { id: "anubis", ranges: [[5, 8, 5, 27], [6, 29, 7, 13]] },
  { id: "seth", ranges: [[5, 28, 6, 18], [9, 28, 10, 2]] },
  { id: "bastet", ranges: [[7, 14, 7, 28], [9, 23, 9, 27], [10, 3, 10, 17]] },
  { id: "sekhmet", ranges: [[7, 29, 8, 11], [10, 30, 11, 7]] },
];

const inRange = (m: number, d: number, [sm, sd, em, ed]: Range) => {
  const v = m * 100 + d;
  return v >= sm * 100 + sd && v <= em * 100 + ed;
};

/** 달력 날짜(YYYY-MM-DD)의 수호신. 날짜만 쓰므로 시각·장소가 필요 없다. */
export function egyptianDeityOf(civilDate: string): EgyptianDeityId {
  const [, m, d] = civilDate.split("-").map(Number);
  const hit = EGYPTIAN_TABLE.find((row) => row.ranges.some((r) => inRange(m, d, r)));
  if (!hit) throw new RangeError(`No Egyptian deity for ${civilDate}`); // 표가 온전하면 닿지 않는다
  return hit.id;
}

export const EGYPTIAN_IDS: EgyptianDeityId[] = EGYPTIAN_TABLE.map((row) => row.id);

export function isEgyptianDeityId(value: unknown): value is EgyptianDeityId {
  return typeof value === "string" && (EGYPTIAN_IDS as string[]).includes(value);
}
