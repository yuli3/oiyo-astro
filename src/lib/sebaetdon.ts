// 2027 설날 세뱃돈 봉투 계획 (ko 전용 세시풍속 시리즈, 2026-11-21 계획 20종 #7).
// 날짜: 설날 2027-02-07(일), 연휴 2/6~2/8 + 일요일 겹침 대체공휴일 2/9(화).
// 근거: tools-oiyo src/lib/kr-calendar.mjs(관보 공휴일 표)와 KASI 2027 월력 자료.
// 금액 "적정선"은 일부러 내지 않는다: 조사마다 다르고 집안마다 달라서, 사용자가 고른 금액만 계산한다.

export const SEOL_YEAR = 2027;
export const SEOL_DATE = { month: 2, day: 7, weekday: '일' } as const;
/** 연휴(대체공휴일 포함) ISO 날짜 */
export const SEOL_HOLIDAYS = ['2027-02-06', '2027-02-07', '2027-02-08', '2027-02-09'] as const;

/** 한국은행 발행 지폐 (원). 큰 것부터. */
export const BILLS = [50000, 10000, 5000, 1000] as const;
export type Bill = (typeof BILLS)[number];

export interface Recipient {
  id: string;
  label: string;
  emoji: string;
}

export const RECIPIENT_GROUPS: readonly Recipient[] = [
  { id: 'preschool', label: '미취학 아이', emoji: '🧒' },
  { id: 'elementary', label: '초등학생', emoji: '🎒' },
  { id: 'teen', label: '중·고등학생', emoji: '📚' },
  { id: 'adult', label: '대학생·사회초년생', emoji: '🎓' },
  { id: 'parents', label: '부모님·어른 (용돈)', emoji: '🙇' },
];

/** 고를 수 있는 봉투 한 장 금액 (원). 기준값이 아니라 고르기 쉬운 단위일 뿐이다. */
export const AMOUNT_CHOICES = [10000, 20000, 30000, 50000, 100000, 200000, 300000, 500000] as const;

export interface PlanRow {
  groupId: string;
  count: number;
  /** 봉투 한 장 금액 (원) */
  amount: number;
}

export type BillCount = Record<Bill, number>;

function emptyBills(): BillCount {
  return { 50000: 0, 10000: 0, 5000: 0, 1000: 0 };
}

/**
 * 봉투 한 장을 지폐로 나눈다. use50k=false 면 5만 원권을 쓰지 않는다(아이에게 1만 원권 여러 장을 주고 싶을 때).
 * 1,000원 단위가 아니면 RangeError.
 */
export function billsFor(amount: number, use50k = true): BillCount {
  if (!Number.isInteger(amount) || amount < 0 || amount % 1000 !== 0) throw new RangeError('amount');
  const out = emptyBills();
  let rest = amount;
  for (const b of BILLS) {
    if (b === 50000 && !use50k) continue;
    out[b] = Math.floor(rest / b);
    rest -= out[b] * b;
  }
  return out;
}

export interface PlanResult {
  envelopes: number;
  total: number;
  /** 은행에서 신권으로 바꿀 장수 */
  bills: BillCount;
  byGroup: { groupId: string; count: number; amount: number; subtotal: number }[];
}

export function planSebaetdon(rows: readonly PlanRow[], use50k = true): PlanResult {
  const bills = emptyBills();
  let total = 0;
  let envelopes = 0;
  const byGroup: PlanResult['byGroup'] = [];
  for (const r of rows) {
    if (!Number.isInteger(r.count) || r.count < 0) throw new RangeError('count');
    if (r.count === 0 || r.amount === 0) continue;
    const per = billsFor(r.amount, use50k);
    for (const b of BILLS) bills[b] += per[b] * r.count;
    const subtotal = r.amount * r.count;
    total += subtotal;
    envelopes += r.count;
    byGroup.push({ groupId: r.groupId, count: r.count, amount: r.amount, subtotal });
  }
  return { envelopes, total, bills, byGroup };
}

export interface Blessing {
  id: string;
  /** 받는 사람 */
  forGroup: 'child' | 'teen' | 'adult' | 'elder';
  line: string;
}

/** 봉투에 쓸 덕담 (OIYO 작성). 정미년 = 붉은 양의 해. */
export const BLESSINGS: readonly Blessing[] = [
  { id: 'c1', forGroup: 'child', line: '양처럼 순하고 튼튼하게, 올해도 키가 쑥쑥 크렴.' },
  { id: 'c2', forGroup: 'child', line: '웃는 날이 우는 날보다 훨씬 많은 한 해 되렴.' },
  { id: 't1', forGroup: 'teen', line: '하고 싶은 걸 하나 찾는 한 해, 조급하지 않게 응원할게.' },
  { id: 't2', forGroup: 'teen', line: '시험보다 네 마음이 먼저야. 잘 자고 잘 먹으렴.' },
  { id: 'a1', forGroup: 'adult', line: '새 출발이 겁나도 괜찮아. 붉은 양의 해, 네 걸음에 불이 붙길.' },
  { id: 'a2', forGroup: 'adult', line: '첫 월급보다 첫 쉼을 먼저 챙기는 한 해 되길.' },
  { id: 'e1', forGroup: 'elder', line: '올해도 건강하게 오래 곁에 계셔 주세요. 감사합니다.' },
  { id: 'e2', forGroup: 'elder', line: '받기만 했던 세배, 올해는 제가 작게나마 돌려드려요.' },
];

export const SEBAETDON_LIMIT =
  '금액은 직접 고른 값으로만 계산해요. "얼마가 적당한지"는 집안마다 달라 정하지 않고, 입력한 것은 이 브라우저 밖으로 보내지 않아요.';

export function won(n: number): string {
  return `${n.toLocaleString('ko-KR')}원`;
}
