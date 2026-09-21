/**
 * 오늘의 우리 — 모임의 오늘 컨디션.
 *
 * 우리 기운은 생년월일에서 나오는 고정 좌표라 "우리는 이런 모임"이다.
 * 이쪽은 날마다 바뀌는 "오늘 우리가 모이면"이다. 두 층을 한 패널에 섞으면
 * "우리"가 매일 달라지는 것처럼 읽히므로 따로 둔다.
 *
 * ## 오늘도 참가자다
 *
 * 2026-09-21 처음 만들 때는 오늘의 일간에서 오행 하나만 뽑아 사람마다 생·극을
 * 따지는 전용 코드를 썼다. 그래서 일진 두 글자 중 지지를 버렸고, 사람도
 * 최빈 오행 하나로 뭉갰고, 렌즈 아홉이 쌓아 둔 것을 하나도 쓰지 못했다.
 *
 * 다시 보니 `comparisonFromCivil` 은 **출생일이 아니라 임의의 날짜**를 좌표로
 * 바꾼다. 오늘도 좌표를 가질 수 있다는 뜻이고, 그러면 오늘과 사람의 관계는
 * 사람과 사람의 관계와 같은 것이 된다 — 이미 있는 `compareSymbolicProfiles`
 * 가 그대로 답한다. 전용 코드가 사라지고 지지 합·충도, 오행 분포 전체도,
 * 마야·켈트도 공짜로 따라온다.
 *
 * 바이오리듬을 쓰지 않은 이유는 그대로다. 출생일로부터의 일수가 필요한데
 * 비교 프로필에는 생년월일이 없다 — 공유 링크가 원자료가 아니라 좌표만
 * 담도록 일부러 그렇게 설계돼 있다.
 *
 * 날짜를 인자로 받으므로 오늘만의 것이 아니다. 이번 주·이번 달도 같은 함수에
 * 다른 날짜를 넣으면 된다.
 */
import { BRANCHES } from "@/manifest/data/saju/branches";
import { STEMS } from "@/manifest/data/saju/stems";
import { FiveElement } from "../ontology/saju/types";
import { comparisonFromCivil, dayMasterElement } from "./circle-input";
import { compareSymbolicProfiles } from "./index";
import { GROUP_ELEMENT_ORDER, type GroupMember, type GroupSynthesis } from "./group-synthesis";
import type { SymbolicCompatibilityLens, SymbolicComparisonProfile } from "./types";

/** 상생 — 목생화 화생토 토생금 금생수 수생목. */
const GENERATES: Record<FiveElement, FiveElement> = {
  [FiveElement.WOOD]: FiveElement.FIRE,
  [FiveElement.FIRE]: FiveElement.EARTH,
  [FiveElement.EARTH]: FiveElement.METAL,
  [FiveElement.METAL]: FiveElement.WATER,
  [FiveElement.WATER]: FiveElement.WOOD,
};

/** 상극 — 목극토 토극수 수극화 화극금 금극목. */
const CONTROLS: Record<FiveElement, FiveElement> = {
  [FiveElement.WOOD]: FiveElement.EARTH,
  [FiveElement.EARTH]: FiveElement.WATER,
  [FiveElement.WATER]: FiveElement.FIRE,
  [FiveElement.FIRE]: FiveElement.METAL,
  [FiveElement.METAL]: FiveElement.WOOD,
};

/**
 * 오늘의 기운이 이 모임 전체에 어떻게 걸리는가. 이쪽은 쌍이 아니라 모임
 * 단위의 진술이라 렌즈가 답할 수 없다 — 모임의 분포와 오늘을 견준다.
 *
 *   fills-gap     모임에서 가장 얇은 자리를 오늘이 채운다
 *   eases-peak    모임에서 가장 두꺼운 기운을 오늘이 눌러 준다
 *   doubles-down  가장 두꺼운 쪽에 오늘이 더 얹는다
 *   feeds-peak    가장 두꺼운 기운을 오늘이 더 키운다(상생)
 *   neutral       그 밖
 *
 * 처음에는 "몰렸다·얇다"로 **판정된** 원소만 봤는데, 기저 비율을 바로잡은
 * 뒤로 그 판정이 드물어져 73.9% 가 neutral 이 됐다. 대부분의 날에 "별 작용
 * 없음"이라고 말하는 카드는 볼 이유가 없다. 그래서 판정 대신 모임 안에서
 * **상대적으로** 가장 두꺼운·얇은 기운을 쓴다.
 */
export type TodayEffect = "fills-gap" | "eases-peak" | "doubles-down" | "feeds-peak" | "neutral";

/**
 * 오늘 일간과 이 사람 일간의 관계 — 십성(十星)의 다섯 무리.
 *
 *   peer      비겁  오늘이 나와 같은 기운이다
 *   support   인성  오늘이 나를 생한다 — 받는 날
 *   output    식상  내가 오늘을 생한다 — 내주는 날
 *   pressure  관성  오늘이 나를 극한다 — 눌리는 날
 *   wealth    재성  내가 오늘을 극한다 — 다루는 날
 *
 * 2026-09-21 첫 버전은 비슷한 다섯 칸을 **최빈 원소** 기준으로 냈다. 명리에서
 * 사람을 대표하는 것은 일간이므로 일간 대 일간으로 다시 세웠다.
 */
export type TodayStance = "peer" | "support" | "output" | "pressure" | "wealth";

/**
 * 오늘 기운이 지금 계절에서 받는 힘 — 왕상휴수사(旺相休囚死).
 * 월지의 오행이 계절이고, 월지는 절기 기준으로 이미 계산돼 있다.
 *
 *   prosperous  旺  계절과 같다
 *   rising      相  계절이 생해 준다
 *   resting     休  계절을 생하느라 힘을 뺀다
 *   confined    囚  계절을 극하느라 묶인다
 *   dead        死  계절에 극을 당한다
 */
export type SeasonStrength = "prosperous" | "rising" | "resting" | "confined" | "dead";

export interface TodayMember {
  id: string;
  label: string;
  /** 이 사람의 일간 오행 */
  dayMaster: FiveElement;
  stance: TodayStance;
  /**
   * 오늘과 이 사람 사이에서 가장 두드러진 렌즈. 아홉을 다 보여 주면 읽히지
   * 않으므로 하나를 고른다. 고르는 법은 pickHighlight 에 있다.
   */
  highlight: SymbolicCompatibilityLens;
  /** 오늘과 이 사람의 아홉 관점 전부 */
  lenses: SymbolicCompatibilityLens[];
}

export interface GroupToday {
  /** 계산에 쓴 날짜 (YYYY-MM-DD, 달력 기준) */
  date: string;
  /** 오늘 기운이 계절에서 받는 힘 */
  season: { element: FiveElement; strength: SeasonStrength };
  /** 오늘 일간의 오행. 배지에 쓴다. */
  element: FiveElement;
  effect: TodayEffect;
  members: TodayMember[];
  /** 오늘의 좌표. 사람의 것과 같은 형식이다 — 오늘도 참가자이기 때문이다. */
  profile: SymbolicComparisonProfile;
}

/** 어떤 날짜든 그날의 좌표를 만든다. 달력 날짜만 쓰므로 시각·장소가 없어도 된다. */
export function profileOfDay(civilDate: string): SymbolicComparisonProfile {
  return comparisonFromCivil({ date: civilDate });
}

/** 그날 일간의 오행. 사람·날짜 공용 단일 출처를 그대로 쓴다. */
export const dayElementOf = dayMasterElement;

/**
 * 오늘 대 한 사람에서 각 관계가 나오는 빈도. 40,000쌍 실측이다
 * (group-today.test 가 다시 재서 어긋나면 실패한다).
 *
 * 왜 필요한가. 아홉 중 하나를 고를 때 harmonyIndex 의 크기나 값 폭으로
 * 고르면 안 된다. 처음에는 렌즈 자신의 폭으로 정규화해 가운데에서 가장 먼
 * 것을 골랐는데, 오행 렌즈가 하이라이트의 77.9% 를 먹었다. 관계가 셋뿐이고
 * 그중 둘이 양 극단이라 거의 항상 최댓값이 나오기 때문이다.
 *
 * "오늘 가장 할 말이 있는 관점"은 값이 큰 쪽이 아니라 **드문 쪽**이다.
 * 오늘 대부분의 사람에게 일어나는 일은 이 사람에 대해 아무것도 말해 주지
 * 않는다.
 */
const RELATION_RARITY: Record<string, Record<string, number>> = {
  "five-elements": { "generating-cycle": 0.4182, "controlling-cycle": 0.35, same: 0.2318 },
  "yin-yang": { "near-balance": 0.4924, "same-balance": 0.271, "contrasting-balance": 0.2366 },
  "chinese-zodiac": { distinct: 0.6635, "same-trine": 0.183, opposite: 0.0884, same: 0.065 },
  "sun-sign": { distinct: 0.5352, "same-modality": 0.2233, "same-element": 0.1671, "same-sign": 0.0744 },
  "element-complement": { "one-way-complement": 0.3873, "mutual-complement": 0.2673, "deep-mutual": 0.2661, "shared-gap": 0.0603, "no-gap": 0.0189 },
  "day-master": { controlling: 0.4057, generating: 0.3893, same: 0.205 },
  "branch-harmony": { mixed: 0.4189, "harmony-leaning": 0.2906, "harmony-rich": 0.1356, "clash-leaning": 0.1288, "clash-rich": 0.0261 },
  "mayan-kin": { "opposite-color": 0.2604, "near-color-near-tone": 0.2482, "near-color-far-tone": 0.202, "same-color-near-tone": 0.1545, "same-color-far-tone": 0.1348 },
  "celtic-tree": { distinct: 0.4622, "facing-season": 0.2682, "same-season": 0.2044, "same-tree": 0.0652 },
};

export function stanceOf(today: FiveElement, mine: FiveElement): TodayStance {
  if (today === mine) return "peer";
  if (GENERATES[today] === mine) return "support";
  if (GENERATES[mine] === today) return "output";
  if (CONTROLS[today] === mine) return "pressure";
  return "wealth";
}

export function seasonStrengthOf(element: FiveElement, season: FiveElement): SeasonStrength {
  if (element === season) return "prosperous";
  if (GENERATES[season] === element) return "rising";
  if (GENERATES[element] === season) return "resting";
  if (CONTROLS[element] === season) return "confined";
  return "dead";
}

/** 실측표를 테스트가 다시 잴 수 있도록 내보낸다. */
export const TODAY_RELATION_RARITY = RELATION_RARITY;

/**
 * 아홉 렌즈 중 오늘 가장 할 말이 있는 하나를 고른다 — 가장 드문 관계다.
 *
 * 표에 없는 관계는 새로 더해진 것이다. 그때는 가장 드문 것으로 쳐서 눈에
 * 띄게 한다 — 조용히 묻히면 표를 갱신해야 한다는 사실도 함께 묻힌다.
 */
export function pickHighlight(lenses: SymbolicCompatibilityLens[]): SymbolicCompatibilityLens {
  let best = lenses[0];
  let rarest = Number.POSITIVE_INFINITY;
  for (const lens of lenses) {
    const rate = RELATION_RARITY[lens.id]?.[lens.relation] ?? 0;
    // 같은 값이면 앞선 렌즈를 쓴다 — 순서가 고정이라 결과도 고정이다.
    if (rate < rarest) {
      best = lens;
      rarest = rate;
    }
  }
  return best;
}

/**
 * 모임에서 가장 두꺼운(또는 얇은) 기운들. **하나가 아니라 집합이다.**
 *
 * 처음에는 편차가 가장 큰 원소 하나를 골랐다. 그런데 1·2위가 사실상 동점인
 * 모임이 흔했다 — 2인 31%, 5인 20% 에서 차이가 0.25 표준편차 미만이었다.
 * 그때 "가장 센 기운"은 원소 배열 순서가 정하고 있었다. 근거 없는 단정이다.
 *
 * 그래서 최댓값에서 TIE_MARGIN 안에 드는 원소를 모두 묶는다. 셋 이상이
 * 엉켜 있으면 "센 쪽"이라고 부를 것이 없으므로 빈 집합을 돌려준다.
 */
const TIE_MARGIN = 0.25;
const MAX_EXTREME = 2;

function extremeSet(deviation: Record<FiveElement, number>, side: "high" | "low"): Set<FiveElement> {
  const values = GROUP_ELEMENT_ORDER.map((e) => deviation[e]);
  const edge = side === "high" ? Math.max(...values) : Math.min(...values);
  const picked = GROUP_ELEMENT_ORDER.filter((e) => Math.abs(deviation[e] - edge) < TIE_MARGIN);
  return picked.length <= MAX_EXTREME ? new Set(picked) : new Set();
}

export function groupToday(
  synthesis: GroupSynthesis,
  members: GroupMember[],
  civilDate: string,
): GroupToday {
  const profile = profileOfDay(civilDate);
  const element = STEMS[profile.saju.day.heavenlyStem].element as FiveElement;

  const { deviation } = synthesis.elements;
  const peaks = extremeSet(deviation, "high");
  const troughs = extremeSet(deviation, "low");

  let effect: TodayEffect = "neutral";
  if (troughs.has(element)) effect = "fills-gap";
  else if (peaks.has(element)) effect = "doubles-down";
  else if ([...peaks].some((e) => CONTROLS[element] === e)) effect = "eases-peak";
  else if ([...peaks].some((e) => GENERATES[element] === e)) effect = "feeds-peak";

  const seasonElement = BRANCHES[profile.saju.month.earthlyBranch].element as FiveElement;

  return {
    date: civilDate,
    element,
    effect,
    season: { element: seasonElement, strength: seasonStrengthOf(element, seasonElement) },
    members: members.map((member) => {
      // 오늘을 오른쪽에 둔다. 렌즈는 대칭이라 순서가 결과를 바꾸지 않지만,
      // 읽는 사람 기준으로 "나와 오늘"이 자연스럽다.
      const lenses = compareSymbolicProfiles(member.profile, profile).lenses;
      const dayMaster = STEMS[member.profile.saju.day.heavenlyStem].element as FiveElement;
      return {
        id: member.id,
        label: member.label,
        dayMaster,
        stance: stanceOf(element, dayMaster),
        highlight: pickHighlight(lenses),
        lenses,
      };
    }),
    profile,
  };
}

/**
 * 계절 세기를 둘로 접는다. 문구가 다섯 × 다섯으로 불어나지 않도록, 사람별
 * 해 볼 것에는 "오늘 기운이 센가 약한가"만 반영한다.
 *
 *   strong  旺·相 — 계절과 같거나 계절이 밀어 준다
 *   weak    休·囚·死 — 계절을 돕거나, 맞서거나, 눌린다
 */
export type SeasonBand = "strong" | "weak";

export function seasonBand(strength: SeasonStrength): SeasonBand {
  return strength === "prosperous" || strength === "rising" ? "strong" : "weak";
}

// ── 주간·월간 ──────────────────────────────────────────────────────────────

export type PeriodKind = "week" | "month";

/**
 * 기간에 들어가는 달력 날짜들.
 *   week   월요일~일요일. 운세 엔진의 주차(ISO)와 같은 주다
 *   month  그 달 1일~말일
 * 날짜 문자열만 다루므로 시간대가 끼어들 자리가 없다.
 */
export function periodDates(kind: PeriodKind, civilDate: string): string[] {
  const [y, m, d] = civilDate.split("-").map(Number);
  const iso = (date: Date) =>
    `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
  if (kind === "week") {
    const base = new Date(Date.UTC(y, m - 1, d));
    const weekday = base.getUTCDay() || 7; // 월=1 … 일=7
    return Array.from({ length: 7 }, (_, index) => iso(new Date(Date.UTC(y, m - 1, d - weekday + 1 + index))));
  }
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return Array.from({ length: last }, (_, index) => iso(new Date(Date.UTC(y, m - 1, index + 1))));
}

export interface GroupPeriod {
  kind: PeriodKind;
  dates: string[];
  /** 하루하루의 오늘의 우리. 같은 함수를 날짜만 바꿔 부른 것이다. */
  days: GroupToday[];
  /** 작용별 날 수 */
  effectCounts: Record<TodayEffect, number>;
  /** 계절이 오늘 기운을 밀어 주는(strong) 날 수 */
  strongDays: number;
  members: Array<{
    id: string;
    label: string;
    dayMaster: FiveElement;
    /** 관계별 날짜 목록 */
    stanceDays: Record<TodayStance, string[]>;
  }>;
}

const EFFECTS: TodayEffect[] = ["fills-gap", "eases-peak", "doubles-down", "feeds-peak", "neutral"];
const STANCES: TodayStance[] = ["peer", "support", "output", "pressure", "wealth"];

export function groupPeriod(
  synthesis: GroupSynthesis,
  members: GroupMember[],
  kind: PeriodKind,
  civilDate: string,
): GroupPeriod {
  const dates = periodDates(kind, civilDate);
  const days = dates.map((date) => groupToday(synthesis, members, date));
  const effectCounts = Object.fromEntries(EFFECTS.map((e) => [e, 0])) as Record<TodayEffect, number>;
  let strongDays = 0;
  for (const day of days) {
    effectCounts[day.effect] += 1;
    if (seasonBand(day.season.strength) === "strong") strongDays += 1;
  }
  return {
    kind,
    dates,
    days,
    effectCounts,
    strongDays,
    members: members.map((member, index) => {
      const stanceDays = Object.fromEntries(STANCES.map((st) => [st, [] as string[]])) as Record<TodayStance, string[]>;
      for (const day of days) stanceDays[day.members[index].stance].push(day.date);
      return {
        id: member.id,
        label: member.label,
        dayMaster: days[0]?.members[index].dayMaster ?? (STEMS[member.profile.saju.day.heavenlyStem].element as FiveElement),
        stanceDays,
      };
    }),
  };
}

