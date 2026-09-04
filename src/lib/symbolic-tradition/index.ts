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

/**
 * How each categorical relation renders as a 0-100 index.
 *
 * The ordering follows the tradition each lens comes from — 상생 above 비화
 * above 상극, 삼합 above 충 — and nothing else. These are not measurements,
 * and the bands are deliberately narrow where the tradition does not draw a
 * strong line: two people with contrasting yin-yang balance are read as
 * complementary, not incompatible, so that lens spans 60-75 rather than
 * 35-90.
 *
 * Every relation string the lens functions can return must appear here, and
 * a test asserts that.
 */
const HARMONY_INDEX: Record<CompatibilityLensId, Record<string, number>> = {
  "five-elements": { "generating-cycle": 85, same: 65, "controlling-cycle": 40 },
  "yin-yang": { "same-balance": 75, "near-balance": 70, "contrasting-balance": 60 },
  "chinese-zodiac": { "same-trine": 90, same: 70, distinct: 55, opposite: 35 },
  "sun-sign": { "same-element": 85, "same-sign": 75, "same-modality": 55, distinct: 50 },
  "element-complement": { "deep-mutual": 88, "mutual-complement": 78, "one-way-complement": 62, "no-gap": 58, "shared-gap": 45 },
};

/**
 * 오행 결핍 보완 — "네가 나에게 없는 것을 갖고 있는가".
 *
 * 기존 오행 렌즈는 `dominant`(가장 많은 원소)끼리 상생·상극을 본다. 이쪽은
 * `counts` 가 0인 원소(없는 것)를 본다. 같은 분포에서 나오지만 다른 질문이라
 * 실측 상관이 -0.020 에 그친다(388명·75,078쌍).
 *
 * 관계를 "채웠는가"로만 가르면 55.5% 가 mutual 한 칸에 몰린다. 거의 모두에게
 * "서로를 채운다"고 말하는 건 성찰이 아니라 아첨이다. **몇 칸을 채우는가**로
 * 갈라 깊은 보완이 실제로 드물게 만든다.
 *
 *   one-way 37.0% · deep-mutual 27.9% · mutual 27.6% · shared-gap 6.4% · no-gap 1.0%
 */
const FIVE_ELEMENTS: FiveElement[] = [
  FiveElement.EARTH, FiveElement.FIRE, FiveElement.METAL, FiveElement.WATER, FiveElement.WOOD,
];

function elementComplementRelation(
  a: Record<FiveElement, number>,
  b: Record<FiveElement, number>,
): string {
  const gapsA = FIVE_ELEMENTS.filter((e) => !a[e]);
  const gapsB = FIVE_ELEMENTS.filter((e) => !b[e]);
  if (!gapsA.length && !gapsB.length) return "no-gap";
  const filledA = gapsA.filter((e) => b[e] > 0).length;
  const filledB = gapsB.filter((e) => a[e] > 0).length;
  if (filledA === 0 && filledB === 0) return "shared-gap";
  if (filledA > 0 && filledB > 0) return filledA + filledB >= 3 ? "deep-mutual" : "mutual-complement";
  return "one-way-complement";
}

/**
 * 음양 균형 거리 → 관계.
 *
 * 2026-09-04: 임계가 `0 / ≤2 / 그 외` 였는데 **`near-balance` 가 한 번도 나올
 * 수 없었다.** 60갑자는 양간-양지·음간-음지만 조합하므로 기둥 하나가 양 2 또는
 * 음 2 를 기여한다. 그래서 개인 델타는 항상 짝수(-6·-2·2·6)이고 쌍 거리는
 * 0·4·8·12 만 나온다 — 거리 1~2 는 존재하지 않는다.
 *
 * 388명·75,078쌍 실측 분포: 0 → 31.2% · 4 → 47.1% · 8 → 18.7% · 12 → 3.1%.
 * 임계를 그 분포에 맞춰 가운데 칸이 실제로 쓰이게 했다. 최빈 관계 점유율이
 * 68.8% → 47.1% 로 내려가 오행 다음으로 고른 렌즈가 된다.
 */
function yinYangRelation(distance: number): string {
  if (distance === 0) return "same-balance";
  if (distance <= 4) return "near-balance";
  return "contrasting-balance";
}

function lens(id: SymbolicCompatibilityLens["id"], relation: string): SymbolicCompatibilityLens {
  const harmonyIndex = HARMONY_INDEX[id][relation];
  if (harmonyIndex === undefined) {
    throw new TypeError(`no harmony index for ${id}/${relation}; add it to HARMONY_INDEX`);
  }
  return { harmonyIndex, id, relation };
}

/** Exported for the contract test that walks every relation a lens can emit. */
export const HARMONY_INDEX_TABLE = HARMONY_INDEX;

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
      lens("yin-yang", yinYangRelation(yinYangDistance)),
      lens("chinese-zodiac", zodiacRelation(a.chineseZodiac.branch, b.chineseZodiac.branch)),
      lens("sun-sign", sunRelation),
      lens("element-complement", elementComplementRelation(a.fiveElements.counts, b.fiveElements.counts)),
    ],
    policy: {
      aggregateJudgment: "none",
      harmonyIndexActivation: "human-approved-2026-08-18",
      purpose: "reflection-and-entertainment",
    },
  };
}
