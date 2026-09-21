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

export const GROUP_ELEMENT_ORDER: FiveElement[] = [
  FiveElement.WOOD,
  FiveElement.FIRE,
  FiveElement.EARTH,
  FiveElement.METAL,
  FiveElement.WATER,
];

/** 한 원소가 고르게 나뉘었을 때의 몫. 오행이 다섯이므로 20%다. */
const EVEN_SHARE = 1 / GROUP_ELEMENT_ORDER.length;

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

/** 기대값에서 표준편차 몇 배만큼 벗어났는가. */
function deviations(counts: Record<FiveElement, number>): Record<FiveElement, number> {
  const total = GROUP_ELEMENT_ORDER.reduce((sum, element) => sum + counts[element], 0);
  const mean = total * EVEN_SHARE;
  const sd = Math.sqrt(total * EVEN_SHARE * (1 - EVEN_SHARE));
  const out = emptyCounts();
  for (const element of GROUP_ELEMENT_ORDER) {
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
  }>;
  memberCount: number;
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
  const polarity = {
    tilt: polarityGap < 0.15 ? ("balanced" as const) : yang > yin ? ("yang" as const) : ("yin" as const),
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

  const contributions = members.map((member) => {
    const has = GROUP_ELEMENT_ORDER.filter(
      (e) => (member.profile.fiveElements.counts[e] ?? 0) > 0,
    );
    return {
      id: member.id,
      label: member.label,
      supplies: has.filter((e) => thin.has(e)),
      sole: has.filter((e) => (holders.get(e) ?? []).length === 1),
    };
  });

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
    polarity,
    spread,
  };
}
