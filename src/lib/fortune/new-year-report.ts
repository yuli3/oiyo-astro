// 신년운세 리포트 엔진 — 세운(그해의 간지)과 월운이 일간에 대해 어떤 십신 역할인지,
// 그리고 일지와 충·합인지로 해를 읽는다. AI·난수 없이 결정론적이다.
//
// 생년월일만 받는다(시각 미상). 용신은 네 기둥이 모두 있을 때만 낸다는 계산기
// 정책(SajuCalculator analysis 주석)과 맞추려고, 여기서는 용신을 쓰지 않고 일간·일지만
// 쓴다 — 이 둘은 생년월일만으로 확정된다. (2026-10-14, 유료 리포트 미리보기 P1)
import { createBirthRecord } from "@/lib/user/birth-record";
import { calculateBirthSaju } from "@/lib/ontology/saju/birth-contract";
import { calculateTenGod } from "@/lib/ontology/saju/logic";
import { EarthlyBranch, HeavenlyStem, TenGod } from "@/lib/ontology/saju/types";
import type { SajuPillar } from "@/lib/ontology/saju/types";

export type Role = "bigyeop" | "siksang" | "jaesung" | "gwansung" | "insung";
export type BranchRelation = "clash" | "harmony" | "none";

export interface PeriodReading {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  /** 천간의 십신 역할 — 그 기간의 "겉으로 드러나는 주제". */
  stemRole: Role;
  /** 지지(본기)의 십신 역할 — 그 기간의 "바탕에 깔린 흐름". */
  branchRole: Role;
  /** 일지와의 관계. 충은 변동, 합은 인연·협력으로 읽는다. */
  relation: BranchRelation;
}

export interface MonthReading extends PeriodReading {
  /** 양력 월(1~12). 월주는 그달 15일 기준 — 절입일(4~8일) 뒤라 그달의 주된 월주다. */
  month: number;
}

export interface NewYearReport {
  targetYear: number;
  dayMaster: HeavenlyStem;
  dayBranch: EarthlyBranch;
  year: PeriodReading;
  months: MonthReading[];
}

export const STEM_HANJA: Record<HeavenlyStem, string> = {
  GAP: "甲", EUL: "乙", BYEONG: "丙", JEONG: "丁", MU: "戊",
  GI: "己", GYEONG: "庚", SIN: "辛", IM: "壬", GYE: "癸",
};

export const BRANCH_HANJA: Record<EarthlyBranch, string> = {
  JA: "子", CHUK: "丑", IN: "寅", MYO: "卯", JIN: "辰", SA: "巳",
  O: "午", MI: "未", SIN: "申", YU: "酉", SUL: "戌", HAE: "亥",
};

export function roleOfTenGod(tg: TenGod): Role {
  switch (tg) {
    case TenGod.BI_GYEON:
    case TenGod.GEOP_JAE:
      return "bigyeop";
    case TenGod.SIK_SIN:
    case TenGod.SANG_GWAN:
      return "siksang";
    case TenGod.JEONG_JAE:
    case TenGod.PYEON_JAE:
      return "jaesung";
    case TenGod.JEONG_GWAN:
    case TenGod.PYEON_GWAN:
      return "gwansung";
    default:
      return "insung";
  }
}

// 육충(六沖)과 육합(六合). 짝을 정렬된 키로 둔다.
const CLASH_PAIRS = ["JA-O", "CHUK-MI", "IN-SIN", "MYO-YU", "JIN-SUL", "SA-HAE"];
const HARMONY_PAIRS = ["JA-CHUK", "IN-HAE", "MYO-SUL", "JIN-YU", "SA-SIN", "O-MI"];

function pairKey(a: EarthlyBranch, b: EarthlyBranch): [string, string] {
  return [`${a}-${b}`, `${b}-${a}`];
}

export function branchRelation(a: EarthlyBranch, b: EarthlyBranch): BranchRelation {
  const keys = pairKey(a, b);
  if (keys.some((k) => CLASH_PAIRS.includes(k))) return "clash";
  if (keys.some((k) => HARMONY_PAIRS.includes(k))) return "harmony";
  return "none";
}

function readPeriod(dayMaster: HeavenlyStem, dayBranch: EarthlyBranch, p: SajuPillar): PeriodReading {
  return {
    stem: p.heavenlyStem,
    branch: p.earthlyBranch,
    stemRole: roleOfTenGod(calculateTenGod(dayMaster, p.heavenlyStem, "stem")),
    branchRole: roleOfTenGod(calculateTenGod(dayMaster, p.earthlyBranch, "branch")),
    relation: branchRelation(dayBranch, p.earthlyBranch),
  };
}

/** 날짜 하나(정오, 시각 미상)의 기둥. 기간의 간지를 얻는 데만 쓴다. */
function pillarsOn(civilDate: string) {
  const resolution = calculateBirthSaju(createBirthRecord({ civilDate, civilTime: null }));
  if (resolution.status !== "resolved") return null;
  return resolution.standard;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function buildNewYearReport(birthDate: string, targetYear: number): NewYearReport | null {
  if (!ISO_DATE.test(birthDate)) return null;
  let birth;
  try {
    birth = pillarsOn(birthDate);
  } catch {
    return null;
  }
  if (!birth) return null;

  const dayMaster = birth.day.heavenlyStem;
  const dayBranch = birth.day.earthlyBranch;

  // 세운은 입춘 뒤의 연주다. 6월 15일이면 어느 해든 입춘 뒤다.
  const yearPillars = pillarsOn(`${targetYear}-06-15`);
  if (!yearPillars) return null;

  const months: MonthReading[] = [];
  for (let m = 1; m <= 12; m++) {
    const p = pillarsOn(`${targetYear}-${String(m).padStart(2, "0")}-15`);
    if (!p) return null;
    months.push({ month: m, ...readPeriod(dayMaster, dayBranch, p.month) });
  }

  return {
    targetYear,
    dayMaster,
    dayBranch,
    year: readPeriod(dayMaster, dayBranch, yearPillars.year),
    months,
  };
}
