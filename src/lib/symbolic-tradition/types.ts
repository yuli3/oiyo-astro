import type { EarthlyBranch, FiveElement, HeavenlyStem } from "@/lib/ontology/saju/types";

export const SYMBOLIC_PROFILE_SCHEMA_VERSION = 1 as const;

export type CompatibilityLensId =
  | "chinese-zodiac"
  | "five-elements"
  | "sun-sign"
  | "yin-yang";

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
  chineseZodiac: SymbolicProfile["chineseZodiac"];
  fiveElements: Pick<SymbolicProfile["fiveElements"], "dominant" | "observedCoordinates">;
  sunSign: SymbolicProfile["sunSign"];
  yinYang: SymbolicProfile["yinYang"];
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
