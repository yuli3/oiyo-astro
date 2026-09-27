import type { FiveElement } from "@/lib/ontology/saju/types";

export type SunElement = "air" | "earth" | "fire" | "water";
export type MayanColor = "blue" | "red" | "white" | "yellow";

const DAY_MASTER: Record<FiveElement, string> = {
  wood: "#7fd39a", fire: "#ff8a66", earth: "#e0b872", metal: "#d5dde6", water: "#8cc0f0",
};
const SUN: Record<SunElement, string> = {
  air: "#bba7f4", earth: "#a5ca9c", fire: "#f4a37e", water: "#86c9d8",
};
const MAYAN: Record<MayanColor, string> = {
  blue: "#86b5ef", red: "#f28d91", white: "#eef0db", yellow: "#efd17e",
};

/**
 * 무늬의 색은 상대방과의 좋고 나쁨 점수가 아니다. 이미 있는 일간·태양궁 원소·
 * 마야 색 계열을 시각적으로 구분하는 세 정거장이다. 옛 공유 링크에 마야 좌표가
 * 없으면 태양궁 색을 반복해, 없는 정보를 만들어 내지 않는다.
 */
export function signaturePalette(dayMaster: FiveElement, sun: SunElement, mayan?: MayanColor): [string, string, string] {
  return [DAY_MASTER[dayMaster], SUN[sun], mayan ? MAYAN[mayan] : SUN[sun]];
}
