import { BRANCHES } from "@/manifest/data/saju/branches";
import { STEMS } from "@/manifest/data/saju/stems";
import { calculateBirthSaju } from "@/lib/ontology/saju/birth-contract";
import { calculateCelticTree } from "@/lib/ontology/celtic/calculator";
import { calculateMayanKin } from "@/lib/ontology/mayan/calculator";
import { FiveElement } from "@/lib/ontology/saju/types";
import type { EarthlyBranch, SajuPillar } from "@/lib/ontology/saju/types";
import { createBirthRecord } from "@/lib/user/birth-record";

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
  const resolution = calculateBirthSaju(createBirthRecord({
    civilDate: input.civilDate,
    civilTime: input.civilTime,
    longitude: input.longitude,
    needsConfirmation: locationDefaulted,
    utcOffsetMinutesAtBirth: input.utcOffsetMinutes,
  }));
  if (resolution.status !== "resolved") {
    throw new RangeError("Birth UTC offset is required when birth time is known");
  }
  const result = resolution.standard;
  const pillars = [result.year, result.month, result.day];
  if (result.hour) pillars.push(result.hour);

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
      hour: result.hour ? pillarOf(result.hour) : null,
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
    // 마야·켈트는 이미 쓰고 있는 엔진을 그대로 부른다. 둘 다 날짜만 받는
    // 순수 함수라 출생 시각·도시가 없어도 계산된다. 지역 시간 필드로 Date 를
    // 만드는 것은 두 엔진이 getMonth()/getDate() 로 읽기 때문이다.
    mayanKin: mayanKinOf(civil.year, civil.month, civil.day),
    celticTree: { id: calculateCelticTree(new Date(civil.year, civil.month - 1, civil.day)).id },
    sunSign: sunSignOf(civil.month, civil.day),
  };
}

/**
 * 촐킨 서명. 윤일(2/29)은 엔진이 후납쿠(인장 0·음조 0)로 돌려주는데, 이는
 * 20인장 13음조 어디에도 속하지 않는 특별한 날이다. 관계를 따질 자리가
 * 아니므로 첫 인장·첫 음조로 맺는다 — 없는 값을 지어내는 것보다 낫다.
 */
function mayanKinOf(year: number, month: number, day: number): SymbolicProfile["mayanKin"] {
  const kin = calculateMayanKin(new Date(year, month - 1, day));
  if (!kin || kin.seal.id < 1) return { color: "red", seal: 1, tone: 1 };
  return { color: kin.seal.color, seal: kin.seal.id, tone: kin.tone.number };
}

/** 상생(相生) — 목생화 화생토 토생금 금생수 수생목. */
const GENERATION: Record<FiveElement, FiveElement> = {
  [FiveElement.WOOD]: FiveElement.FIRE,
  [FiveElement.FIRE]: FiveElement.EARTH,
  [FiveElement.EARTH]: FiveElement.METAL,
  [FiveElement.METAL]: FiveElement.WATER,
  [FiveElement.WATER]: FiveElement.WOOD,
};

/** 상극(相剋) — 목극토 토극수 수극화 화극금 금극목. */
const CONTROL: Record<FiveElement, FiveElement> = {
  [FiveElement.WOOD]: FiveElement.EARTH,
  [FiveElement.EARTH]: FiveElement.WATER,
  [FiveElement.WATER]: FiveElement.FIRE,
  [FiveElement.FIRE]: FiveElement.METAL,
  [FiveElement.METAL]: FiveElement.WOOD,
};

function elementRelation(a: FiveElement, b: FiveElement): string {
  if (a === b) return "same";
  if (GENERATION[a] === b || GENERATION[b] === a) return "generating-cycle";
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
  "day-master": { same: 70, generating: 85, controlling: 42 },
  "branch-harmony": { "harmony-rich": 88, "harmony-leaning": 74, mixed: 60, "clash-leaning": 46, "clash-rich": 32 },
  "mayan-kin": { "same-color-near-tone": 86, "same-color-far-tone": 72, "near-color-near-tone": 66, "near-color-far-tone": 58, "opposite-color": 48 },
  "celtic-tree": { "same-tree": 80, "same-season": 70, "facing-season": 56, distinct: 52 },
};

/**
 * 촐킨 — 색 계열과 음조로 본다.
 *
 * 왜 인장 자체가 아닌가: 20인장을 그대로 짝지으면 "같은 인장"이 5%,
 * 드림스펠의 오라클 관계(아날로그·안티포드·오컬트)가 각 5% 안팎이고 나머지
 * 80%가 "그 밖"으로 뭉친다. 최빈 한 칸이 80%면 볼 이유가 없다 — 품질 게이트의
 * 분해능 기준(≤70%)이 정확히 이것을 막는다.
 *
 * 색 계열(적·백·청·황)은 인장 스무 개를 다섯씩 넷으로 나누고 순환한다.
 * 같은 계열 25% · 이웃 계열 50% · 맞은편 계열 25% 로 고르게 갈린다. 여기에
 * 음조(13박) 거리를 겹쳐 다섯 칸으로 만든다.
 */
const MAYAN_COLOR_ORDER = ["red", "white", "blue", "yellow"] as const;

function mayanRelation(
  a: SymbolicComparisonProfile["mayanKin"],
  b: SymbolicComparisonProfile["mayanKin"],
): string {
  const distance = Math.abs(MAYAN_COLOR_ORDER.indexOf(a.color) - MAYAN_COLOR_ORDER.indexOf(b.color));
  const colorGap = Math.min(distance, 4 - distance);
  if (colorGap === 2) return "opposite-color";
  const toneDistance = Math.abs(a.tone - b.tone);
  const toneGap = Math.min(toneDistance, 13 - toneDistance);
  const nearTone = toneGap <= 3;
  if (colorGap === 0) return nearTone ? "same-color-near-tone" : "same-color-far-tone";
  return nearTone ? "near-color-near-tone" : "near-color-far-tone";
}

/**
 * 켈트 수목 사인 — 열넷을 태양력 구간으로 나눈 체계다.
 *
 * 태양궁 렌즈와 같은 태양력을 쓰므로 겹칠 위험이 크다. 겹침을 줄이려고
 * 사인 자체가 아니라 그 사인이 놓인 **계절**로 묶어 본다. 12분할(태양궁)과
 * 14분할(수목)은 경계가 어긋나 계절 배당이 일치하지 않는다.
 */
/** 켈트 계절 번호: 0 겨울 · 1 봄 · 2 여름 · 3 가을. 모임 종합도 이 표를 쓴다. */
export const CELTIC_SEASON: Record<string, number> = {
  birch: 0, rowan: 0, ash: 0,
  alder: 1, willow: 1, hawthorn: 1,
  oak: 2, holly: 2, hazel: 2,
  vine: 3, ivy: 3, reed: 3,
  elder: 0, nameless: 0,
};

function celticRelation(a: string, b: string): string {
  if (a === b) return "same-tree";
  const seasonA = CELTIC_SEASON[a] ?? 0;
  const seasonB = CELTIC_SEASON[b] ?? 0;
  if (seasonA === seasonB) return "same-season";
  const distance = Math.abs(seasonA - seasonB);
  return Math.min(distance, 4 - distance) === 2 ? "facing-season" : "distinct";
}

/**
 * 일간(日干) 관계 — 명리가 궁합의 첫 축으로 삼는 자리.
 *
 * five-elements 렌즈와 무엇이 다른가: 저쪽은 여덟 글자를 세어 **가장 많은**
 * 오행끼리 본다. 이쪽은 **일간 한 글자**만 본다. 명리에서 일간은 그 사람
 * 자신을 가리키는 글자이고, 분포의 최빈값과는 대체로 어긋난다.
 *
 * 방향은 구분하지 않는다. 처음에는 "갑이 병을 생한다"와 그 반대를 다른
 * 칸으로 뒀는데, 렌즈는 대칭이어야 한다는 기존 계약(원의 간선에는 방향이
 * 없다)에 걸렸다. 누가 누구를 받치는지는 간선이 아니라 사람 쪽에 붙일
 * 정보라, 렌즈에서는 뺀다.
 */
function dayMasterRelation(a: FiveElement, b: FiveElement): string {
  if (a === b) return "same";
  if (GENERATION[a] === b || GENERATION[b] === a) return "generating";
  return "controlling";
}

/**
 * 삼합(三合) — 세 지지가 한 조를 이뤄 같은 오행으로 모인다고 보는 네 무리.
 *
 * 왜 육합이 아니라 삼합인가: 처음에는 육합(子丑·寅亥…)과 육충으로 짰는데
 * 음양 렌즈와 상관이 -0.275 나와 품질 게이트에 걸렸다. 육합은 여섯 쌍이
 * 모두 양지-음지 짝이고 육충은 모두 같은 극성이라, 합·충을 세면 사실상
 * 음양 거리를 다시 재는 것이었다 — 같은 말을 두 번 하는 렌즈다.
 * 삼합은 한 무리가 모두 같은 극성이라(申子辰 양, 亥卯未 음) 극성을 타지 않는다.
 *
 * 번호: 0 수(申子辰) · 1 목(亥卯未) · 2 화(寅午戌) · 3 금(巳酉丑). 모임 종합도 이 표를 쓴다.
 */
export const TRINE_GROUPS: EarthlyBranch[][] = ([
  ["SIN", "JA", "JIN"], ["HAE", "MYO", "MI"],
  ["IN", "O", "SUL"], ["SA", "YU", "CHUK"],
] as unknown) as EarthlyBranch[][];

/** 육충(六沖) — 정면으로 부딪친다고 보는 여섯 쌍. 지지 순서로 여섯 칸 거리다. */
const SIX_CLASHES: [EarthlyBranch, EarthlyBranch][] = ([
  ["JA", "O"], ["CHUK", "MI"], ["IN", "SIN"],
  ["MYO", "YU"], ["JIN", "SUL"], ["SA", "HAE"],
] as unknown) as [EarthlyBranch, EarthlyBranch][];

const pairKey = (a: EarthlyBranch, b: EarthlyBranch) => [a, b].sort().join("-");
const TRINE_SET = new Set(
  TRINE_GROUPS.flatMap((group) =>
    group.flatMap((x, i) => group.slice(i + 1).map((y) => pairKey(x, y))),
  ),
);
const CLASH_SET = new Set(SIX_CLASHES.map(([a, b]) => pairKey(a, b)));

/**
 * 지지 합·충 — 네 기둥의 지지를 서로 다 짝지어 본다.
 *
 * chinese-zodiac 렌즈와 무엇이 다른가: 저쪽은 **연지 하나**(띠)만 본다.
 * 이쪽은 **연주를 뺀 나머지 기둥**의 지지를 모두 교차시켜 삼합이 몇 번,
 * 충이 몇 번 걸리는지 센다. 띠가 충이어도 나머지 기둥이 합으로 받치는 경우가
 * 흔한데, 띠만 보면 그 구조가 보이지 않는다.
 *
 * 연주를 빼는 이유는 중복이다. 연지까지 세면 띠 렌즈와 상관이 0.292 로
 * 올라가 품질 게이트에 걸렸다 — 띠는 저 렌즈가 맡는다.
 *
 * 시주가 없으면(출생 시각 미상) 월·일 두 기둥만 쓴다 — 없는 자리를
 * 지어내지 않는다.
 */
function branchHarmonyRelation(
  a: SymbolicComparisonProfile["saju"],
  b: SymbolicComparisonProfile["saju"],
): string {
  const branches = (pillars: SymbolicComparisonProfile["saju"]) =>
    [pillars.month, pillars.day, pillars.hour]
      .filter((pillar): pillar is SymbolicPillar => Boolean(pillar))
      .map((pillar) => pillar.earthlyBranch);
  let harmony = 0;
  let clash = 0;
  for (const x of branches(a)) {
    for (const y of branches(b)) {
      const key = pairKey(x, y);
      if (TRINE_SET.has(key)) harmony += 1;
      else if (CLASH_SET.has(key)) clash += 1;
    }
  }
  const net = harmony - clash;
  if (net >= 2) return "harmony-rich";
  if (net === 1) return "harmony-leaning";
  if (net === 0) return "mixed";
  if (net === -1) return "clash-leaning";
  return "clash-rich";
}


/**
 * 오행 결핍 보완 — "네가 나에게 없는 것을 갖고 있는가".
 *
 * 기존 오행 렌즈는 `dominant`(가장 많은 원소)끼리 상생·상극을 본다. 이쪽은
 * `counts` 가 0인 원소(없는 것)를 본다. 같은 분포에서 나오지만 다른 질문이라
 * 실측 상관이 0.028 에 그친다(388명·75,078쌍).
 *
 * 관계를 "채웠는가"로만 가르면 55.5% 가 mutual 한 칸에 몰린다. 거의 모두에게
 * "서로를 채운다"고 말하는 건 성찰이 아니라 아첨이다. **몇 칸을 채우는가**로
 * 갈라 깊은 보완이 실제로 드물게 만든다.
 *
 *   one-way 39.4% · mutual 27.8% · deep-mutual 24.1% · shared-gap 7.2% · no-gap 1.5%
 *
 * 2026-09-21: 위 두 수치는 표본을 47일 등간격 격자에서 흩뿌린 난수로 바꾼 뒤
 * 다시 잰 값이다(앞선 값은 각각 -0.020, 37.0/27.9/27.6/6.4/1.0 이었다).
 * 격자가 렌즈 주기와 공진해 없는 상관을 만들던 것을 고쳤다 — lens-quality
 * 테스트의 sample() 주석에 경위가 있다. 결론은 바뀌지 않는다.
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
      lens("day-master", dayMasterRelation(
        STEMS[a.saju.day.heavenlyStem].element as FiveElement,
        STEMS[b.saju.day.heavenlyStem].element as FiveElement,
      )),
      lens("branch-harmony", branchHarmonyRelation(a.saju, b.saju)),
      lens("mayan-kin", mayanRelation(a.mayanKin, b.mayanKin)),
      lens("celtic-tree", celticRelation(a.celticTree.id, b.celticTree.id)),
    ],
    policy: {
      aggregateJudgment: "none",
      harmonyIndexActivation: "human-approved-2026-08-18",
      purpose: "reflection-and-entertainment",
    },
  };
}
