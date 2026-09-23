/**
 * 모임 전체를 한 덩어리로 읽는다.
 *
 * 렌즈는 두 사람 사이를 본다. 그런데 사람이 넷·다섯이 되면 정작 궁금한 것은
 * 쌍이 아니라 **우리**다 — 이 모임에 어떤 기운이 몰려 있고 무엇이 비었는가,
 * 누가 그 빈자리를 채우는가.
 *
 * 새로 받는 입력은 없다. 원에 이미 들어와 있는 각자의 좌표(오행 분포·음양·
 * 태양궁)를 합쳐서 읽을 뿐이다.
 *
 * 총점도 순위도 만들지 않는다. 이 파일이 내는 것은 "무엇이 많고 무엇이
 * 적은가"라는 관찰이고, 그 관찰이 참인지는 분포에서 직접 확인할 수 있다.
 * 모두에게 "균형이 좋다"고 말하는 판정은 성찰이 아니라 아첨이라, 쏠림과
 * 결핍은 실제로 드물게 잡히도록 문턱을 실측해 정했다(group-synthesis.test).
 */
import { FiveElement } from "../ontology/saju/types";
import type { SymbolicComparisonProfile } from "./types";
import { CELTIC_SEASON, TRINE_GROUPS } from "./index";

export const GROUP_ELEMENT_ORDER: FiveElement[] = [
  FiveElement.WOOD,
  FiveElement.FIRE,
  FiveElement.EARTH,
  FiveElement.METAL,
  FiveElement.WATER,
];

/**
 * 오행 좌표의 실제 기저 비율.
 *
 * 다섯으로 나눈 20% 가 아니다. 지지 열둘 중 넷(辰戌丑未)이 토라 사주 좌표에는
 * 토가 구조적으로 더 자주 나온다. 1900~2020 의 연속 20,000일에서 좌표
 * 120,000개를 세어 확인했다(group-synthesis.test 가 이 값을 다시 잰다).
 *
 * 20% 를 기준으로 삼으면 모임의 29% 에게 "토가 몰렸다"고 말하게 된다 —
 * 달력이 원래 그런 것을 그 모임의 특징이라고 하는 셈이다. 기저 비율을
 * 기준으로 삼아야 "이 모임이 유별나다"가 참이 된다.
 */
const EXPECTED_SHARE: Record<FiveElement, number> = {
  [FiveElement.WOOD]: 0.1845,
  [FiveElement.FIRE]: 0.183,
  [FiveElement.EARTH]: 0.2634,
  [FiveElement.METAL]: 0.1837,
  [FiveElement.WATER]: 0.1854,
};

/**
 * "많다·적다"를 몫의 고정 비율로 재면 안 된다.
 *
 * 처음에는 기준선(20%)의 1.4배·0.6배로 갈랐다. 그러자 2인 모임의 83%가
 * "쏠렸다", 84%가 "이 기운이 몰렸다"로 나왔다. 사람이 둘이면 좌표가 열여섯
 * 뿐이라 우연만으로도 그 정도는 흔들린다 — 거의 모두에게 쏠렸다고 말하는
 * 것은 관찰이 아니다.
 *
 * 그래서 우연이 만들어 낼 흔들림을 기준으로 삼는다. 좌표 T 개가 다섯
 * 원소에 흩어질 때 한 원소의 기대값은 T/5, 표준편차는 √(T·1/5·4/5) 다.
 * 그 표준편차의 몇 배만큼 벗어났는지로 말하면, 사람이 늘어 좌표가 많아질수록
 * 문턱이 저절로 조여든다.
 */
const DEVIATION_FLAG = 1.5;
const DEVIATION_SKEWED = 2;
const DEVIATION_LEANING = 1.2;

/** 기저 비율에서 표준편차 몇 배만큼 벗어났는가. */
function deviations(counts: Record<FiveElement, number>): Record<FiveElement, number> {
  const total = GROUP_ELEMENT_ORDER.reduce((sum, element) => sum + counts[element], 0);
  const out = emptyCounts();
  for (const element of GROUP_ELEMENT_ORDER) {
    const share = EXPECTED_SHARE[element];
    const mean = total * share;
    const sd = Math.sqrt(total * share * (1 - share));
    out[element] = sd > 0 ? (counts[element] - mean) / sd : 0;
  }
  return out;
}

export interface GroupMember {
  id: string;
  label: string;
  profile: SymbolicComparisonProfile;
}

export interface GroupSynthesis {
  /** 모임 전체의 오행 — 구성원의 좌표를 그대로 합한 것 */
  elements: {
    abundant: FiveElement[];
    counts: Record<FiveElement, number>;
    /** 기대값에서 표준편차 몇 배만큼 벗어났는지. 막대 강조에 쓴다. */
    deviation: Record<FiveElement, number>;
    /** 아무도 갖지 않은 원소. 얇은 것과 구분한다 — 없는 것은 채울 사람이 없다. */
    missing: FiveElement[];
    scarce: FiveElement[];
    share: Record<FiveElement, number>;
  };
  /** 모임이 한쪽으로 쏠린 정도 */
  spread: "even" | "leaning" | "skewed";
  /** 음양 */
  polarity: {
    tilt: "balanced" | "yang" | "yin";
    pronounced: boolean;
    yang: number;
    yin: number;
  };
  /** 서양 점성의 원소·양식 쏠림 */
  astro: {
    elements: Record<"air" | "earth" | "fire" | "water", number>;
    modalities: Record<"cardinal" | "fixed" | "mutable", number>;
    topElement: "air" | "earth" | "fire" | "water";
    topModality: "cardinal" | "fixed" | "mutable";
  };
  /**
   * 사람별 기여. 모임에서 얇거나 없는 원소를 이 사람이 갖고 있는가.
   * "이 사람만 갖고 있다"가 참일 때만 sole 이 선다.
   */
  contributions: Array<{
    id: string;
    label: string;
    /** 모임의 얇은 자리 중 이 사람이 채우는 것 */
    supplies: FiveElement[];
    /** 그 원소를 가진 사람이 이 사람뿐인가 */
    sole: FiveElement[];
    /** 오행 밖의 체계에서 모두가 한쪽에 몰렸는데 혼자 다른 칸 (3인 이상) */
    distinctions: Array<{ system: DistinctionSystem; category: string }>;
  }>;
  memberCount: number;
  /**
   * 오행 밖의 체계에서 모임이 한쪽에 몰린 것. 별명은 오행 축에서 나오므로,
   * 다른 축은 여기서 "이 모임은 이런 결도 있다"로 덧붙인다. 몰렸을 때만 선다.
   */
  tags: GroupTag[];
  /** 2인 모임 전용. 사람이 둘이면 "얇다"는 판정이 설 수 없어 다르게 말한다. */
  pair: GroupPair | null;
}

export type DistinctionSystem = "mayanColor" | "zodiacTrine" | "celticSeason" | "lifePath";

export interface GroupTag {
  system: DistinctionSystem;
  /** 체계 안의 칸. 마야는 색 이름, 생명수는 수, 나머지는 0~3 번호 */
  category: string;
  count: number;
}

export interface GroupPair {
  /** 둘 다 가진 기운 */
  shared: FiveElement[];
  /** 한 사람만 가진 기운 — 사람 id 별 */
  only: Record<string, FiveElement[]>;
  /** 둘 다 없는 기운 */
  neither: FiveElement[];
}

/**
 * 사람마다 각 체계에서 어느 칸에 드는가. 셋은 네 칸짜리이고, 생명수는
 * 열두 칸(1~9·11·22·33)에 기저 비율이 고르지 않다. 생명수는 2026-09-22 에
 * 더해 그 전 참가자에게는 없다 — 없으면 undefined.
 */
function categoriesOf(profile: SymbolicComparisonProfile): Record<DistinctionSystem, string | undefined> {
  const trine = TRINE_GROUPS.findIndex((group) => group.includes(profile.chineseZodiac.branch));
  return {
    mayanColor: profile.mayanKin?.color,
    zodiacTrine: String(trine),
    celticSeason: profile.celticTree ? String(CELTIC_SEASON[profile.celticTree.id] ?? 0) : undefined,
    lifePath: profile.lifePath ? String(profile.lifePath) : undefined,
  };
}

const SYSTEMS: DistinctionSystem[] = ["mayanColor", "zodiacTrine", "celticSeason", "lifePath"];

/**
 * 칸마다 한 사람이 거기 들 기저 확률. 1940~1980 연속 14,610일 실측이다
 * (group-synthesis.test 가 다시 잰다). 켈트 겨울만 구간이 길어(11/25~3/17) 크다.
 */
export const CATEGORY_BASE_RATE: Record<DistinctionSystem, Record<string, number>> = {
  mayanColor: { red: 0.25, white: 0.25, blue: 0.25, yellow: 0.25 },
  zodiacTrine: { "0": 0.25, "1": 0.25, "2": 0.25, "3": 0.25 },
  celticSeason: { "0": 0.31, "1": 0.23, "2": 0.23, "3": 0.23 },
  // 생명수는 날짜 숫자의 합이라 칸마다 다르다 — 2 는 마스터 11·22 가 떼어 가서 얇다.
  lifePath: {
    "1": 0.111, "2": 0.046, "3": 0.111, "4": 0.08, "5": 0.111, "6": 0.101,
    "7": 0.111, "8": 0.111, "9": 0.111, "11": 0.065, "22": 0.031, "33": 0.01,
  },
};

/** 이항분포 꼬리 P(X ≥ k), X ~ B(n, p). 모임은 열 명이 상한이라 그대로 센다. */
export function binomialTail(n: number, k: number, p: number): number {
  let total = 0;
  let choose = 1;
  for (let i = 0; i <= n; i += 1) {
    if (i > 0) choose = (choose * (n - i + 1)) / i;
    if (i >= k) total += choose * p ** i * (1 - p) ** (n - i);
  }
  return total;
}

/**
 * 몰렸다고 말하는 문턱. 우연히 그만큼 몰릴 확률이 5% 미만일 때만 선다.
 *
 * 처음에는 "몫 60% 이상, 셋 이상"으로 갈랐다. 그러자 태그가 3인 16%, 5인 80%,
 * 2인 60% 로 인원에 따라 들쭉날쭉했다 — 5인에서 셋이 겹치는 일은 흔하다.
 * 우연의 확률로 재면 인원이 달라도 드문 정도가 같아진다. 오행 쪽이 기저 비율
 * 대비 표준편차로 재는 것과 같은 원리다.
 */
const CONCENTRATION_P = 0.05;

function concentrated(system: DistinctionSystem, category: string, count: number, members: number): boolean {
  // 셋 이상일 때만. 네 칸짜리 체계는 이 문턱이 저절로 걸리지만, 칸이 얇은
  // 생명수는 3인 중 둘만 같아도 확률이 5% 밑으로 내려간다 — 둘은 모임의
  // 쏠림이 아니라 두 사람의 닮음이다.
  //
  // 문턱은 칸 수로 맞춘다. 칸마다 5% 를 대면 칸이 많은 체계일수록 "어느 칸이든
  // 몰렸다"가 잦아진다 — 열두 칸 생명수를 그대로 넣자 8인 모임의 42% 에 생명수
  // 태그가 붙었다(네 칸 마야 10%). 네 칸을 기준으로 5% × 4 ÷ 칸 수를 쓰면 기존
  // 세 체계는 그대로이고 생명수는 1.67% 가 되어 7% 로 내려온다.
  const cells = Object.keys(CATEGORY_BASE_RATE[system]).length;
  return count >= 3 && binomialTail(members, count, CATEGORY_BASE_RATE[system][category] ?? 0.25) < (CONCENTRATION_P * 4) / cells;
}

function emptyCounts(): Record<FiveElement, number> {
  return {
    [FiveElement.WOOD]: 0,
    [FiveElement.FIRE]: 0,
    [FiveElement.EARTH]: 0,
    [FiveElement.METAL]: 0,
    [FiveElement.WATER]: 0,
  };
}

export function synthesizeGroup(members: GroupMember[]): GroupSynthesis {
  const counts = emptyCounts();
  let yang = 0;
  let yin = 0;
  const astroElements = { air: 0, earth: 0, fire: 0, water: 0 };
  const astroModalities = { cardinal: 0, fixed: 0, mutable: 0 };

  for (const member of members) {
    for (const element of GROUP_ELEMENT_ORDER) {
      counts[element] += member.profile.fiveElements.counts[element] ?? 0;
    }
    yang += member.profile.yinYang.yang;
    yin += member.profile.yinYang.yin;
    astroElements[member.profile.sunSign.element] += 1;
    astroModalities[member.profile.sunSign.modality] += 1;
  }

  const total = GROUP_ELEMENT_ORDER.reduce((sum, element) => sum + counts[element], 0);
  const share = emptyCounts();
  for (const element of GROUP_ELEMENT_ORDER) {
    share[element] = total ? counts[element] / total : 0;
  }

  const deviation = deviations(counts);
  const abundant = GROUP_ELEMENT_ORDER.filter((e) => deviation[e] >= DEVIATION_FLAG);
  const missing = GROUP_ELEMENT_ORDER.filter((e) => counts[e] === 0);
  const scarce = GROUP_ELEMENT_ORDER.filter(
    (e) => counts[e] > 0 && deviation[e] <= -DEVIATION_FLAG,
  );

  // 쏠림의 폭도 같은 자로 잰다 — 가장 많이 벗어난 원소가 얼마나 벗어났는가.
  const worst = Math.max(...GROUP_ELEMENT_ORDER.map((e) => Math.abs(deviation[e])));
  const spread = worst >= DEVIATION_SKEWED
    ? "skewed"
    : worst >= DEVIATION_LEANING ? "leaning" : "even";

  const polarityGap = Math.abs(yang - yin) / Math.max(1, yang + yin);
  // 한 기둥의 천간·지지는 극성이 같아서(60갑자) 음양은 기둥 단위로 움직인다.
  // 기둥 하나를 동전 하나로 보고 양·음 기둥 차이를 표준편차로 잰다.
  const pillars = Math.max(1, (yang + yin) / 2);
  const polarityZ = (yang - yin) / 2 / Math.sqrt(pillars);
  const polarity = {
    tilt: polarityGap < 0.15 ? ("balanced" as const) : yang > yin ? ("yang" as const) : ("yin" as const),
    /** 우연으로 보기 어려울 만큼 기울었나 — 별명 아래 한 줄을 여기서 정한다 */
    pronounced: Math.abs(polarityZ) >= 1.5,
    yang,
    yin,
  };

  const thin = new Set([...scarce, ...missing]);
  const holders = new Map<FiveElement, string[]>();
  for (const element of GROUP_ELEMENT_ORDER) {
    holders.set(
      element,
      members.filter((m) => (m.profile.fiveElements.counts[element] ?? 0) > 0).map((m) => m.id),
    );
  }

  // 다른 체계의 분포
  const cats = members.map((member) => categoriesOf(member.profile));
  const tally = Object.fromEntries(SYSTEMS.map((system) => [system, new Map<string, number>()])) as Record<DistinctionSystem, Map<string, number>>;
  // 모두에게 값이 있는 체계만 센다(옛 참가자가 섞이면 생명수는 건너뛴다).
  const systems = SYSTEMS.filter((system) => cats.every((c) => c[system] !== undefined));
  for (const c of cats) for (const system of systems) tally[system].set(c[system]!, (tally[system].get(c[system]!) ?? 0) + 1);

  // 몰린 체계에서 모두가 한 칸인데 한 사람만 바깥이면, 그 사람이 모임에 다른
  // 결을 넣는다. 네 칸짜리 체계에서 "그냥 혼자인 칸"은 3인의 92% 가 해당해
  // 정보가 아니었다 — 모두가 몰렸을 때 혼자 다른 것만 드물고 뜻이 있다.
  const odd = new Map<number, Array<{ system: DistinctionSystem; category: string }>>();
  if (members.length >= 3) {
    for (const system of systems) {
      for (const [category, count] of tally[system]) {
        if (count !== members.length - 1 || !concentrated(system, category, count, members.length)) continue;
        const outsider = cats.findIndex((c) => c[system] !== category);
        if (outsider >= 0) {
          odd.set(outsider, [...(odd.get(outsider) ?? []), { system, category: cats[outsider][system]! }]);
        }
      }
    }
  }

  const contributions = members.map((member, index) => {
    const has = GROUP_ELEMENT_ORDER.filter(
      (e) => (member.profile.fiveElements.counts[e] ?? 0) > 0,
    );
    return {
      id: member.id,
      label: member.label,
      supplies: has.filter((e) => thin.has(e)),
      sole: has.filter((e) => (holders.get(e) ?? []).length === 1),
      distinctions: odd.get(index) ?? [],
    };
  });

  // 2인은 태그를 세우지 않는다 — 둘이 같은 칸인 것은 모임의 쏠림이 아니라 두
  // 사람의 닮음이고, 그건 렌즈(쌍 비교)가 말한다.
  const tags: GroupTag[] = [];
  if (members.length >= 3) {
    for (const system of systems) {
      for (const [category, count] of tally[system]) {
        if (concentrated(system, category, count, members.length)) tags.push({ system, category, count });
      }
    }
  }

  const pair: GroupPair | null = members.length === 2
    ? (() => {
        const [a, b] = members;
        const hasA = (e: FiveElement) => (a.profile.fiveElements.counts[e] ?? 0) > 0;
        const hasB = (e: FiveElement) => (b.profile.fiveElements.counts[e] ?? 0) > 0;
        return {
          shared: GROUP_ELEMENT_ORDER.filter((e) => hasA(e) && hasB(e)),
          only: {
            [a.id]: GROUP_ELEMENT_ORDER.filter((e) => hasA(e) && !hasB(e)),
            [b.id]: GROUP_ELEMENT_ORDER.filter((e) => hasB(e) && !hasA(e)),
          },
          neither: GROUP_ELEMENT_ORDER.filter((e) => !hasA(e) && !hasB(e)),
        };
      })()
    : null;

  const topOf = <K extends string>(record: Record<K, number>, order: K[]): K =>
    order.reduce((best, key) => (record[key] > record[best] ? key : best), order[0]);

  return {
    astro: {
      elements: astroElements,
      modalities: astroModalities,
      topElement: topOf(astroElements, ["fire", "earth", "air", "water"]),
      topModality: topOf(astroModalities, ["cardinal", "fixed", "mutable"]),
    },
    contributions,
    elements: { abundant, counts, deviation, missing, scarce, share },
    memberCount: members.length,
    pair,
    polarity,
    spread,
    tags,
  };
}
