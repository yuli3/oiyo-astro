/**
 * "My names in Joseon" (time-slip season 3 #6): 아명 → 관명(항렬자) → 자 → 호.
 *
 * Sources (notes: /mnt/project-files/notes/timeslip-s3-joseon-names-research.md), mostly 한국민족문화대백과사전:
 * - 「이름」: humble 아명 such as 개똥이·쇠똥이·똥개·바우·끝봉이·갑이; women usually had no name beyond the 아명
 *   and were called by surname (○씨부인).
 * - 「항렬」: generation characters follow 오행상생 (木→火→土→金→水), 십간, numbers…, shown by radical/component;
 *   in two-character names the 항렬자 alternates position each generation.
 * - 「자」: given at 관례 (15–20), used instead of the real name (실명경피속). 「호」 often names a place (退溪 from 토계).
 * - Verified examples: 이황 字 景浩 號 退溪 諡 文純; 이이 아명 見龍 字 叔獻 號 栗谷 諡 文成; 고종 아명 命福.
 * Content rule (2026-11-22): no clan (본관) and no real 족보 항렬표 — the element order is the general rule only.
 * The specific characters are illustrative picks containing the right element, not taken from any genealogy.
 */

export type Six = { ko: string; en: string; ja: string; zh: string; fr: string; es: string };
export type Ch = [hanja: string, hangul: string];
export type Sex = "m" | "f";

export const CHILD_NAMES = ["개똥이", "쇠똥이", "똥개", "바우", "끝봉이", "갑이"];

export const SURNAMES: Ch[] = [["金", "김"], ["李", "이"], ["朴", "박"], ["崔", "최"], ["鄭", "정"], ["姜", "강"], ["趙", "조"], ["尹", "윤"], ["張", "장"], ["林", "임"]];

export type Element = { id: "wood" | "fire" | "earth" | "metal" | "water"; hanja: string; chars: Ch[]; name: Six };
export const ELEMENTS: Element[] = [
  { id: "wood", hanja: "木", chars: [["根", "근"], ["植", "식"], ["東", "동"], ["榮", "영"]], name: { ko: "나무(木)", en: "Wood (木)", ja: "木", zh: "木", fr: "Bois (木)", es: "Madera (木)" } },
  { id: "fire", hanja: "火", chars: [["炳", "병"], ["煥", "환"], ["燮", "섭"], ["熙", "희"]], name: { ko: "불(火)", en: "Fire (火)", ja: "火", zh: "火", fr: "Feu (火)", es: "Fuego (火)" } },
  { id: "earth", hanja: "土", chars: [["圭", "규"], ["在", "재"], ["坤", "곤"], ["基", "기"]], name: { ko: "흙(土)", en: "Earth (土)", ja: "土", zh: "土", fr: "Terre (土)", es: "Tierra (土)" } },
  { id: "metal", hanja: "金", chars: [["鍾", "종"], ["鎬", "호"], ["鉉", "현"], ["錫", "석"]], name: { ko: "쇠(金)", en: "Metal (金)", ja: "金", zh: "金", fr: "Métal (金)", es: "Metal (金)" } },
  { id: "water", hanja: "水", chars: [["洙", "수"], ["泳", "영"], ["浩", "호"], ["源", "원"]], name: { ko: "물(水)", en: "Water (水)", ja: "水", zh: "水", fr: "Eau (水)", es: "Agua (水)" } },
];

const GIVEN: Ch[] = [["文", "문"], ["德", "덕"], ["仁", "인"], ["俊", "준"], ["賢", "현"], ["道", "도"], ["明", "명"], ["弘", "홍"], ["遠", "원"], ["和", "화"], ["孝", "효"], ["承", "승"]];
const JA1: Ch[] = [["景", "경"], ["叔", "숙"], ["美", "미"], ["士", "사"], ["子", "자"], ["伯", "백"], ["仲", "중"], ["公", "공"]];
const JA2: Ch[] = [["浩", "호"], ["獻", "헌"], ["庸", "용"], ["元", "원"], ["卿", "경"], ["遠", "원"], ["晦", "회"], ["達", "달"]];
const HO1: Ch[] = [["松", "송"], ["梅", "매"], ["竹", "죽"], ["蘭", "란"], ["鶴", "학"], ["雲", "운"], ["月", "월"], ["石", "석"], ["江", "강"], ["菊", "국"]];
const HO2: Ch[] = [["溪", "계"], ["谷", "곡"], ["山", "산"], ["堂", "당"], ["齋", "재"], ["軒", "헌"], ["亭", "정"], ["村", "촌"]];

export type Names = { sex: Sex; child: number; sur: number; el: number; gen: number; given: number; ja1: number; ja2: number; ho1: number; ho2: number };

export function makeNames(sex: Sex, rand: () => number = Math.random): Names {
  const i = (n: number) => Math.floor(rand() * n);
  return { sex, child: i(CHILD_NAMES.length), sur: i(SURNAMES.length), el: i(ELEMENTS.length), gen: i(4), given: i(GIVEN.length), ja1: i(JA1.length), ja2: i(JA2.length), ho1: i(HO1.length), ho2: i(HO2.length) };
}

/** Generation char goes first or second depending on generation parity (alternating rule). */
export const genFirst = (n: Names) => n.el % 2 === 0;
export const nextElement = (el: number) => (el + 1) % ELEMENTS.length;

const join = (cs: Ch[]) => ({ hanja: cs.map((c) => c[0]).join(""), hangul: cs.map((c) => c[1]).join("") });

export function namesOf(n: Names) {
  const el = ELEMENTS[n.el]!;
  const gen = el.chars[n.gen]!;
  const giv = GIVEN[n.given]!;
  const sur = SURNAMES[n.sur]!;
  const given = join(genFirst(n) ? [gen, giv] : [giv, gen]);
  return {
    child: CHILD_NAMES[n.child]!,
    surname: { hanja: sur[0], hangul: sur[1] },
    formal: { hanja: sur[0] + given.hanja, hangul: sur[1] + given.hangul },
    gen: { hanja: gen[0], hangul: gen[1], element: el },
    ja: join([JA1[n.ja1]!, JA2[n.ja2]!]),
    ho: join([HO1[n.ho1]!, HO2[n.ho2]!]),
    lady: `${sur[1]}씨 부인`,
    childNext: ELEMENTS[nextElement(n.el)]!,
  };
}

const KEYS = ["child", "sur", "el", "gen", "given", "ja1", "ja2", "ho1", "ho2"] as const;
const LEN: Record<(typeof KEYS)[number], number> = { child: CHILD_NAMES.length, sur: SURNAMES.length, el: ELEMENTS.length, gen: 4, given: GIVEN.length, ja1: JA1.length, ja2: JA2.length, ho1: HO1.length, ho2: HO2.length };

export function formatNames(n: Names): string {
  return new URLSearchParams({ x: n.sex, v: KEYS.map((k) => n[k]).join(".") }).toString();
}

export function parseNames(search: string): Names | null {
  const q = new URLSearchParams(search);
  const sex = q.get("x");
  const vals = (q.get("v") ?? "").split(".").map(Number);
  if ((sex !== "m" && sex !== "f") || vals.length !== KEYS.length) return null;
  const out: Record<string, number | string> = { sex };
  for (let k = 0; k < KEYS.length; k += 1) {
    const key = KEYS[k]!, v = vals[k]!;
    if (!Number.isInteger(v) || v < 0 || v >= LEN[key]) return null;
    out[key] = v;
  }
  return out as unknown as Names;
}
