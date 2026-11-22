// 시즌 유형 테스트 목록 (2026-11-22). 페이지 하단 "더 하기" 링크와 테스트가 이 순서를 쓴다.
import type { SeasonQuiz } from "./types";
import { NEW_YEAR_RESOLUTION } from "./new-year-resolution";
import { YEAR_END_PARTY } from "./year-end-party";
import { WINTER_HIBERNATION } from "./winter-hibernation";
import { FIRST_SNOW_LOVE } from "./first-snow-love";
import { GIFT_STYLE } from "./gift-style";
import { FAMILY_GATHERING } from "./family-gathering";

export const SEASON_QUIZZES: SeasonQuiz[] = [
  NEW_YEAR_RESOLUTION,
  YEAR_END_PARTY,
  GIFT_STYLE,
  FIRST_SNOW_LOVE,
  WINTER_HIBERNATION,
  FAMILY_GATHERING,
] as SeasonQuiz[];
