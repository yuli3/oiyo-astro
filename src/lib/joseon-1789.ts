// Time-slip episode "1789 호적 속 나" (2026-11-13, CHOSEUN picked it on 2026-11-12).
// Design + sources: /mnt/project-files/notes/timeslip-new-ideas-2026-11-12.md section F
// (company-brain copy to follow). Only the status shares, women's register marks,
// height and the 1750 cloth tax are sourced; job weights, names and family are play
// values and the page says so.
import { oneIn, weightedPick } from "./past-life-1426";

export type Status = "yangban" | "sangmin" | "nobi";
export type Sex = "f" | "m";
export const STATUSES: readonly Status[] = ["yangban", "sangmin", "nobi"];

/**
 * Daegu household registers: yangban 37.5% in 1783 and slaves 15.9% in 1789
 * (매일신문 2004 citing the Daegu register study; 한국경제 김재호 2014).
 * Commoners are the remainder. Rounded to whole percents for the draw.
 */
export const STATUS_SHARE: Record<Status, number> = { yangban: 0.38, sangmin: 0.46, nobi: 0.16 };
/** Same registers, for the "how fast yangban grew" panel. */
export const YANGBAN_TREND = [
  { year: 1690, pct: 9.2 },
  { year: 1783, pct: 37.5 },
  { year: 1858, pct: 70.3 },
] as const;
/** 서울대 의대 황영일·신동훈 팀, 15~19세기 유골 116구 넙다리뼈 추정. */
export const HEIGHT_CM: Record<Sex, number> = { m: 161.1, f: 148.9 };

export interface Job {
  id: string;
  hanja: string;
  ko: string;
  /** Authored play weight inside its status and sex. */
  w: number;
}

/** Real register job titles (직역); weights are authored for play. */
export const JOBS: Record<Status, Record<Sex, readonly Job[]>> = {
  yangban: {
    m: [
      { id: "yuhak", hanja: "幼學", ko: "유학", w: 85 },
      { id: "saengwon", hanja: "生員", ko: "생원", w: 10 },
      { id: "chambong", hanja: "前參奉", ko: "전 참봉", w: 5 },
    ],
    f: [
      { id: "cheo", hanja: "妻", ko: "아내", w: 85 },
      { id: "gwabu", hanja: "寡婦", ko: "과부 호주", w: 15 },
    ],
  },
  sangmin: {
    m: [
      { id: "songogun", hanja: "束伍軍", ko: "속오군", w: 25 },
      { id: "bo", hanja: "禁衛保", ko: "금위보", w: 25 },
      { id: "sugun", hanja: "水軍", ko: "수군", w: 10 },
      { id: "gyosaeng", hanja: "校生", ko: "교생", w: 10 },
      { id: "eommu", hanja: "業武", ko: "업무", w: 8 },
      { id: "hyangni", hanja: "鄕吏", ko: "향리", w: 7 },
      { id: "yajang", hanja: "冶匠", ko: "야장", w: 6 },
      { id: "yeokri", hanja: "驛吏", ko: "역리", w: 5 },
      { id: "sagijang", hanja: "沙器匠", ko: "사기장", w: 4 },
    ],
    f: [
      { id: "cheo", hanja: "妻", ko: "아내", w: 85 },
      { id: "gwanyeo", hanja: "寡女", ko: "과녀 호주", w: 15 },
    ],
  },
  nobi: {
    m: [
      { id: "sano", hanja: "私奴", ko: "사노", w: 85 },
      { id: "gwanno", hanja: "官奴", ko: "관노", w: 15 },
    ],
    f: [
      { id: "sabi", hanja: "私婢", ko: "사비", w: 85 },
      { id: "gwanbi", hanja: "官婢", ko: "관비", w: 15 },
    ],
  },
};

export interface Surname {
  hanja: string;
  ko: string;
  w: number;
  bon: readonly { hanja: string; ko: string }[];
}
/** Common surnames and clan seats; weights roughly follow today's surname sizes (play values). */
export const SURNAMES: readonly Surname[] = [
  { hanja: "金", ko: "김", w: 22, bon: [{ hanja: "金海", ko: "김해" }, { hanja: "慶州", ko: "경주" }, { hanja: "安東", ko: "안동" }] },
  { hanja: "李", ko: "이", w: 15, bon: [{ hanja: "全州", ko: "전주" }, { hanja: "慶州", ko: "경주" }, { hanja: "延安", ko: "연안" }] },
  { hanja: "朴", ko: "박", w: 9, bon: [{ hanja: "密陽", ko: "밀양" }, { hanja: "潘南", ko: "반남" }] },
  { hanja: "崔", ko: "최", w: 5, bon: [{ hanja: "慶州", ko: "경주" }, { hanja: "全州", ko: "전주" }] },
  { hanja: "鄭", ko: "정", w: 5, bon: [{ hanja: "東萊", ko: "동래" }, { hanja: "延日", ko: "연일" }] },
  { hanja: "姜", ko: "강", w: 2, bon: [{ hanja: "晉州", ko: "진주" }] },
  { hanja: "趙", ko: "조", w: 2, bon: [{ hanja: "漢陽", ko: "한양" }] },
  { hanja: "尹", ko: "윤", w: 2, bon: [{ hanja: "坡平", ko: "파평" }] },
  { hanja: "張", ko: "장", w: 2, bon: [{ hanja: "仁同", ko: "인동" }] },
  { hanja: "林", ko: "임", w: 1.5, bon: [{ hanja: "羅州", ko: "나주" }] },
];

export interface GivenName {
  hanja: string;
  ko: string;
}
/** Name pools by who would carry them. Women of yangban and commoner houses were not recorded by name. */
export const GIVEN: Record<"yangban" | "sangmin" | "nobiM" | "nobiF", readonly GivenName[]> = {
  yangban: [
    { hanja: "致遠", ko: "치원" }, { hanja: "德純", ko: "덕순" }, { hanja: "時亨", ko: "시형" }, { hanja: "載弘", ko: "재홍" },
    { hanja: "有成", ko: "유성" }, { hanja: "世重", ko: "세중" }, { hanja: "弘澤", ko: "홍택" }, { hanja: "宗益", ko: "종익" },
    { hanja: "汝明", ko: "여명" }, { hanja: "東奎", ko: "동규" }, { hanja: "夏錫", ko: "하석" }, { hanja: "泰運", ko: "태운" },
  ],
  sangmin: [
    { hanja: "莫同", ko: "막동" }, { hanja: "順金", ko: "순금" }, { hanja: "千石", ko: "천석" }, { hanja: "萬石", ko: "만석" },
    { hanja: "福男", ko: "복남" }, { hanja: "永福", ko: "영복" }, { hanja: "貴同", ko: "귀동" }, { hanja: "業同", ko: "업동" },
    { hanja: "七星", ko: "칠성" }, { hanja: "順乭", ko: "순돌" },
  ],
  nobiM: [
    { hanja: "乭伊", ko: "돌이" }, { hanja: "介同", ko: "개동" }, { hanja: "莫金", ko: "막금" }, { hanja: "億萬", ko: "억만" },
    { hanja: "銀金", ko: "은금" }, { hanja: "小斤", ko: "소근" },
  ],
  nobiF: [
    { hanja: "福德", ko: "복덕" }, { hanja: "春梅", ko: "춘매" }, { hanja: "玉梅", ko: "옥매" }, { hanja: "今丹", ko: "금단" },
    { hanja: "介德", ko: "개덕" }, { hanja: "一春", ko: "일춘" }, { hanja: "順德", ko: "순덕" },
  ],
};

/** How a commoner woman's entry was marked: 召史 or 姓 after the surname. */
export type WomanMark = "soshi" | "seong";

export interface Life1789 {
  status: Status;
  sex: Sex;
  job: string;
  /** Age in 1789 (the user's own age when known). */
  age: number;
  surname: number;
  bon: number;
  /** Index into the given-name pool; -1 when the register kept no name. */
  given: number;
  mark: WomanMark | null;
  /** Household number in the register page. */
  household: number;
  spouse: boolean;
  kids: number;
}

export const MIN_AGE = 1;
export const MAX_AGE = 90;

export function givenPool(status: Status, sex: Sex): readonly GivenName[] | null {
  if (status === "nobi") return sex === "m" ? GIVEN.nobiM : GIVEN.nobiF;
  if (sex === "f") return null;
  return status === "yangban" ? GIVEN.yangban : GIVEN.sangmin;
}

export function isChild(age: number) {
  return age < 16;
}

const int = (random: () => number, lo: number, hi: number) => lo + Math.min(hi - lo, Math.floor(random() * (hi - lo + 1)));

/**
 * Draw one person of 1789. `sex` and `age` come from the user when they gave them;
 * otherwise sex is a coin flip and age is 16–60.
 */
export function draw1789(opts: { sex?: Sex; age?: number } = {}, random: () => number = Math.random): Life1789 {
  const status = weightedPick(STATUSES, (s) => STATUS_SHARE[s], random);
  const sex: Sex = opts.sex ?? (random() < 0.5 ? "f" : "m");
  const age = clampAge(opts.age ?? int(random, 16, 60));
  const job = weightedPick(JOBS[status][sex], (j) => j.w, random).id;
  const surname = SURNAMES.indexOf(weightedPick(SURNAMES, (s) => s.w, random));
  const bon = int(random, 0, SURNAMES[surname]!.bon.length - 1);
  const pool = givenPool(status, sex);
  const given = pool ? int(random, 0, pool.length - 1) : -1;
  const mark: WomanMark | null = status === "sangmin" && sex === "f" ? (random() < 0.7 ? "soshi" : "seong") : null;
  const household = int(random, 1, 30);
  // Family is a play value: marriage likelier with age, children grow with it.
  const marryChance = status === "nobi" ? 0.6 : 0.88;
  // A woman listed as 妻 is married by definition; a widow head is not. Otherwise marriage is likelier with age.
  const spouse = isChild(age) || isWidowJob(job) ? false : job === "cheo" ? true : age >= 18 && random() < marryChance;
  const kidsRoll = age < 20 ? int(random, 0, 1) : age < 30 ? int(random, 0, 3) : age < 45 ? int(random, 1, 5) : int(random, 2, 6);
  // No children for the unmarried, so the family line never contradicts itself.
  const kids = isChild(age) || (!spouse && !isWidowJob(job)) ? 0 : kidsRoll;
  return { status, sex, job, age, surname, bon, given, mark, household, spouse, kids };
}

export const isWidowJob = (job: string) => job === "gwabu" || job === "gwanyeo";

export function clampAge(age: number) {
  return Math.max(MIN_AGE, Math.min(MAX_AGE, Math.round(age)));
}

/** Age in full years on `today` for a YYYY-MM-DD birthday. */
export function ageFromBirthday(birthday: string, today: Date = new Date()): number {
  const [y, m, d] = birthday.split("-").map(Number) as [number, number, number];
  let age = today.getUTCFullYear() - y;
  const before = today.getUTCMonth() + 1 < m || (today.getUTCMonth() + 1 === m && today.getUTCDate() < d);
  if (before) age -= 1;
  return clampAge(age);
}

export function jobOf(life: Pick<Life1789, "status" | "sex" | "job">): Job {
  return JOBS[life.status][life.sex].find((j) => j.id === life.job)!;
}

/** Chance of this status + register title. Sex is the user's own pick, so it is left out. */
export function share1789(life: Pick<Life1789, "status" | "sex" | "job">): number {
  const jobs = JOBS[life.status][life.sex];
  const total = jobs.reduce((s, j) => s + j.w, 0);
  return STATUS_SHARE[life.status] * (jobOf(life).w / total);
}
export const oneIn1789 = (life: Pick<Life1789, "status" | "sex" | "job">) => oneIn(share1789(life));

// ── Register line (호적 한 줄) ────────────────────────────────────────────────

const DIGITS = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
/** 1–99 in hanja numerals as registers wrote ages (三十五). */
export function hanjaNumber(n: number): string {
  if (n < 1 || n > 99) return String(n);
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return `${tens === 0 ? "" : tens === 1 ? "十" : `${DIGITS[tens]}十`}${DIGITS[ones]}`;
}

const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
export function ganzhi(year: number): string {
  const i = (((year - 4) % 60) + 60) % 60;
  return `${STEMS[i % 10]}${BRANCHES[i % 12]}`;
}

/** Recorded name: 金致遠, 金氏, 朴召史, 春梅 … */
export function registerName(life: Life1789): { hanja: string; ko: string; named: boolean } {
  const s = SURNAMES[life.surname]!;
  const pool = givenPool(life.status, life.sex);
  const g = pool && life.given >= 0 ? pool[life.given] : undefined;
  if (life.status === "nobi") return { hanja: g!.hanja, ko: g!.ko, named: true };
  if (life.sex === "m") return { hanja: `${s.hanja}${g!.hanja}`, ko: `${s.ko}${g!.ko}`, named: true };
  if (life.status === "yangban") return { hanja: `${s.hanja}氏`, ko: `${s.ko}씨`, named: false };
  return life.mark === "seong"
    ? { hanja: `${s.hanja}姓`, ko: `${s.ko}성`, named: false }
    : { hanja: `${s.hanja}召史`, ko: `${s.ko} 소사`, named: false };
}

/** The register line itself, e.g. 第三戶 幼學 金致遠 年三十五 甲寅生 本金海. */
export function registerLine(life: Life1789): string {
  const job = isChild(life.age) && life.status !== "nobi" ? (life.sex === "m" ? "子" : "女") : jobOf(life).hanja;
  const parts = [`第${hanjaNumber(life.household)}戶`, job, registerName(life).hanja, `年${hanjaNumber(life.age)}`, `${ganzhi(1789 - life.age)}生`];
  if (life.status !== "nobi") parts.push(`本${SURNAMES[life.surname]!.bon[life.bon]!.hanja}`);
  return parts.join(" ");
}

// ── Share link ───────────────────────────────────────────────────────────────

const STATUS_CODE: Record<Status, string> = { yangban: "y", sangmin: "s", nobi: "n" };
const CODE_STATUS: Record<string, Status> = { y: "yangban", s: "sangmin", n: "nobi" };

export function format1789(x: Life1789): string {
  const q = new URLSearchParams({
    s: STATUS_CODE[x.status],
    x: x.sex,
    j: x.job,
    a: String(x.age),
    n: `${x.surname}.${x.bon}.${x.given}`,
    h: String(x.household),
    k: `${x.spouse ? 1 : 0}.${x.kids}`,
  });
  if (x.mark) q.set("m", x.mark);
  return q.toString();
}

export function parse1789(search: string): Life1789 | null {
  const q = new URLSearchParams(search);
  const status = CODE_STATUS[q.get("s") ?? ""];
  const sex = q.get("x");
  if (!status || (sex !== "f" && sex !== "m")) return null;
  const job = q.get("j") ?? "";
  if (!JOBS[status][sex].some((j) => j.id === job)) return null;
  const age = Number(q.get("a"));
  if (!Number.isInteger(age) || age < MIN_AGE || age > MAX_AGE) return null;
  const [surname, bon, given] = (q.get("n") ?? "").split(".").map(Number) as [number, number, number];
  const s = SURNAMES[surname];
  if (!s || !Number.isInteger(bon) || !s.bon[bon]) return null;
  const pool = givenPool(status, sex);
  if (pool ? !(Number.isInteger(given) && given >= 0 && given < pool.length) : given !== -1) return null;
  const household = Number(q.get("h"));
  if (!Number.isInteger(household) || household < 1 || household > 30) return null;
  const [sp, kids] = (q.get("k") ?? "").split(".").map(Number) as [number, number];
  if ((sp !== 0 && sp !== 1) || !Number.isInteger(kids) || kids < 0 || kids > 6) return null;
  const m = q.get("m");
  const mark: WomanMark | null = status === "sangmin" && sex === "f" ? (m === "seong" ? "seong" : "soshi") : null;
  return { status, sex, job, age, surname, bon, given, mark, household, spouse: sp === 1, kids };
}

const ORDER: Record<Status, number> = { yangban: 0, sangmin: 1, nobi: 2 };
export function compare1789(mine: Life1789, friend: Life1789): "me" | "friend" | "same" {
  const a = ORDER[mine.status];
  const b = ORDER[friend.status];
  return a < b ? "me" : a > b ? "friend" : "same";
}
