// 시즌 유형 테스트 목록 (2026-11-22). 페이지 하단 "더 하기" 링크와 테스트가 이 순서를 쓴다.
import type { SeasonQuiz } from "./types";
import { NEW_YEAR_RESOLUTION } from "./new-year-resolution";
import { YEAR_END_PARTY } from "./year-end-party";
import { WINTER_HIBERNATION } from "./winter-hibernation";
import { FIRST_SNOW_LOVE } from "./first-snow-love";
import { GIFT_STYLE } from "./gift-style";
import { FAMILY_GATHERING } from "./family-gathering";
import { YEAR_END_REVIEW } from "./year-end-review";
import { TRAVEL_STYLE } from "./travel-style";
import { WINTER_HOBBY } from "./winter-hobby";
import { DECLUTTER_STYLE } from "./declutter-style";
import { WINTER_BREAK } from "./winter-break";
import { NEW_YEAR_GREETING } from "./new-year-greeting";
import { WINTER_SNACK } from "./winter-snack";
import { KARAOKE_ROLE } from "./karaoke-role";
import { WINTER_OUTFIT } from "./winter-outfit";
import { HOLIDAY_MOVIE } from "./holiday-movie";
import { NEW_YEAR_WORKOUT } from "./new-year-workout";
import { CHRISTMAS_DATE } from "./christmas-date";

export const SEASON_QUIZZES: SeasonQuiz[] = [
  NEW_YEAR_RESOLUTION,
  YEAR_END_PARTY,
  GIFT_STYLE,
  FIRST_SNOW_LOVE,
  WINTER_HIBERNATION,
  FAMILY_GATHERING,
  YEAR_END_REVIEW,
  TRAVEL_STYLE,
  WINTER_HOBBY,
  DECLUTTER_STYLE,
  WINTER_BREAK,
  NEW_YEAR_GREETING,
  WINTER_SNACK,
  KARAOKE_ROLE,
  WINTER_OUTFIT,
  HOLIDAY_MOVIE,
  NEW_YEAR_WORKOUT,
  CHRISTMAS_DATE,
] as SeasonQuiz[];
