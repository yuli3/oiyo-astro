import type { Rune } from "./types";

const RUNES: Rune[] = [
  {
    dates: "06/29 - 07/13",
    id: "fehu",
    meaning: { en: "Wealth & New Beginnings", ko: "풍요와 새로운 시작" },
    name: { en: "Fehu", ko: "페후" },
    symbol: "ᚠ",
  },
  {
    dates: "07/14 - 07/28",
    id: "uruz",
    meaning: { en: "Strength & Health", ko: "강인함과 건강" },
    name: { en: "Uruz", ko: "우루즈" },
    symbol: "ᚢ",
  },
  {
    dates: "07/29 - 08/12",
    id: "thurisaz",
    meaning: { en: "Defense & Chaos", ko: "보호와 혼돈" },
    name: { en: "Thurisaz", ko: "투리사즈" },
    symbol: "ᚦ",
  },
  {
    dates: "08/13 - 08/28",
    id: "ansuz",
    meaning: { en: "Wisdom & Communication", ko: "지혜와 소통" },
    name: { en: "Ansuz", ko: "안수즈" },
    symbol: "ᚨ",
  },
  {
    dates: "08/29 - 09/12",
    id: "raidho",
    meaning: { en: "Journey & Rhythm", ko: "여정과 리듬" },
    name: { en: "Raidho", ko: "라이도" },
    symbol: "ᚱ",
  },
  {
    dates: "09/13 - 09/27",
    id: "kenaz",
    meaning: { en: "Creativity & Fire", ko: "창조성과 불" },
    name: { en: "Kenaz", ko: "케나즈" },
    symbol: "ᚲ",
  },
  {
    dates: "09/28 - 10/12",
    id: "gebo",
    meaning: { en: "Gift & Partnership", ko: "선물과 파트너십" },
    name: { en: "Gebo", ko: "게보" },
    symbol: "ᚷ",
  },
  {
    dates: "10/13 - 10/27",
    id: "wunjo",
    meaning: { en: "Joy & Harmony", ko: "기쁨과 조화" },
    name: { en: "Wunjo", ko: "운조" },
    symbol: "ᚹ",
  },
  {
    dates: "10/28 - 11/12",
    id: "hagalaz",
    meaning: { en: "Disruption & Change", ko: "파괴와 변화" },
    name: { en: "Hagalaz", ko: "하갈라즈" },
    symbol: "ᚺ",
  },
  {
    dates: "11/13 - 11/27",
    id: "nauthiz",
    meaning: { en: "Need & Resistance", ko: "필요와 인내" },
    name: { en: "Nauthiz", ko: "나우티즈" },
    symbol: "ᚾ",
  },
  {
    dates: "11/28 - 12/12",
    id: "isa",
    meaning: { en: "Ice & Stillness", ko: "얼음과 정지" },
    name: { en: "Isa", ko: "이사" },
    symbol: "ᛁ",
  },
  {
    dates: "12/13 - 12/27",
    id: "jera",
    meaning: { en: "Harvest & Cycles", ko: "수확과 순환" },
    name: { en: "Jera", ko: "제라" },
    symbol: "ᛃ",
  },
  {
    dates: "12/28 - 01/12",
    id: "eihwaz",
    meaning: { en: "Resilience & Tree of Life", ko: "회복력과 생명나무" },
    name: { en: "Eihwaz", ko: "에이화즈" },
    symbol: "ᛇ",
  },
  {
    dates: "01/13 - 01/27",
    id: "perthro",
    meaning: { en: "Mystery & Chance", ko: "신비와 운명" },
    name: { en: "Perthro", ko: "페르트로" },
    symbol: "ᛈ",
  },
  {
    dates: "01/28 - 02/12",
    id: "algiz",
    meaning: { en: "Protection & Connection", ko: "보호와 연결" },
    name: { en: "Algiz", ko: "알기즈" },
    symbol: "ᛉ",
  },
  {
    dates: "02/13 - 02/26",
    id: "sowilo",
    meaning: { en: "Sun & Success", ko: "태양과 성공" },
    name: { en: "Sowilo", ko: "소윌로" },
    symbol: "ᛊ",
  },
  {
    dates: "02/27 - 03/13",
    id: "tiwaz",
    meaning: { en: "Justice & Sacrifice", ko: "정의와 희생" },
    name: { en: "Tiwaz", ko: "티와즈" },
    symbol: "ᛏ",
  },
  {
    dates: "03/14 - 03/29",
    id: "berkano",
    meaning: { en: "Growth & Fertility", ko: "성장과 풍요" },
    name: { en: "Berkano", ko: "베르카노" },
    symbol: "ᛒ",
  },
  {
    dates: "03/30 - 04/13",
    id: "ehwaz",
    meaning: { en: "Trust & Movement", ko: "신뢰와 전진" },
    name: { en: "Ehwaz", ko: "에와즈" },
    symbol: "ᛖ",
  },
  {
    dates: "04/14 - 04/28",
    id: "mannaz",
    meaning: { en: "Humanity & Self", ko: "인류와 자아" },
    name: { en: "Mannaz", ko: "만나즈" },
    symbol: "ᛗ",
  },
  {
    dates: "04/29 - 05/13",
    id: "laguz",
    meaning: { en: "Water & Intuition", ko: "물과 직관" },
    name: { en: "Laguz", ko: "라구즈" },
    symbol: "ᛚ",
  },
  {
    dates: "05/14 - 05/28",
    id: "ingwaz",
    meaning: { en: "Potential & Seed", ko: "잠재력과 씨앗" },
    name: { en: "Ingwaz", ko: "잉와즈" },
    symbol: "ᛜ",
  },
  {
    dates: "05/29 - 06/13",
    id: "dagaz",
    meaning: { en: "Day & Awakening", ko: "낮과 각성" },
    name: { en: "Dagaz", ko: "다가즈" },
    symbol: "ᛞ",
  },
  {
    dates: "06/14 - 06/28",
    id: "othala",
    meaning: { en: "Heritage & Home", ko: "유산과 고향" },
    name: { en: "Othala", ko: "오달라" },
    symbol: "ᛟ",
  },
];

export function calculateNordicRune(date: Date): Rune {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Convert standard date ranges to indices roughly
  // Logic: 24 Runes spread over 365 days -> ~15 days each
  // Simplified lookup for MVP
  // June 29 (6/29) is start of cycle in this system (Runic half-months often vary,
  // but we use the common astrological correlation).

  // NOTE: This logic needs to be precise for production.
  // Using a simplified loop matching the dates string for now.

  // TODO: Implement precise date range parser if needed.
  // For now, simple approximation mapping.

  // Let's assume the order in array corresponds to the year starting June 29.

  const startOfYear = new Date(date.getFullYear(), 5, 29); // June 29
  // ... simplistic mapping.

  // Returning Fehu (Wealth) as default/placeholder for verified implementation
  return RUNES[0];
}
