/**
 * 오늘의 우리 — 모임의 오늘 컨디션.
 *
 * 우리 기운은 생년월일에서 나오는 고정 좌표라 "우리는 이런 모임"이다.
 * 이쪽은 날마다 바뀌는 "오늘 우리가 모이면"이다. 두 층을 한 패널에 섞으면
 * "우리"가 매일 달라지는 것처럼 읽히므로 따로 둔다.
 *
 * 바이오리듬을 쓰지 않은 이유. 바이오리듬은 출생일로부터의 일수가 필요한데,
 * 비교 프로필에는 생년월일이 없다 — 공유 링크가 원자료가 아니라 좌표만
 * 담도록 일부러 그렇게 설계돼 있다. 그 설계를 깨면서까지 넣을 값은 아니다.
 *
 * 대신 오늘의 일진(日辰)을 쓴다. 오늘 날짜와 각자의 기존 좌표만 있으면 되고,
 * 같은 날 같은 모임이면 누가 열어도 같은 결과가 나온다.
 */
import { STEMS } from "@/manifest/data/saju/stems";
import { FiveElement } from "../ontology/saju/types";
import { deriveSymbolicProfile } from "./index";
import { GROUP_ELEMENT_ORDER, type GroupMember, type GroupSynthesis } from "./group-synthesis";

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
 * 오늘의 기운이 이 모임에 어떻게 작용하는가.
 *
 *   fills-gap     모임에서 가장 얇은 자리를 오늘이 채운다
 *   eases-peak    모임에서 가장 두꺼운 기운을 오늘이 눌러 준다
 *   doubles-down  가장 두꺼운 쪽에 오늘이 더 얹는다
 *   feeds-peak    가장 두꺼운 기운을 오늘이 더 키운다(상생)
 *   neutral       그 밖
 *
 * 처음에는 "몰렸다·얇다"로 **판정된** 원소만 봤는데, 기저 비율을 바로잡은
 * 뒤로 그 판정이 드물어져 73.9% 가 neutral 이 됐다. 대부분의 날에 "별 작용
 * 없음"이라고 말하는 카드는 볼 이유가 없다. 그래서 판정 대신 **모임 안에서
 * 상대적으로 가장 두꺼운·가장 얇은** 기운을 쓴다. 둘은 언제나 존재하고,
 * "이 모임에서 제일 적은 기운"은 판정 문턱과 무관하게 참인 진술이다.
 */
export type TodayEffect = "fills-gap" | "eases-peak" | "doubles-down" | "feeds-peak" | "neutral";

/** 오늘 기운과 한 사람의 관계. */
export type TodayStance = "aligned" | "fed" | "feeding" | "pressed" | "pressing";

export interface GroupToday {
  /** 오늘 일간의 오행 */
  element: FiveElement;
  effect: TodayEffect;
  members: Array<{ id: string; label: string; stance: TodayStance }>;
  /** 계산에 쓴 날짜 (YYYY-MM-DD, 달력 기준) */
  date: string;
}

/** 오늘 일간의 오행. 달력 날짜만 쓰므로 시각·장소가 필요 없다. */
export function dayElementOf(civilDate: string): FiveElement {
  const profile = deriveSymbolicProfile({
    civilDate,
    civilTime: null,
    longitude: null,
    utcOffsetMinutes: null,
  });
  return STEMS[profile.saju.day.heavenlyStem].element as FiveElement;
}

function stanceOf(today: FiveElement, mine: FiveElement): TodayStance {
  if (today === mine) return "aligned";
  if (GENERATES[today] === mine) return "fed";
  if (GENERATES[mine] === today) return "feeding";
  if (CONTROLS[today] === mine) return "pressed";
  return "pressing";
}

export function groupToday(
  synthesis: GroupSynthesis,
  members: GroupMember[],
  civilDate: string,
): GroupToday {
  const element = dayElementOf(civilDate);
  const { deviation } = synthesis.elements;
  let peak = GROUP_ELEMENT_ORDER[0];
  let trough = GROUP_ELEMENT_ORDER[0];
  for (const candidate of GROUP_ELEMENT_ORDER) {
    if (deviation[candidate] > deviation[peak]) peak = candidate;
    if (deviation[candidate] < deviation[trough]) trough = candidate;
  }

  let effect: TodayEffect = "neutral";
  if (element === trough) effect = "fills-gap";
  else if (element === peak) effect = "doubles-down";
  else if (CONTROLS[element] === peak) effect = "eases-peak";
  else if (GENERATES[element] === peak) effect = "feeds-peak";

  return {
    date: civilDate,
    element,
    effect,
    members: members.map((member) => ({
      id: member.id,
      label: member.label,
      stance: stanceOf(element, member.profile.fiveElements.dominant),
    })),
  };
}
