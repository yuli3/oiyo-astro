import stats from "../data/reincarnation-life-stats.json";
import { pickMany, type ReincarnationCountry } from "./reincarnation";

/**
 * 환생 뒤 "어떤 삶인가"를 나라 평균 통계로 보여 주는 순수 함수들.
 *
 * 2026-10-13 세운 요청(1in8b.life 참고 1차 묶음): 같은 1초에 태어난 4명, 탄생 카드,
 * 인생 지도 100칸. 시뮬레이션이 아니라 나라 평균을 그대로 그린 그림이다. 개인의 삶을
 * 예측한다고 읽히지 않게 화면 문구도 "평균"이라고 말한다.
 */

export interface LifeStats {
  /** 출생 시 기대수명(년). */
  lifeExpectancy?: number;
  /** 5세 전 사망 비율(%). */
  childMortality?: number;
  /** 15–64세 평균 교육 연수(년). */
  schooling?: number;
  /** 하루 소득·소비 중간값(2021 PPP 달러). */
  dailyIncome?: number;
  /** dailyIncome을 조사한 해. 나라마다 다르다. */
  dailyIncomeYear?: number;
  /** 인터넷 사용자 비율(%). */
  internet?: number;
}

export type LifeStatKey = Exclude<keyof LifeStats, "dailyIncomeYear">;
export const LIFE_STAT_KEYS: LifeStatKey[] = ["lifeExpectancy", "childMortality", "schooling", "dailyIncome", "internet"];

type StatsFile = {
  source: string;
  asOf: string;
  years: Partial<Record<LifeStatKey, string>>;
  countries: Record<string, LifeStats>;
};

const FILE = stats as StatsFile;

export const LIFE_STATS_META = { source: FILE.source, asOf: FILE.asOf, years: FILE.years };

export function lifeStatsFor(iso3: string): LifeStats {
  return FILE.countries[iso3] ?? {};
}

/** 같은 1초에 함께 태어난 다른 아기들. 출생 비중으로 뽑는다(인구 기준이 아니다). */
export const SAME_SECOND_COUNT = 4;
export function sameSecondBirths(random = Math.random): ReincarnationCountry[] {
  return pickMany("births", SAME_SECOND_COUNT, random);
}

export type LifePhase = "early" | "school" | "work" | "later" | "beyond";

export const LIFE_MAP_YEARS = 100;
const SCHOOL_START = 6;
const RETIRE_AGE = 65;

/**
 * 인생 지도 100칸(1칸 = 1년). 나라 평균으로만 나눈다.
 * - early: 학교 가기 전(0–5세)
 * - school: 6세부터 평균 교육 연수만큼
 * - work: 학교 뒤부터 65세 또는 기대수명 중 먼저 오는 때까지
 * - later: 65세부터 기대수명까지
 * - beyond: 기대수명 뒤(평균적으로는 살지 못하는 해)
 * 통계가 없으면 칸을 나누지 않고 전부 null로 돌려준다.
 */
export function lifeMap(row: LifeStats): (LifePhase | null)[] {
  const life = row.lifeExpectancy;
  if (life === undefined || !Number.isFinite(life) || life <= 0) return Array(LIFE_MAP_YEARS).fill(null);
  const lifeYears = Math.min(LIFE_MAP_YEARS, Math.round(life));
  const schoolEnd = row.schooling !== undefined && Number.isFinite(row.schooling)
    ? SCHOOL_START + Math.round(Math.max(0, row.schooling))
    : SCHOOL_START;
  return Array.from({ length: LIFE_MAP_YEARS }, (_, age) => {
    if (age >= lifeYears) return "beyond";
    if (age < SCHOOL_START) return "early";
    if (age < schoolEnd) return "school";
    if (age < RETIRE_AGE) return "work";
    return "later";
  });
}

export function phaseYears(map: (LifePhase | null)[], phase: LifePhase): number {
  return map.filter((cell) => cell === phase).length;
}

/** 5세 전 사망률(%)을 "아이 N명 중 1명"으로 바꾼다. 0이나 결측이면 null. */
export function oneInChildren(childMortality: number | undefined): number | null {
  if (childMortality === undefined || !Number.isFinite(childMortality) || childMortality <= 0) return null;
  return Math.max(1, Math.round(100 / childMortality));
}
