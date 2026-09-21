/**
 * 운세 점수의 뼈대 — 그날과 그 사람의 실제 관계.
 *
 * 2026-09-22 까지 /오늘 의 점수(총운·애정·금전·직장·건강)는 생년월일을 해시
 * 시드로만 쓰는 밸류 노이즈였다. 결정론적이고 흐름은 매끄러웠지만, 숫자가
 * 사주를 반영하지는 않았다. 세운 결정(1안): 관계를 뼈대로, 노이즈는 결로.
 *
 * 여기서 뼈대를 만든다. "오늘도 참가자"(group-today.ts)와 같은 원리다 —
 * 그날의 좌표와 사람의 좌표를 compareSymbolicProfiles 에 넣으면 아홉 렌즈가
 * 나오고, 렌즈마다의 harmonyIndex 를 그 렌즈 자신의 폭으로 0~1 로 편 다음,
 * 축마다 관련 렌즈를 평균한다.
 *
 * 점수 엔진(lib/fortune/score.ts)은 이 파일을 모른다. 호출자가 앵커 함수를
 * 넘길 때만 섞는다 — 생년월일이 없는 랜딩의 띠·별자리 벽은 예전과 똑같다.
 */
import { comparisonFromCivil } from "./circle-input";
import { compareSymbolicProfiles, HARMONY_INDEX_TABLE } from "./index";
import type { CompatibilityLensId, SymbolicComparisonProfile } from "./types";

export type FortuneAxis = "overall" | "love" | "money" | "work" | "health";
export type FortunePeriod = "today" | "weekly" | "monthly" | "yearly";
/** 축별 0~1. 0.5 가 보통이다. */
export type AxisAnchors = Record<FortuneAxis, number>;

/**
 * 축과 렌즈의 대응. 전통에 근거가 있는 쪽으로 묶었지만 **설계 선택**이다.
 *
 *   애정  음양의 맞물림, 태양궁, 지지 합·충, 켈트 계절 — 결과 리듬이 맞는가
 *   금전  오행 생극, 오행 보완, 마야 — 무엇이 들어오고 채워지는가
 *   직장  일간 관계, 띠, 오행 생극 — 자기 기질과 그날의 힘이 맞서는가 받치는가
 *   건강  음양, 오행 보완, 일간, 켈트 계절 — 균형과 부족
 *   총운  아홉 전부
 *
 * 축마다 다른 렌즈를 쓰는 이유는 다섯 축이 나란히 움직이지 않게 하기 위해서다
 * (score.ts 의 보조 파동과 같은 목적). 같은 렌즈를 쓰면 다섯 막대가 늘 같이
 * 오르내린다.
 */
const AXIS_LENSES: Record<FortuneAxis, CompatibilityLensId[]> = {
  overall: [
    "five-elements", "yin-yang", "chinese-zodiac", "sun-sign", "element-complement",
    "day-master", "branch-harmony", "mayan-kin", "celtic-tree",
  ],
  love: ["yin-yang", "sun-sign", "branch-harmony", "celtic-tree"],
  money: ["five-elements", "element-complement", "mayan-kin"],
  work: ["day-master", "chinese-zodiac", "five-elements"],
  health: ["yin-yang", "element-complement", "day-master", "celtic-tree"],
};

const AXES: FortuneAxis[] = ["overall", "love", "money", "work", "health"];

/** 렌즈 하나의 값을 그 렌즈 자신의 폭으로 0~1 로 편다. */
function normalize(id: CompatibilityLensId, harmonyIndex: number): number {
  const band = Object.values(HARMONY_INDEX_TABLE[id]);
  const low = Math.min(...band);
  const high = Math.max(...band);
  return high === low ? 0.5 : (harmonyIndex - low) / (high - low);
}

/** 그날 하루와 그 사람의 축별 앵커. */
export function dayAnchors(person: SymbolicComparisonProfile, day: SymbolicComparisonProfile): AxisAnchors {
  const lenses = compareSymbolicProfiles(person, day).lenses;
  const value = new Map(lenses.map((lens) => [lens.id, normalize(lens.id, lens.harmonyIndex)]));
  const out = {} as AxisAnchors;
  for (const axis of AXES) {
    const picked = AXIS_LENSES[axis].map((id) => value.get(id) ?? 0.5);
    out[axis] = picked.reduce((sum, v) => sum + v, 0) / picked.length;
  }
  return out;
}

/** 점수 엔진과 같은 기준의 그날 — UTC 달력 필드. 어긋나면 뼈대와 결이 다른 날을 말한다. */
function civilOf(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

/**
 * 주기 하나를 대표하는 날들. 주간·월간·연간은 하루로 대표할 수 없으므로
 * 고르게 몇 날을 뽑아 평균한다.
 */
function sampleDays(period: FortunePeriod, d: Date): string[] {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  if (period === "today") return [civilOf(d)];
  if (period === "weekly") {
    return [-3, -2, -1, 0, 1, 2, 3].map((o) => civilOf(new Date(Date.UTC(y, m, d.getUTCDate() + o))));
  }
  if (period === "monthly") {
    const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const out: string[] = [];
    for (let day = 1; day <= last; day += 4) out.push(civilOf(new Date(Date.UTC(y, m, day))));
    return out;
  }
  return Array.from({ length: 12 }, (_, month) => civilOf(new Date(Date.UTC(y, month, 15))));
}

/**
 * 한 사람에 대한 앵커 함수를 만든다. 점수 엔진의 scores/flow/delta 에 그대로
 * 넘긴다. 그날의 좌표는 순수 함수라 날짜별로 캐시한다 — 월간·연간 흐름은
 * 같은 날을 여러 번 묻는다.
 */
export function makeFortuneAnchor(
  person: SymbolicComparisonProfile,
): (period: FortunePeriod, d: Date) => AxisAnchors {
  const dayCache = new Map<string, AxisAnchors>();
  const anchorOfDay = (civil: string) => {
    let hit = dayCache.get(civil);
    if (!hit) {
      hit = dayAnchors(person, comparisonFromCivil({ date: civil }));
      dayCache.set(civil, hit);
    }
    return hit;
  };
  return (period, d) => {
    const days = sampleDays(period, d).map(anchorOfDay);
    const out = {} as AxisAnchors;
    for (const axis of AXES) out[axis] = days.reduce((sum, a) => sum + a[axis], 0) / days.length;
    return out;
  };
}
