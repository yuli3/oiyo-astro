import { calculateZiWeiCoordinates, PALACE_ORDER } from "@/lib/ontology/ziwei/calculator";
import { MAIN_STARS } from "@/lib/ontology/ziwei/data";
import type { PalaceKey } from "@/lib/ontology/ziwei/types";

/**
 * 참가자에게 싣는 자미두수 좌표 — 명궁의 자리와 그 안의 주성.
 *
 * 명반 전체를 싣지 않는다. 열두 궁은 명궁에서 거꾸로 한 칸씩 이어지므로
 * (명궁 → 형제궁 → 부처궁 …) 명궁 지지 하나로 모든 궁의 자리가 정해진다.
 * 두 사람을 겹쳐 볼 때 "내 명궁이 상대 명반의 어느 궁에 앉는가"는 자미두수
 * 합반(合盤)의 기본 읽기다.
 *
 * 명궁은 음력 월과 시지로 정해져 **시각이 없으면 세울 수 없다.** 시각을
 * 출생지의 진태양시로 셈하므로 도시도 있어야 한다 — 자미두수 페이지와 같은
 * 조건이다. 둘 중 하나라도 없으면 null.
 *
 * 공유 링크에 실리는 폭: 명궁 지지는 시지(두 시간)와 음력 월이 합쳐 드러나는
 * 값이다. 시주가 이미 시지를 드러내고 태양 황경이 달을 드러내므로 새로 새지
 * 않는다.
 */
export interface ZiweiCoordinates {
  /** 명궁의 지지 — JA(子)…HAE(亥) */
  lifePalace: string;
  /** 명궁 안의 14주성 id. 비어 있으면 공궁 */
  stars: string[];
}

export const ZIWEI_BRANCHES = ["JA", "CHUK", "IN", "MYO", "JIN", "SA", "O", "MI", "SIN", "YU", "SUL", "HAE"] as const;
const MAJOR = new Set(MAIN_STARS.map((star) => star.id));

function civilToUtc(civilDate: string, civilTime: string, offsetMinutes: number): Date {
  const [y, m, d] = civilDate.split("-").map(Number);
  const [hh, mm] = civilTime.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh, mm) - offsetMinutes * 60_000);
}

export function ziweiCoordinates(input: {
  civilDate: string;
  civilTime: string | null;
  utcOffsetMinutes: number | null;
  longitude: number | null;
}): ZiweiCoordinates | null {
  const { civilDate, civilTime, utcOffsetMinutes, longitude } = input;
  if (!civilTime || utcOffsetMinutes === null || longitude === null) return null;
  const chart = calculateZiWeiCoordinates(civilToUtc(civilDate, civilTime, utcOffsetMinutes), longitude);
  return {
    lifePalace: ZIWEI_BRANCHES[chart.lifePalace.index],
    stars: chart.lifePalace.stars.map((star) => star.id).filter((id) => MAJOR.has(id)),
  };
}

/** 손님의 명궁 지지가 주인 명반에서 어느 궁인가. 궁은 명궁에서 거꾸로 이어진다. */
export function palaceInChart(host: ZiweiCoordinates, guestBranch: string): PalaceKey {
  const h = ZIWEI_BRANCHES.indexOf(host.lifePalace as (typeof ZIWEI_BRANCHES)[number]);
  const g = ZIWEI_BRANCHES.indexOf(guestBranch as (typeof ZIWEI_BRANCHES)[number]);
  return PALACE_ORDER[(((h - g) % 12) + 12) % 12];
}

export function isZiweiCoordinates(value: unknown): value is ZiweiCoordinates {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<ZiweiCoordinates>;
  return typeof v.lifePalace === "string" && (ZIWEI_BRANCHES as readonly string[]).includes(v.lifePalace)
    && Array.isArray(v.stars) && v.stars.length <= 4 && v.stars.every((id) => typeof id === "string" && MAJOR.has(id));
}
