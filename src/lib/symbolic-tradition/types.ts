import type { AstroCoordinates } from "./astro-coordinates";
import type { EarthlyBranch, FiveElement, HeavenlyStem } from "@/lib/ontology/saju/types";

export const SYMBOLIC_PROFILE_SCHEMA_VERSION = 1 as const;

/**
 * 궁합 관점(렌즈)의 단일 목록.
 *
 * 2026-09-04: 유니온 타입만 있고 목록이 없었다. 그래서 렌즈 개수가 필요한
 * 곳마다 숫자가 박혔다 — `group-snapshot.test.ts` 의 `pairs * 4` 가 그 예다.
 * 렌즈를 더할 때 그 숫자를 같이 못 고치면 테스트가 "왜" 깨졌는지 말해주지
 * 않고, 4를 5로 바꾸면 그냥 통과한다.
 *
 * 이제 목록이 진실이고 타입이 거기서 파생된다. 새 렌즈는 여기 한 줄만
 * 더하면 타입·개수가 따라온다.
 */
export const COMPATIBILITY_LENSES = [
  "five-elements",
  "yin-yang",
  "chinese-zodiac",
  "sun-sign",
  "element-complement",
  "day-master",
  "branch-harmony",
  "mayan-kin",
  "celtic-tree",
] as const;

export type CompatibilityLensId = (typeof COMPATIBILITY_LENSES)[number];

export interface BirthMoment {
  civilDate: string;
  civilTime: null | string;
  longitude: null | number;
  utcOffsetMinutes: null | number;
}

export interface SymbolicPillar {
  earthlyBranch: EarthlyBranch;
  heavenlyStem: HeavenlyStem;
}

export interface SymbolicProfile {
  schema: "oiyo.symbolic-profile";
  schemaVersion: typeof SYMBOLIC_PROFILE_SCHEMA_VERSION;
  source: {
    civilDate: string;
    locationStatus: "confirmed" | "defaulted";
    timeStatus: "known" | "unknown";
  };
  completeness: "date-only" | "full" | "provisional-location";
  uncertainties: Array<"birth-location-defaulted" | "birth-time-unknown">;
  saju: {
    day: SymbolicPillar;
    hour: null | SymbolicPillar;
    month: SymbolicPillar;
    year: SymbolicPillar;
  };
  fiveElements: {
    counts: Record<FiveElement, number>;
    dominant: FiveElement;
    observedCoordinates: 6 | 8;
  };
  yinYang: {
    yang: number;
    yin: number;
  };
  chineseZodiac: {
    branch: EarthlyBranch;
  };
  /**
   * 촐킨 서명. 20인장 × 13음조 = 260일 주기다. 열두 지지(12년)나 태양궁
   * (365일)과 주기가 겹치지 않아 다른 결을 본다. 색은 인장이 속한 네 계열
   * (적·백·청·황)이고, 계열마다 다섯 인장이 있다.
   */
  mayanKin: {
    color: "blue" | "red" | "white" | "yellow";
    seal: number;
    tone: number;
  };
  /** 켈트 수목 사인. 태양력 구간으로 나뉜 열넷. */
  celticTree: {
    id: string;
  };
  sunSign: {
    element: "air" | "earth" | "fire" | "water";
    modality: "cardinal" | "fixed" | "mutable";
    sign:
      | "aquarius"
      | "aries"
      | "cancer"
      | "capricorn"
      | "gemini"
      | "leo"
      | "libra"
      | "pisces"
      | "sagittarius"
      | "scorpio"
      | "taurus"
      | "virgo";
  };
}

export interface SymbolicComparisonProfile {
  celticTree: SymbolicProfile["celticTree"];
  chineseZodiac: SymbolicProfile["chineseZodiac"];
  mayanKin: SymbolicProfile["mayanKin"];
  fiveElements: Pick<SymbolicProfile["fiveElements"], "counts" | "dominant" | "observedCoordinates">;
  /**
   * 네 기둥 그대로. 오행 분포로 뭉개기 전의 원자료다 — 일간 렌즈는 일간
   * 하나만 보고, 지지 렌즈는 기둥마다의 지지를 짝지어 본다. 시주는 출생
   * 시각을 모르면 없다.
   */
  saju: SymbolicProfile["saju"];
  sunSign: SymbolicProfile["sunSign"];
  yinYang: SymbolicProfile["yinYang"];
  /**
   * 별자리 층의 입력(태양 황경·달·상승궁). 2026-09-22 에 더했다. 그 전에
   * 저장·공유된 참가자에게는 없으므로 선택이고, 없는 사람은 별자리 층에서만
   * 빠진다. 무엇을 얼마나 싣는지는 astro-coordinates.ts 에 적었다.
   */
  astro?: AstroCoordinates;
}

export interface SymbolicCompatibilityLens {
  /**
   * 0-100 rendering of this lens's categorical relation, ordered by how
   * favourable the tradition considers it. Not a probability, not a measured
   * scale, and not a prediction about a relationship — it exists so a graph
   * can vary a line's weight and a bar can have a length.
   *
   * Activated 2026-08-18 on seuncho's decision, per-lens only. There is
   * deliberately no total: see policy.aggregateJudgment.
   */
  harmonyIndex: number;
  id: CompatibilityLensId;
  relation: string;
}

export interface SymbolicCompatibilityReport {
  schema: "oiyo.symbolic-compatibility-report";
  schemaVersion: 1;
  lenses: SymbolicCompatibilityLens[];
  policy: {
    /** Still none. Per-lens numbers exist; a single verdict does not. */
    aggregateJudgment: "none";
    harmonyIndexActivation: "human-approved-2026-08-18";
    purpose: "reflection-and-entertainment";
  };
}
