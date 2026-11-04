// 2027 토정비결 작괘.
//
// 계산식(한국민족문화대백과 「토정비결」, encykorea.aks.ac.kr/Article/E0059207):
//   상괘 = (세는 나이 + 당년 태세수) % 8
//   중괘 = (당년 생월 일수[큰달 30·작은달 29] + 당년 생월 월건수) % 6
//   하괘 = (생일 + 당년 생일 일진수) % 3
// 나머지 0은 8·6·3으로 친다(백과 원문에는 없고 통용 설명을 따름).
// 간지수는 천간 甲己9 乙庚8 丙辛7 丁壬6 戊癸5, 지지 子午9 丑未8 寅申7 卯酉6 辰戌5 巳亥4.
//
// 왜 solarlunar 를 쓰지 않는가(2026-11-03 확인): solarlunar 는 중국 달력(UTC+8)이라
// 2027년 정월 초하루를 2/6 로 낸다. 합삭이 2027-02-07 00:56 KST 라 한국 음력은 2/7 이다.
// 12월도 같은 이유로 길이가 다르다. 그래서 2027년 한국 음력 각 달의 시작일을
// Meeus 49장 합삭식(KST)으로 구해 아래에 고정한다. 공개 전 KASI 2027 월력요항과 대조할 것.

const STEM_NUM = [9, 8, 7, 6, 5, 9, 8, 7, 6, 5]; // 甲乙丙丁戊己庚辛壬癸
const BRANCH_NUM = [9, 8, 7, 6, 5, 4, 9, 8, 7, 6, 5, 4]; // 子丑寅卯辰巳午未申酉戌亥
const STEMS = '甲乙丙丁戊己庚辛壬癸';
const BRANCHES = '子丑寅卯辰巳午未申酉戌亥';

export const TOJEONG_YEAR = 2027;
/** 2027 丁未: 丁(6) + 未(8) */
const YEAR_STEM = 3;
const YEAR_BRANCH = 7;

/** 2027년 한국 음력 1~12월 초하루(양력, KST)와 2028년 정월 초하루. 윤달 없음. */
const MONTH_STARTS: [number, number, number][] = [
  [2027, 2, 7], [2027, 3, 8], [2027, 4, 7], [2027, 5, 6], [2027, 6, 5], [2027, 7, 4],
  [2027, 8, 2], [2027, 9, 1], [2027, 9, 30], [2027, 10, 29], [2027, 11, 28], [2027, 12, 28],
  [2028, 1, 27],
];

function jdn(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const Y = y + 4800 - a;
  const M = m + 12 * a - 3;
  return d + Math.floor((153 * M + 2) / 5) + 365 * Y + Math.floor(Y / 4) - Math.floor(Y / 100) + Math.floor(Y / 400) - 32045;
}

/** 甲子=0 인 60갑자 번호. */
function dayCycleIndex(y: number, m: number, d: number): number {
  return (jdn(y, m, d) + 49) % 60;
}

export function lunarMonthDays2027(month: number): number {
  const [a, b] = [MONTH_STARTS[month - 1], MONTH_STARTS[month]];
  return jdn(...b) - jdn(...a);
}

export interface TojeongInput {
  /** 음력 생년 */
  year: number;
  /** 음력 생월 1~12 (윤달생은 본달로 본다) */
  month: number;
  /** 음력 생일 1~30 */
  day: number;
}

export interface TojeongPart {
  value: number;
  sum: number;
  parts: { label: string; value: number }[];
}

export interface TojeongResult {
  code: string;
  upper: TojeongPart;
  middle: TojeongPart;
  lower: TojeongPart;
  age: number;
  monthGanzhi: string;
  dayGanzhi: string;
  /** 2027년 그 달이 작은달이라 생일 30일을 29일로 본 경우 */
  dayClamped: boolean;
}

function ganzhi(stem: number, branch: number): string {
  return STEMS[stem] + BRANCHES[branch];
}

function rem(n: number, d: number): number {
  const r = n % d;
  return r === 0 ? d : r;
}

export function castTojeong(input: TojeongInput): TojeongResult {
  const { year, month, day } = input;
  if (!Number.isInteger(month) || month < 1 || month > 12) throw new RangeError('month');
  if (!Number.isInteger(day) || day < 1 || day > 30) throw new RangeError('day');
  const age = TOJEONG_YEAR - year + 1;
  if (!Number.isInteger(age) || age < 1 || age > 130) throw new RangeError('year');

  const taese = STEM_NUM[YEAR_STEM] + BRANCH_NUM[YEAR_BRANCH];
  const upperSum = age + taese;

  // 丁년 정월은 壬寅. 달마다 천간·지지가 하나씩 나아간다.
  const mStem = (8 + month - 1) % 10;
  const mBranch = (2 + month - 1) % 12;
  const monthDays = lunarMonthDays2027(month);
  const wolgeon = STEM_NUM[mStem] + BRANCH_NUM[mBranch];
  const middleSum = monthDays + wolgeon;

  const dayClamped = day > monthDays;
  const d = Math.min(day, monthDays);
  const [sy, sm, sd] = MONTH_STARTS[month - 1];
  const cycle = (dayCycleIndex(sy, sm, sd) + d - 1) % 60;
  const dStem = cycle % 10;
  const dBranch = cycle % 12;
  const iljin = STEM_NUM[dStem] + BRANCH_NUM[dBranch];
  const lowerSum = day + iljin;

  const upper = { value: rem(upperSum, 8), sum: upperSum, parts: [{ label: 'age', value: age }, { label: 'taese', value: taese }] };
  const middle = { value: rem(middleSum, 6), sum: middleSum, parts: [{ label: 'monthDays', value: monthDays }, { label: 'wolgeon', value: wolgeon }] };
  const lower = { value: rem(lowerSum, 3), sum: lowerSum, parts: [{ label: 'day', value: day }, { label: 'iljin', value: iljin }] };

  return {
    code: `${upper.value}${middle.value}${lower.value}`,
    upper,
    middle,
    lower,
    age,
    monthGanzhi: ganzhi(mStem, mBranch),
    dayGanzhi: ganzhi(dStem, dBranch),
    dayClamped,
  };
}

/** 테스트용: 양력 날짜의 일진. */
export function dayGanzhiOf(y: number, m: number, d: number): string {
  const c = dayCycleIndex(y, m, d);
  return ganzhi(c % 10, c % 12);
}
