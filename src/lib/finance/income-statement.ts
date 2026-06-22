import type { Locale } from "../../i18n";

// Income-statement builder game data + computation. The player classifies each
// account into the correct line; subtotals (gross/operating/pre-tax/net profit)
// build up step by step. Educational — fixed sample company.

export type LStr = Partial<Record<Locale, string>>;

export type LineId =
  | "revenue"
  | "cogs"
  | "sga"
  | "nonop_income"
  | "nonop_expense"
  | "tax";

export interface AccountItem {
  id: string;
  name: LStr;
  amount: number;
  line: LineId;
}

export const LINES: { id: LineId; label: LStr; sign: "+" | "-" }[] = [
  { id: "revenue", label: { ko: "매출액", en: "Revenue" }, sign: "+" },
  { id: "cogs", label: { ko: "매출원가", en: "Cost of goods sold" }, sign: "-" },
  { id: "sga", label: { ko: "판매비와관리비", en: "SG&A expenses" }, sign: "-" },
  { id: "nonop_income", label: { ko: "영업외수익", en: "Non-operating income" }, sign: "+" },
  { id: "nonop_expense", label: { ko: "영업외비용", en: "Non-operating expense" }, sign: "-" },
  { id: "tax", label: { ko: "법인세비용", en: "Income tax expense" }, sign: "-" },
];

// Sample company (one fiscal year).
export const ACCOUNT_ITEMS: AccountItem[] = [
  { id: "sales", name: { ko: "제품 매출", en: "Product sales" }, amount: 100_000_000, line: "revenue" },
  { id: "cogs", name: { ko: "매출원가", en: "Cost of goods sold" }, amount: 60_000_000, line: "cogs" },
  { id: "salary", name: { ko: "직원 급여", en: "Staff salaries" }, amount: 15_000_000, line: "sga" },
  { id: "rent", name: { ko: "사무실 임차료", en: "Office rent" }, amount: 5_000_000, line: "sga" },
  { id: "ad", name: { ko: "광고선전비", en: "Advertising" }, amount: 3_000_000, line: "sga" },
  { id: "interest_income", name: { ko: "은행 이자수익", en: "Bank interest income" }, amount: 1_000_000, line: "nonop_income" },
  { id: "interest_expense", name: { ko: "차입금 이자비용", en: "Loan interest expense" }, amount: 2_000_000, line: "nonop_expense" },
  { id: "corp_tax", name: { ko: "법인세비용", en: "Income tax expense" }, amount: 3_200_000, line: "tax" },
];

export interface Subtotals {
  grossProfit: number; // 매출총이익
  operatingProfit: number; // 영업이익
  pretaxProfit: number; // 법인세차감전순이익
  netProfit: number; // 당기순이익
}

export const SUBTOTAL_LABELS: { key: keyof Subtotals; label: LStr; formula: LStr }[] = [
  { key: "grossProfit", label: { ko: "매출총이익", en: "Gross profit" }, formula: { ko: "매출액 − 매출원가", en: "Revenue − COGS" } },
  { key: "operatingProfit", label: { ko: "영업이익", en: "Operating profit" }, formula: { ko: "매출총이익 − 판관비", en: "Gross − SG&A" } },
  { key: "pretaxProfit", label: { ko: "법인세차감전순이익", en: "Pre-tax profit" }, formula: { ko: "영업이익 + 영업외수익 − 영업외비용", en: "Operating + non-op income − non-op expense" } },
  { key: "netProfit", label: { ko: "당기순이익", en: "Net profit" }, formula: { ko: "법인세차감전순이익 − 법인세", en: "Pre-tax − tax" } },
];

export function sumLine(items: AccountItem[], line: LineId): number {
  return items.filter((i) => i.line === line).reduce((s, i) => s + i.amount, 0);
}

export function computeSubtotals(items: AccountItem[]): Subtotals {
  const revenue = sumLine(items, "revenue");
  const cogs = sumLine(items, "cogs");
  const sga = sumLine(items, "sga");
  const nonIn = sumLine(items, "nonop_income");
  const nonEx = sumLine(items, "nonop_expense");
  const tax = sumLine(items, "tax");
  const grossProfit = revenue - cogs;
  const operatingProfit = grossProfit - sga;
  const pretaxProfit = operatingProfit + nonIn - nonEx;
  const netProfit = pretaxProfit - tax;
  return { grossProfit, operatingProfit, pretaxProfit, netProfit };
}

export function __verifyIncomeStatement(): boolean {
  const s = computeSubtotals(ACCOUNT_ITEMS);
  return (
    s.grossProfit === 40_000_000 &&
    s.operatingProfit === 17_000_000 &&
    s.pretaxProfit === 16_000_000 &&
    s.netProfit === 12_800_000
  );
}
