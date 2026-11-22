/**
 * 2027 달력 데이터 (빌드 때 계산, 클라이언트 번들 없음).
 *
 * - 공휴일: 「관공서의 공휴일에 관한 규정」 + 대체공휴일. tools-oiyo src/lib/kr-calendar.mjs(2027 음력 공휴일 픽스처,
 *   2026년부터 노동절·제헌절)와 같은 규칙을 TS로 옮겼다. 음력 공휴일은 아래 음력 계산과 테스트로 대조한다.
 * - 24절기: astronomy-engine으로 태양 황경 15° 배수 통과 시각(KST).
 * - 음력: 합삭(KST 날짜)을 초하루로, 중기(황경 30° 배수)를 품은 달에 달 번호를 매긴다(없으면 윤달).
 *   한국천문연구원 역서와 같은 원리이며, 설·부처님오신날·추석 날짜로 테스트한다.
 * 2026-11-22 다음 작업 2차 #3.
 */
import * as Astronomy from 'astronomy-engine';

export const YEAR = 2027;
const KST_MS = 9 * 3600_000;

export type Holiday = { date: string; name: string; substitute: boolean };
export type SolarTerm = { date: string; time: string; name: string; lon: number };
export type LunarDate = { month: number; day: number; leap: boolean };

const kstDate = (d: Date) => new Date(d.getTime() + KST_MS).toISOString().slice(0, 10);
const kstTime = (d: Date) => new Date(d.getTime() + KST_MS).toISOString().slice(11, 16);
const iso = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10);
const dow = (date: string) => new Date(`${date}T00:00:00Z`).getUTCDay();
const addDays = (date: string, n: number) => new Date(Date.parse(`${date}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

/* ---------------- 24절기 ---------------- */
const TERM_NAMES: Record<number, string> = {
  285: '소한', 300: '대한', 315: '입춘', 330: '우수', 345: '경칩', 0: '춘분', 15: '청명', 30: '곡우', 45: '입하', 60: '소만', 75: '망종', 90: '하지',
  105: '소서', 120: '대서', 135: '입추', 150: '처서', 165: '백로', 180: '추분', 195: '한로', 210: '상강', 225: '입동', 240: '소설', 255: '대설', 270: '동지',
};

export function solarTerms(year = YEAR): SolarTerm[] {
  const start = new Date(Date.UTC(year - 1, 11, 31, 15));
  const out: SolarTerm[] = [];
  for (const key of Object.keys(TERM_NAMES)) {
    const lon = Number(key);
    const t = Astronomy.SearchSunLongitude(lon, start, 367);
    if (!t) throw new Error(`term ${lon}`);
    const date = kstDate(t.date);
    if (date.startsWith(String(year))) out.push({ date, time: kstTime(t.date), name: TERM_NAMES[lon], lon });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

/* ---------------- 음력 ---------------- */
type LunarMonth = { start: string; month: number; leap: boolean };

function lunarMonths(year = YEAR): LunarMonth[] {
  // 앞뒤 여유를 두고 합삭을 모은다.
  const moons: Date[] = [];
  let t = new Date(Date.UTC(year - 1, 9, 1));
  while (moons.length < 17) {
    const r = Astronomy.SearchMoonPhase(0, t, 40);
    if (!r) throw new Error('new moon');
    moons.push(r.date);
    t = new Date(r.date.getTime() + 86_400_000);
  }
  // 중기(황경 30° 배수) 날짜
  const zhongqi: { date: string; lon: number }[] = [];
  let s = new Date(Date.UTC(year - 1, 8, 1));
  for (let i = 0; i < 18; i++) {
    const lonNow = Astronomy.SunPosition(s).elon;
    const next = (Math.floor(lonNow / 30) + 1) * 30 % 360;
    const r = Astronomy.SearchSunLongitude(next, s, 40);
    if (!r) throw new Error('zhongqi');
    zhongqi.push({ date: kstDate(r.date), lon: next });
    s = new Date(r.date.getTime() + 86_400_000);
  }
  const months: LunarMonth[] = [];
  for (let i = 0; i < moons.length - 1; i++) {
    const start = kstDate(moons[i]);
    const end = kstDate(moons[i + 1]);
    const z = zhongqi.find((q) => q.date >= start && q.date < end);
    if (z) months.push({ start, month: ((z.lon / 30 + 1) % 12) + 1, leap: false });
    else if (months.length) months.push({ start, month: months[months.length - 1].month, leap: true });
  }
  return months;
}

let cachedMonths: LunarMonth[] | null = null;
export function toLunar(date: string): LunarDate {
  cachedMonths ??= lunarMonths();
  let m: LunarMonth | undefined;
  for (const lm of cachedMonths) if (lm.start <= date) m = lm;
  if (!m) throw new Error(`out of range ${date}`);
  const day = Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${m.start}T00:00:00Z`)) / 86_400_000) + 1;
  return { month: m.month, day, leap: m.leap };
}

export function fromLunar(month: number, day: number, year = YEAR): string {
  for (let d = iso(year, 1, 1); d <= iso(year, 12, 31); d = addDays(d, 1)) {
    const l = toLunar(d);
    if (!l.leap && l.month === month && l.day === day) return d;
  }
  throw new Error(`no ${month}/${day}`);
}

/** 이사·혼례에 많이 보는 "손 없는 날": 음력 끝자리 9·0일 */
export const isSonEomneun = (l: LunarDate) => l.day % 10 === 9 || l.day % 10 === 0;

/* ---------------- 공휴일 ---------------- */
const FIXED: { m: number; d: number; name: string; sub: boolean }[] = [
  { m: 1, d: 1, name: '신정', sub: false },
  { m: 3, d: 1, name: '3·1절', sub: true },
  { m: 5, d: 1, name: '노동절', sub: false },
  { m: 5, d: 5, name: '어린이날', sub: true },
  { m: 6, d: 6, name: '현충일', sub: false },
  { m: 7, d: 17, name: '제헌절', sub: true },
  { m: 8, d: 15, name: '광복절', sub: true },
  { m: 10, d: 3, name: '개천절', sub: true },
  { m: 10, d: 9, name: '한글날', sub: true },
  { m: 12, d: 25, name: '기독탄신일', sub: true },
];

export function holidays(year = YEAR): Holiday[] {
  const list: Holiday[] = [];
  const taken = (d: string) => list.some((h) => h.date === d);
  for (const f of FIXED) list.push({ date: iso(year, f.m, f.d), name: f.name, substitute: false });

  const seol = fromLunar(1, 1, year);
  const chuseok = fromLunar(8, 15, year);
  const buddha = fromLunar(4, 8, year);
  const seolDays = [addDays(seol, -1), seol, addDays(seol, 1)];
  const chuseokDays = [addDays(chuseok, -1), chuseok, addDays(chuseok, 1)];
  seolDays.forEach((d, i) => list.push({ date: d, name: i === 1 ? '설날' : '설날 연휴', substitute: false }));
  chuseokDays.forEach((d, i) => list.push({ date: d, name: i === 1 ? '추석' : '추석 연휴', substitute: false }));
  list.push({ date: buddha, name: '부처님오신날', substitute: false });

  const subs: Holiday[] = [];
  const nextFree = (from: string) => {
    let d = addDays(from, 1);
    while (dow(d) === 0 || dow(d) === 6 || taken(d) || subs.some((s) => s.date === d)) d = addDays(d, 1);
    return d;
  };
  // 설·추석: 연휴가 일요일과 겹치거나 다른 공휴일과 겹치면 연휴 다음 첫 비공휴일
  for (const [days, name] of [[seolDays, '설날'], [chuseokDays, '추석']] as const) {
    const overlaps = days.filter((d) => dow(d) === 0 || list.filter((h) => h.date === d).length > 1).length;
    let last = days[2];
    for (let i = 0; i < overlaps; i++) {
      const d = nextFree(last);
      subs.push({ date: d, name: `${name} 대체공휴일`, substitute: true });
      last = d;
    }
  }
  // 대체공휴일 대상 고정 공휴일과 부처님오신날: 토·일 또는 다른 공휴일과 겹치면 다음 첫 비공휴일
  const subTargets = [...FIXED.filter((f) => f.sub).map((f) => ({ date: iso(year, f.m, f.d), name: f.name })), { date: buddha, name: '부처님오신날' }];
  for (const h of subTargets) {
    const clash = dow(h.date) === 0 || dow(h.date) === 6 || list.filter((x) => x.date === h.date).length > 1;
    if (clash) subs.push({ date: nextFree(h.date), name: `${h.name} 대체공휴일`, substitute: true });
  }
  return [...list, ...subs].sort((a, b) => a.date.localeCompare(b.date) || Number(a.substitute) - Number(b.substitute));
}

/* ---------------- 연휴 묶음 ---------------- */
export type Streak = { start: string; end: string; days: number; names: string[] };

/** 주말과 공휴일이 이어지는 3일 이상 연휴 */
export function longWeekends(year = YEAR): Streak[] {
  const hs = holidays(year);
  const off = (d: string) => dow(d) === 0 || dow(d) === 6 || hs.some((h) => h.date === d);
  const out: Streak[] = [];
  let d = iso(year, 1, 1);
  while (d <= iso(year, 12, 31)) {
    if (!off(d)) {
      d = addDays(d, 1);
      continue;
    }
    const start = d;
    while (off(addDays(d, 1)) && addDays(d, 1) <= iso(year, 12, 31)) d = addDays(d, 1);
    const days = (Date.parse(d) - Date.parse(start)) / 86_400_000 + 1;
    const names = [...new Set(hs.filter((h) => h.date >= start && h.date <= d).map((h) => h.name.replace(/ (연휴|대체공휴일)$/, '')))];
    if (days >= 3 && names.length) out.push({ start, end: d, days, names });
    d = addDays(d, 1);
  }
  return out;
}

/* ---------------- 달력 격자 ---------------- */
export type DayCell = {
  date: string;
  day: number;
  dow: number;
  holiday: string | null;
  term: string | null;
  lunar: LunarDate;
  son: boolean;
};

export function monthGrid(month: number, year = YEAR): (DayCell | null)[] {
  const hs = holidays(year);
  const terms = solarTerms(year);
  const first = iso(year, month, 1);
  const len = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (DayCell | null)[] = Array(dow(first)).fill(null);
  for (let day = 1; day <= len; day++) {
    const date = iso(year, month, day);
    const lunar = toLunar(date);
    cells.push({
      date,
      day,
      dow: dow(date),
      holiday: hs.filter((h) => h.date === date).map((h) => h.name).join(' · ') || null,
      term: terms.find((t) => t.date === date)?.name ?? null,
      lunar,
      son: isSonEomneun(lunar),
    });
  }
  while (cells.length % 7) cells.push(null);
  return cells;
}

/** 공휴일이 아닌 세시 명절(음력) */
export function folkDays(year = YEAR): { date: string; name: string }[] {
  return [
    { date: fromLunar(1, 15, year), name: '정월대보름' },
    { date: fromLunar(5, 5, year), name: '단오' },
    { date: fromLunar(7, 7, year), name: '칠석' },
    { date: fromLunar(7, 15, year), name: '백중' },
    { date: fromLunar(9, 9, year), name: '중양절' },
  ];
}

/* ---------------- 손 방향 ---------------- */
export type SonDir = '동' | '남' | '서' | '북' | null;
/** 음력 날짜 끝자리로 손(날 따라 도는 귀신)이 있는 방향: 1·2 동, 3·4 남, 5·6 서, 7·8 북, 9·0 없음 */
export function sonDirection(l: LunarDate): SonDir {
  const d = l.day % 10;
  if (d === 1 || d === 2) return '동';
  if (d === 3 || d === 4) return '남';
  if (d === 5 || d === 6) return '서';
  if (d === 7 || d === 8) return '북';
  return null;
}

export type SonDay = { date: string; dow: number; lunar: LunarDate; holiday: string | null };

/** 해당 해의 손 없는 날 전체 */
export function sonEomneunDays(year = YEAR): SonDay[] {
  const hs = holidays(year);
  const out: SonDay[] = [];
  for (let d = iso(year, 1, 1); d <= iso(year, 12, 31); d = addDays(d, 1)) {
    const lunar = toLunar(d);
    if (isSonEomneun(lunar)) out.push({ date: d, dow: dow(d), lunar, holiday: hs.filter((h) => h.date === d).map((h) => h.name).join(' · ') || null });
  }
  return out;
}
