/**
 * 2027年 日本のカレンダー (ビルド時計算、クライアントJSなし).
 *
 * - 祝日: 「国民の祝日に関する法律」. 春分・秋分は astronomy-engine で太陽黄経 0°/180° を通る日(JST).
 *   振替休日(日曜の祝日 → 次の平日)・国民の休日(祝日に挟まれた平日)も法律どおり.
 * - 六曜: 旧暦(月+日) % 6. 旧暦は calendar-2027.ts の天文計算(UTC+9, 日本と同じ時差)をそのまま使う.
 * - 天赦日: 季節(立春・立夏・立秋・立冬で区切る)と日の干支(戊寅・甲午・戊申・甲子).
 * 2026-11-22 次の作業 3次 #2.
 */
import * as Astronomy from 'astronomy-engine';
import { toLunar } from './calendar-2027';

export const JP_YEAR = 2027;
const JST_MS = 9 * 3600_000;
const iso = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10);
const addDays = (date: string, n: number) => new Date(Date.parse(`${date}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
export const jpDow = (date: string) => new Date(`${date}T00:00:00Z`).getUTCDay();
const jst = (d: Date) => new Date(d.getTime() + JST_MS).toISOString().slice(0, 10);

function nthMonday(year: number, month: number, n: number): string {
  let d = iso(year, month, 1);
  while (jpDow(d) !== 1) d = addDays(d, 1);
  return addDays(d, 7 * (n - 1));
}
function sunLonDate(lon: number, year: number): string {
  const t = Astronomy.SearchSunLongitude(lon, new Date(Date.UTC(year, 0, 1)), 366);
  if (!t) throw new Error(`lon ${lon}`);
  return jst(t.date);
}

export type JpHoliday = { date: string; name: string; kind: 'holiday' | 'furikae' | 'kokumin' };

export function jpHolidays(year = JP_YEAR): JpHoliday[] {
  const base: { date: string; name: string }[] = [
    { date: iso(year, 1, 1), name: '元日' },
    { date: nthMonday(year, 1, 2), name: '成人の日' },
    { date: iso(year, 2, 11), name: '建国記念の日' },
    { date: iso(year, 2, 23), name: '天皇誕生日' },
    { date: sunLonDate(0, year), name: '春分の日' },
    { date: iso(year, 4, 29), name: '昭和の日' },
    { date: iso(year, 5, 3), name: '憲法記念日' },
    { date: iso(year, 5, 4), name: 'みどりの日' },
    { date: iso(year, 5, 5), name: 'こどもの日' },
    { date: nthMonday(year, 7, 3), name: '海の日' },
    { date: iso(year, 8, 11), name: '山の日' },
    { date: nthMonday(year, 9, 3), name: '敬老の日' },
    { date: sunLonDate(180, year), name: '秋分の日' },
    { date: nthMonday(year, 10, 2), name: 'スポーツの日' },
    { date: iso(year, 11, 3), name: '文化の日' },
    { date: iso(year, 11, 23), name: '勤労感謝の日' },
  ];
  const isHol = (d: string, list: { date: string }[]) => list.some((h) => h.date === d);
  const out: JpHoliday[] = base.map((h) => ({ ...h, kind: 'holiday' }));
  // 国民の休日: 前後が祝日の平日(日曜・祝日でない日)
  for (const h of base) {
    const mid = addDays(h.date, 1);
    if (isHol(addDays(h.date, 2), base) && !isHol(mid, base) && jpDow(mid) !== 0) out.push({ date: mid, name: '国民の休日', kind: 'kokumin' });
  }
  // 振替休日: 日曜の祝日のあと最初の「祝日でない日」
  for (const h of base) {
    if (jpDow(h.date) !== 0) continue;
    let d = addDays(h.date, 1);
    while (isHol(d, out)) d = addDays(d, 1);
    out.push({ date: d, name: '振替休日', kind: 'furikae' });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

export const ROKUYO = ['大安', '赤口', '先勝', '友引', '先負', '仏滅'] as const;
export type Rokuyo = (typeof ROKUYO)[number];
export function rokuyo(date: string): Rokuyo {
  const l = toLunar(date);
  return ROKUYO[(l.month + l.day) % 6];
}

const STEM = '甲乙丙丁戊己庚辛壬癸';
const BRANCH = '子丑寅卯辰巳午未申酉戌亥';
/** 日の干支. 2000-01-01 は戊午(54番目). */
export function dayKanshi(date: string): string {
  const n = (((Math.round((Date.parse(`${date}T00:00:00Z`) - Date.UTC(2000, 0, 1)) / 86_400_000) + 54) % 60) + 60) % 60;
  return STEM[n % 10] + BRANCH[n % 12];
}

export function tenshabi(year = JP_YEAR): string[] {
  const rs = sunLonDate(315, year);
  const rk = sunLonDate(45, year);
  const ra = sunLonDate(135, year);
  const rw = sunLonDate(225, year);
  const out: string[] = [];
  for (let d = iso(year, 1, 1); d <= iso(year, 12, 31); d = addDays(d, 1)) {
    const g = dayKanshi(d);
    const want = d < rs ? '甲子' : d < rk ? '戊寅' : d < ra ? '甲午' : d < rw ? '戊申' : '甲子';
    if (g === want) out.push(d);
  }
  return out;
}

export type JpDay = { date: string; day: number; dow: number; holiday: string | null; rokuyo: Rokuyo; tensha: boolean };
export function jpMonthGrid(month: number, year = JP_YEAR): (JpDay | null)[] {
  const hs = jpHolidays(year);
  const ts = new Set(tenshabi(year));
  const first = iso(year, month, 1);
  const len = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (JpDay | null)[] = Array(jpDow(first)).fill(null);
  for (let day = 1; day <= len; day++) {
    const date = iso(year, month, day);
    cells.push({ date, day, dow: jpDow(date), holiday: hs.find((h) => h.date === date)?.name ?? null, rokuyo: rokuyo(date), tensha: ts.has(date) });
  }
  while (cells.length % 7) cells.push(null);
  return cells;
}
