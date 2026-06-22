// Overseas (foreign-listed) stock capital-gains tax for a Korean tax resident.
// Educational estimate only — rates/thresholds/rules can change; confirm at 홈택스/국세청.
//
// Korea (as of 2026, subject to change):
//  - Annual basic deduction (기본공제): KRW 2,500,000 per year.
//  - Flat rate (분류과세): 22% = 20% capital gains + 2% local surtax.
//  - Gains/losses across overseas stock can be netted within the year (손익통산).
//  - Filed in May of the year after the sale (확정신고).
// RSU adds a separate step: at vesting, the fair value is taxed as EMPLOYMENT
// income (근로소득, via payroll) — that vesting value becomes the cost basis for
// the later capital-gains calculation.

export const BASIC_DEDUCTION = 2_500_000;
export const TAX_RATE = 0.22; // 20% + 2% local

export interface OverseasStockInput {
  proceeds: number; // 양도가액 (KRW) — sale price × FX at sale
  costBasis: number; // 취득가액 (KRW) — buy price × FX at buy (for RSU: vesting FMV)
  expenses?: number; // 필요경비 (수수료 등)
  priorLoss?: number; // 같은 해 다른 해외주식 손실(통산)
  deduction?: number;
  rate?: number;
}

export interface OverseasStockResult {
  gain: number; // 양도차익 (after expenses)
  nettedGain: number; // 손실통산 후
  taxableBase: number; // 과세표준 (공제 후, 음수면 0)
  deductionApplied: number;
  tax: number; // 산출세액
  effectiveRate: number; // 세액 / 양도차익
  isLoss: boolean;
}

export function computeOverseasStockTax(input: OverseasStockInput): OverseasStockResult {
  const expenses = Math.max(0, input.expenses ?? 0);
  const priorLoss = Math.max(0, input.priorLoss ?? 0);
  const deduction = input.deduction ?? BASIC_DEDUCTION;
  const rate = input.rate ?? TAX_RATE;

  const gain = input.proceeds - input.costBasis - expenses;
  const nettedGain = gain - priorLoss;
  const taxableBase = Math.max(0, nettedGain - deduction);
  const tax = Math.round(taxableBase * rate);
  const deductionApplied = nettedGain > 0 ? Math.min(deduction, nettedGain) : 0;

  return {
    gain,
    nettedGain,
    taxableBase,
    deductionApplied,
    tax,
    effectiveRate: gain > 0 ? tax / gain : 0,
    isLoss: nettedGain <= 0,
  };
}

// RSU: vesting value taxed as employment income (informational), then capital
// gains on (sale − vesting value).
export interface RsuInput {
  vestingValue: number; // 베스팅 시 시가 × 주식수 (KRW) = 근로소득 & 취득가
  saleValue: number; // 매도 시 가액 (KRW)
  expenses?: number;
  priorLoss?: number;
}

export interface RsuResult {
  vestingIncome: number; // 근로소득으로 과세(연말정산/종합소득) — 안내용
  capitalGain: OverseasStockResult; // 매도 단계 양도세
}

export function computeRsuTax(input: RsuInput): RsuResult {
  return {
    vestingIncome: input.vestingValue,
    capitalGain: computeOverseasStockTax({
      proceeds: input.saleValue,
      costBasis: input.vestingValue,
      expenses: input.expenses,
      priorLoss: input.priorLoss,
    }),
  };
}

export function __verifyOverseasStock(): boolean {
  // 양도가 5000만, 취득가 3000만 → 차익 2000만 − 250만 = 1750만 × 22% = 3,850,000
  const r = computeOverseasStockTax({ proceeds: 50_000_000, costBasis: 30_000_000 });
  if (r.taxableBase !== 17_500_000 || r.tax !== 3_850_000) return false;
  // 손실이면 세금 0
  const loss = computeOverseasStockTax({ proceeds: 10_000_000, costBasis: 12_000_000 });
  if (!loss.isLoss || loss.tax !== 0) return false;
  // 차익이 공제 이하면 세금 0
  const small = computeOverseasStockTax({ proceeds: 11_000_000, costBasis: 9_000_000 });
  if (small.tax !== 0) return false; // 200만 < 250만 공제
  return true;
}
