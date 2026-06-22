// Korean comprehensive income tax (종합소득세) calculation flow — educational.
// Brackets/rules can change; confirm at 홈택스/국세청. As of 2026 (subject to change).

export interface Bracket { upTo: number; rate: number; prog: number } // 누진공제

// 종합소득세 기본세율 (과세표준 구간별, 누진공제 방식)
export const BRACKETS: Bracket[] = [
  { upTo: 14_000_000, rate: 0.06, prog: 0 },
  { upTo: 50_000_000, rate: 0.15, prog: 1_260_000 },
  { upTo: 88_000_000, rate: 0.24, prog: 5_760_000 },
  { upTo: 150_000_000, rate: 0.35, prog: 15_440_000 },
  { upTo: 300_000_000, rate: 0.38, prog: 19_940_000 },
  { upTo: 500_000_000, rate: 0.40, prog: 25_940_000 },
  { upTo: 1_000_000_000, rate: 0.42, prog: 35_940_000 },
  { upTo: Infinity, rate: 0.45, prog: 65_940_000 },
];

export const LOCAL_TAX_RATE = 0.1; // 지방소득세 = 소득세의 10%

export function bracketFor(base: number): Bracket {
  return BRACKETS.find((b) => base <= b.upTo) ?? BRACKETS[BRACKETS.length - 1];
}

export interface IncomeTaxInput {
  income: number; // 종합소득금액
  deductions?: number; // 소득공제
  credits?: number; // 세액공제·감면
  prepaid?: number; // 기납부세액(원천징수·중간예납)
}

export interface IncomeTaxFlow {
  taxableBase: number; // 과세표준
  rate: number; // 적용 한계세율
  prog: number; // 누진공제
  computedTax: number; // 산출세액
  determinedTax: number; // 결정세액 (산출세액 − 세액공제)
  localTax: number; // 지방소득세 (결정세액 × 10%)
  totalWithLocal: number; // 결정세액 + 지방소득세
  payable: number; // 납부할세액 (− 기납부세액). 음수면 환급
  isRefund: boolean;
}

export function computeIncomeTaxFlow(input: IncomeTaxInput): IncomeTaxFlow {
  const deductions = Math.max(0, input.deductions ?? 0);
  const credits = Math.max(0, input.credits ?? 0);
  const prepaid = Math.max(0, input.prepaid ?? 0);

  const taxableBase = Math.max(0, input.income - deductions);
  const b = bracketFor(taxableBase);
  const computedTax = Math.max(0, Math.round(taxableBase * b.rate - b.prog));
  const determinedTax = Math.max(0, computedTax - credits);
  const localTax = Math.round(determinedTax * LOCAL_TAX_RATE);
  const totalWithLocal = determinedTax + localTax;
  const payable = totalWithLocal - prepaid;

  return {
    taxableBase,
    rate: b.rate,
    prog: b.prog,
    computedTax,
    determinedTax,
    localTax,
    totalWithLocal,
    payable,
    isRefund: payable < 0,
  };
}

export function __verifyIncomeTaxFlow(): boolean {
  // 과세표준 5,000만 → 15% 구간: 5000만×0.15 − 126만 = 750만 − 126만 = 624만
  const r = computeIncomeTaxFlow({ income: 50_000_000, deductions: 0 });
  if (r.computedTax !== 6_240_000) return false;
  // 소득공제 반영: 소득 6000만, 공제 1000만 → 과표 5000만 동일
  const r2 = computeIncomeTaxFlow({ income: 60_000_000, deductions: 10_000_000 });
  if (r2.taxableBase !== 50_000_000 || r2.computedTax !== 6_240_000) return false;
  // 기납부 > 결정 → 환급
  const r3 = computeIncomeTaxFlow({ income: 30_000_000, prepaid: 5_000_000 });
  if (!r3.isRefund) return false;
  return true;
}
