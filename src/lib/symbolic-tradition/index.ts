import { BRANCHES } from "@/manifest/data/saju/branches";
import { STEMS } from "@/manifest/data/saju/stems";
import { birthCivilToInstant } from "@/lib/ontology/kernel/time";
import { calculateSaju } from "@/lib/ontology/saju/logic";
import { FiveElement } from "@/lib/ontology/saju/types";
import type { EarthlyBranch, SajuPillar } from "@/lib/ontology/saju/types";

import { SYMBOLIC_PROFILE_SCHEMA_VERSION } from "./types";
import type {
  BirthMoment,
  SymbolicCompatibilityLens,
  SymbolicCompatibilityReport,
  SymbolicComparisonProfile,
  SymbolicProfile,
  SymbolicPillar,
} from "./types";

export type {
  BirthMoment,
  CompatibilityLensId,
  SymbolicCompatibilityLens,
  SymbolicCompatibilityReport,
  SymbolicComparisonProfile,
  SymbolicProfile,
} from "./types";

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const ELEMENT_ORDER = [
  FiveElement.WOOD,
  FiveElement.FIRE,
  FiveElement.EARTH,
  FiveElement.METAL,
  FiveElement.WATER,
] as const;

const SUN_SIGNS: SymbolicProfile["sunSign"][] = [
  { sign: "aquarius", element: "air", modality: "fixed" },
  { sign: "pisces", element: "water", modality: "mutable" },
  { sign: "aries", element: "fire", modality: "cardinal" },
  { sign: "taurus", element: "earth", modality: "fixed" },
  { sign: "gemini", element: "air", modality: "mutable" },
  { sign: "cancer", element: "water", modality: "cardinal" },
  { sign: "leo", element: "fire", modality: "fixed" },
  { sign: "virgo", element: "earth", modality: "mutable" },
  { sign: "libra", element: "air", modality: "cardinal" },
  { sign: "scorpio", element: "water", modality: "fixed" },
  { sign: "sagittarius", element: "fire", modality: "mutable" },
  { sign: "capricorn", element: "earth", modality: "cardinal" },
] as const;
const SUN_SIGN_CUTOVER = [20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22] as const;

function parseBirthMoment(input: BirthMoment) {
  const dateMatch = DATE_PATTERN.exec(input.civilDate);
  if (!dateMatch) throw new RangeError("Invalid civil birth date");
  const [, yearText, monthText, dayText] = dateMatch;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const calendarProbe = new Date(Date.UTC(year, month - 1, day));
  if (
    calendarProbe.getUTCFullYear() !== year
    || calendarProbe.getUTCMonth() !== month - 1
    || calendarProbe.getUTCDate() !== day
  ) throw new RangeError("Invalid civil birth date");
  if (input.civilTime !== null && !TIME_PATTERN.test(input.civilTime)) {
    throw new RangeError("Invalid civil birth time");
  }
  if (
    input.utcOffsetMinutes !== null
    && (!Number.isInteger(input.utcOffsetMinutes) || input.utcOffsetMinutes < -840 || input.utcOffsetMinutes > 840)
  ) throw new RangeError("Invalid birth UTC offset");
  if (
    input.longitude !== null
    && (!Number.isFinite(input.longitude) || input.longitude < -180 || input.longitude > 180)
  ) throw new RangeError("Invalid birth longitude");
  const [hour, minute] = input.civilTime === null
    ? [12, 0]
    : input.civilTime.split(":").map(Number);
  return { day, hour, minute, month, year };
}

function pillarOf(pillar: SajuPillar): SymbolicPillar {
  return {
    earthlyBranch: pillar.earthlyBranch,
    heavenlyStem: pillar.heavenlyStem,
  };
}

function sunSignOf(month: number, day: number): SymbolicProfile["sunSign"] {
  const index = day < SUN_SIGN_CUTOVER[month - 1] ? (month + 10) % 12 : month - 1;
  return SUN_SIGNS[index];
}

export function deriveSymbolicProfile(input: BirthMoment): SymbolicProfile {
  const civil = parseBirthMoment(input);
  const locationDefaulted = input.longitude === null || input.utcOffsetMinutes === null;
  const longitude = input.longitude ?? 135;
  const utcOffsetMinutes = input.utcOffsetMinutes ?? 540;
  const instant = birthCivilToInstant(civil, utcOffsetMinutes);
  const result = calculateSaju(instant, false, "male", longitude);
  const pillars = [result.year, result.month, result.day];
  if (input.civilTime !== null) pillars.push(result.hour);

  const counts: Record<FiveElement, number> = {
    [FiveElement.EARTH]: 0,
    [FiveElement.FIRE]: 0,
    [FiveElement.METAL]: 0,
    [FiveElement.WATER]: 0,
    [FiveElement.WOOD]: 0,
  };
  let yin = 0;
  let yang = 0;
  for (const pillar of pillars) {
    counts[STEMS[pillar.heavenlyStem].element as FiveElement] += 1;
    counts[BRANCHES[pillar.earthlyBranch].element as FiveElement] += 1;
    for (const polarity of [STEMS[pillar.heavenlyStem].yinYang, BRANCHES[pillar.earthlyBranch].yinYang]) {
      if (polarity === "YIN") yin += 1;
      else yang += 1;
    }
  }
  const dominant = ELEMENT_ORDER.reduce((best, candidate) =>
    counts[candidate] > counts[best] ? candidate : best,
  );
  const uncertainties: SymbolicProfile["uncertainties"] = [];
  if (input.civilTime === null) uncertainties.push("birth-time-unknown");
  if (locationDefaulted) uncertainties.push("birth-location-defaulted");

  return {
    schema: "oiyo.symbolic-profile",
    schemaVersion: SYMBOLIC_PROFILE_SCHEMA_VERSION,
    source: {
      civilDate: input.civilDate,
      locationStatus: locationDefaulted ? "defaulted" : "confirmed",
      timeStatus: input.civilTime === null ? "unknown" : "known",
    },
    completeness: locationDefaulted
      ? "provisional-location"
      : input.civilTime === null ? "date-only" : "full",
    uncertainties,
    saju: {
      day: pillarOf(result.day),
      hour: input.civilTime === null ? null : pillarOf(result.hour),
      month: pillarOf(result.month),
      year: pillarOf(result.year),
    },
    fiveElements: {
      counts,
      dominant,
      observedCoordinates: input.civilTime === null ? 6 : 8,
    },
    yinYang: { yang, yin },
    chineseZodiac: { branch: result.year.earthlyBranch },
    sunSign: sunSignOf(civil.month, civil.day),
  };
}

function elementRelation(a: FiveElement, b: FiveElement): string {
  if (a === b) return "same";
  const generation: Record<FiveElement, FiveElement> = {
    [FiveElement.WOOD]: FiveElement.FIRE,
    [FiveElement.FIRE]: FiveElement.EARTH,
    [FiveElement.EARTH]: FiveElement.METAL,
    [FiveElement.METAL]: FiveElement.WATER,
    [FiveElement.WATER]: FiveElement.WOOD,
  };
  if (generation[a] === b || generation[b] === a) return "generating-cycle";
  return "controlling-cycle";
}

function zodiacRelation(a: EarthlyBranch, b: EarthlyBranch): string {
  if (a === b) return "same";
  const order = Object.values(BRANCHES).sort((x, y) => x.order - y.order).map((branch) => branch.id);
  const distance = Math.abs(order.indexOf(a) - order.indexOf(b));
  const circularDistance = Math.min(distance, 12 - distance);
  if (circularDistance === 6) return "opposite";
  const trines = [
    new Set<EarthlyBranch>(["JA", "JIN", "SIN"] as EarthlyBranch[]),
    new Set<EarthlyBranch>(["CHUK", "SA", "YU"] as EarthlyBranch[]),
    new Set<EarthlyBranch>(["IN", "O", "SUL"] as EarthlyBranch[]),
    new Set<EarthlyBranch>(["MYO", "MI", "HAE"] as EarthlyBranch[]),
  ];
  return trines.some((group) => group.has(a) && group.has(b)) ? "same-trine" : "distinct";
}

function lens(id: SymbolicCompatibilityLens["id"], relation: string): SymbolicCompatibilityLens {
  return { harmonyIndex: null, id, relation };
}

export function compareSymbolicProfiles(
  a: SymbolicComparisonProfile,
  b: SymbolicComparisonProfile,
): SymbolicCompatibilityReport {
  const yinYangDeltaA = a.yinYang.yang - a.yinYang.yin;
  const yinYangDeltaB = b.yinYang.yang - b.yinYang.yin;
  const yinYangDistance = Math.abs(yinYangDeltaA - yinYangDeltaB);
  const sunRelation = a.sunSign.sign === b.sunSign.sign
    ? "same-sign"
    : a.sunSign.element === b.sunSign.element
      ? "same-element"
      : a.sunSign.modality === b.sunSign.modality ? "same-modality" : "distinct";

  return {
    schema: "oiyo.symbolic-compatibility-report",
    schemaVersion: 1,
    lenses: [
      lens("five-elements", elementRelation(a.fiveElements.dominant, b.fiveElements.dominant)),
      lens("yin-yang", yinYangDistance === 0 ? "same-balance" : yinYangDistance <= 2 ? "near-balance" : "contrasting-balance"),
      lens("chinese-zodiac", zodiacRelation(a.chineseZodiac.branch, b.chineseZodiac.branch)),
      lens("sun-sign", sunRelation),
    ],
    policy: {
      aggregateJudgment: "none",
      harmonyIndexActivation: "human-gated",
      purpose: "reflection-and-entertainment",
    },
  };
}
