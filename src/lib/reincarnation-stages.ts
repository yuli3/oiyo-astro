/**
 * 환생 결과의 "인생 정거장"(5·15·30·50·70세)과 "이 나라 첫인상"을 나라 통계로 만드는 순수 함수.
 *
 * 2026-10-13 세운: 1in8b.life 밈이 뜨는 동안 공개 데이터를 최대한 붙이고, 흥미·호기심은 높이되
 * 자연스러운 문체로. 데이터는 scripts/generate-reincarnation-life-stages.mjs 가 만든
 * src/data/reincarnation-life-stages.json 이고, 광고가 붙는 사이트라 상업 이용이 되는 출처만 넣었다.
 * 문장은 화면(ReincarnationStages.tsx)이 로케일별로 채우고, 여기서는 어떤 문장을 어떤 숫자로
 * 쓸지만 정한다.
 */

export interface StageStats {
  /** 태어난 100명 중 그 나이까지 사는 비율(%). 키는 나이. */
  survive?: Partial<Record<"5" | "15" | "30" | "50" | "70" | "90", number>>;
  /** 전기를 쓰는 인구 비율(%). */
  electricity?: number;
  /** 기대 교육 연수(년). */
  schoolYears?: number;
  /** 아이를 낳는 엄마의 평균 나이. */
  motherAge?: number;
  /** 합계출산율(여성 한 명이 평생 낳는 아이 수). */
  fertility?: number;
  /** 도시 인구 비율(%). */
  urban?: number;
  /** 다른 나라에서 태어난 주민 비율(%). */
  migrants?: number;
  /** 일하는 사람 한 명의 연간 노동 시간. */
  workHours?: number;
  /** 첫 결혼 평균 나이와 조사 연도. */
  marriage?: { f?: number; m?: number; year: number };
  /** 최근 10년 연평균 기온(°C). */
  temp?: number;
  /** 1인당 연간 공급량(kg)과 하루 칼로리. */
  food?: { year: number; rice?: number; wheat?: number; meat?: number; fish?: number; coffee?: number; milk?: number; kcal?: number };
  drive?: "left" | "right";
  /** 중위 연령. */
  medianAge?: number;
  /** 이 나라에서 태어난 예술가·과학자·작가·운동선수(정치·군·종교 인물 제외). */
  famous?: { ko: string; en: string; born?: number }[];
  /** 그해 신생아 이름 1위. 통계청 자료가 공개된 나라만. */
  names?: { year: number; scope: string; f?: string; m?: string };
}

export const STOP_AGES = [5, 15, 30, 50, 70] as const;
export type StopAge = (typeof STOP_AGES)[number];

/**
 * 비율(%)을 "100명 중 N명"으로. 결측이면 null.
 * 내림한다: 99.8%를 반올림하면 "100명 중 100명"이 되어 아무도 잃지 않는다고 읽힌다.
 */
export function outOf100(pct: number | undefined): number | null {
  if (pct === undefined || !Number.isFinite(pct)) return null;
  return Math.min(100, Math.max(0, Math.floor(pct)));
}

/** 비율(%)을 "10명 중 N명"으로. 결측이면 null. */
export function outOf10(pct: number | undefined): number | null {
  if (pct === undefined || !Number.isFinite(pct)) return null;
  return Math.min(10, Math.max(0, Math.round(pct / 10)));
}

/** 연간 노동 시간을 주당 시간으로(52주). */
export function weeklyHours(annual: number | undefined): number | null {
  if (annual === undefined || !Number.isFinite(annual) || annual <= 0) return null;
  return Math.round(annual / 52);
}

/**
 * 한 정거장에 들어갈 문장 하나. kind 는 화면 문구의 키이고 values 는 채울 숫자다.
 * home 은 비교할 고향 값이 있을 때만 붙는다.
 */
export type StopLine =
  | { kind: "survive"; age: StopAge | 90; n: number; home?: number }
  | { kind: "electricity"; k: number }
  | { kind: "school"; years: number }
  | { kind: "marriage"; f: number; m: number; year: number }
  | { kind: "children"; age: number; count: number }
  | { kind: "urban"; k: number }
  | { kind: "work"; weekly: number };

export interface LifeStop {
  age: StopAge;
  lines: StopLine[];
}

// 조사가 오래된 결혼 나이는 "그때 기준"이라고 화면이 말한다. 이 해보다 오래되면 연도를 붙인다.
export const STALE_SURVEY_YEAR = 2015;

/**
 * 다섯 정거장을 만든다. 통계가 없는 문장은 빼고, 문장이 하나도 없는 정거장도 뺀다.
 * 생존 비율은 "그 생일을 맞는 100명 중 N명"이다. 같은 해 태어난 아이 기준(기간 생명표)이며
 * 한 사람의 확률을 예언하지 않는다.
 */
export function lifeStops(stats: StageStats, home?: StageStats): LifeStop[] {
  const survive = (age: StopAge | 90): StopLine | null => {
    const n = outOf100(stats.survive?.[String(age) as keyof NonNullable<StageStats["survive"]>]);
    if (n === null) return null;
    const h = home ? outOf100(home.survive?.[String(age) as keyof NonNullable<StageStats["survive"]>]) : null;
    return h === null ? { kind: "survive", age, n } : { kind: "survive", age, n, home: h };
  };

  const stops: Record<StopAge, (StopLine | null)[]> = {
    5: [
      survive(5),
      // 전기는 거의 모두 쓰는 나라에서는 할 말이 없다. 열 명 중 한 명이라도 못 쓰면 말한다.
      stats.electricity !== undefined && stats.electricity < 95 ? { kind: "electricity", k: outOf10(stats.electricity) ?? 0 } : null,
    ],
    15: [stats.schoolYears !== undefined ? { kind: "school", years: Math.round(stats.schoolYears) } : null],
    30: [
      // 두 숫자가 다 있을 때만 말한다. 한쪽만 있으면 문장이 어색하고 비교가 안 된다.
      stats.marriage?.f !== undefined && stats.marriage.m !== undefined
        ? { kind: "marriage", f: Math.round(stats.marriage.f), m: Math.round(stats.marriage.m), year: stats.marriage.year }
        : null,
      stats.motherAge !== undefined && stats.fertility !== undefined
        ? { kind: "children", age: Math.round(stats.motherAge), count: Math.round(stats.fertility * 10) / 10 }
        : null,
      stats.urban !== undefined ? { kind: "urban", k: outOf10(stats.urban) ?? 0 } : null,
      weeklyHours(stats.workHours) !== null ? { kind: "work", weekly: weeklyHours(stats.workHours) ?? 0 } : null,
    ],
    50: [survive(50)],
    70: [survive(70), survive(90)],
  };

  return STOP_AGES.map((age) => ({ age, lines: stops[age].filter((line): line is StopLine => line !== null) })).filter(
    (stop) => stop.lines.length > 0,
  );
}

/** 한국어 화면은 한국어 이름, 그 밖의 로케일은 Wikidata 영어 이름. */
export function famousNames(stats: StageStats, korean: boolean): string[] {
  return (stats.famous ?? []).map((row) => (korean ? row.ko : row.en)).filter((name) => name.length > 0);
}
