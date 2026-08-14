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
  harmonyIndex: null;
  id: CompatibilityLensId;
  relation: string;
}

export interface SymbolicCompatibilityReport {
  schema: "oiyo.symbolic-compatibility-report";
  schemaVersion: 1;
  lenses: SymbolicCompatibilityLens[];
  policy: {
    aggregateJudgment: "none";
    harmonyIndexActivation: "human-gated";
    purpose: "reflection-and-entertainment";
  };
}
