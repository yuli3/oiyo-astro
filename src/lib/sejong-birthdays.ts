// 다른 해의 내 생일 실록 — 세종 재위 32년(1419~1450) 동안 해마다 내 생일(양력, 그레고리력을 거꾸로 늘린 날짜)에
// 『세종실록』에 무엇이 적혔는지. 데이터: public/data/sejong-birthday/MM.json (scripts/build-sejong-birthdays.py).

/** [양력 연도, 재위 연차, 음력 월, 윤달(0/1), 음력 일, 그날 기사 수, 첫 기사 앞부분] */
export type BirthdayRow = [year: number, reign: number, lunarMonth: number, leap: 0 | 1, lunarDay: number, count: number, snippet: string];
export type MonthFile = Record<string, BirthdayRow[]>;

export const FIRST_YEAR = 1419;
export const LAST_YEAR = 1450;
export const SPAN = LAST_YEAR - FIRST_YEAR + 1;

const DIM = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
export type Query = { month: number; day: number };
export const formatQuery = (q: Query) => `m=${q.month}&d=${q.day}`;
export function parseQuery(search: string): Query | null {
  const p = new URLSearchParams(search);
  const month = Number(p.get("m"));
  const day = Number(p.get("d"));
  if (!Number.isInteger(month) || !Number.isInteger(day) || month < 1 || month > 12 || day < 1 || day > DIM[month - 1]!) return null;
  return { month, day };
}

export type Summary = { years: number; entries: number; busiest: BirthdayRow | null; first: BirthdayRow | null; last: BirthdayRow | null };
export function summarize(rows: BirthdayRow[]): Summary {
  let busiest: BirthdayRow | null = null;
  for (const r of rows) if (!busiest || r[5] > busiest[5]) busiest = r;
  return { years: rows.length, entries: rows.reduce((a, r) => a + r[5], 0), busiest, first: rows[0] ?? null, last: rows[rows.length - 1] ?? null };
}

const NUM = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
/** 위키문헌 연도 페이지 제목의 연차(元年, 十一年, 二十年 …). */
export function reignTitle(n: number): string {
  if (n === 1) return "元年";
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  const t = tens === 0 ? "" : tens === 1 ? "十" : `${NUM[tens]}十`;
  return `${t}${ones ? NUM[ones] : ""}年`;
}

export const wikisourceUrl = (r: BirthdayRow) =>
  `https://zh.wikisource.org/wiki/${encodeURIComponent(`朝鮮王朝實錄/世宗實錄/${reignTitle(r[1])}`)}#${encodeURIComponent(`${r[3] ? "閏" : ""}${r[2]}月${r[4]}日`)}`;

/** 그해 있었던 일(널리 알려진 것만). */
export const MILESTONES: Record<number, "hangul" | "hangulOut" | "death" | "jiphyeon" | "rain"> = {
  1420: "jiphyeon",
  1441: "rain",
  1443: "hangul",
  1446: "hangulOut",
  1450: "death",
};
