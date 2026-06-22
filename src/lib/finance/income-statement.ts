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
  { id: "revenue", label: { ko: "매출액", en: "Revenue", ja: "売上高", zh: "营业收入", fr: "Chiffre d'affaires", es: "Ingresos" }, sign: "+" },
  { id: "cogs", label: { ko: "매출원가", en: "Cost of goods sold", ja: "売上原価", zh: "营业成本", fr: "Coût des ventes", es: "Costo de ventas" }, sign: "-" },
  { id: "sga", label: { ko: "판매비와관리비", en: "SG&A expenses", ja: "販売費及び一般管理費", zh: "销售及管理费用", fr: "Frais généraux (SG&A)", es: "Gastos generales (SG&A)" }, sign: "-" },
  { id: "nonop_income", label: { ko: "영업외수익", en: "Non-operating income", ja: "営業外収益", zh: "营业外收入", fr: "Produits hors exploitation", es: "Ingresos no operativos" }, sign: "+" },
  { id: "nonop_expense", label: { ko: "영업외비용", en: "Non-operating expense", ja: "営業外費用", zh: "营业外支出", fr: "Charges hors exploitation", es: "Gastos no operativos" }, sign: "-" },
  { id: "tax", label: { ko: "법인세비용", en: "Income tax expense", ja: "法人税等", zh: "所得税费用", fr: "Impôt sur les sociétés", es: "Impuesto sobre sociedades" }, sign: "-" },
];

// Sample company (one fiscal year).
export const ACCOUNT_ITEMS: AccountItem[] = [
  { id: "sales", name: { ko: "제품 매출", en: "Product sales", ja: "製品売上", zh: "产品销售", fr: "Ventes de produits", es: "Ventas de productos" }, amount: 100_000_000, line: "revenue" },
  { id: "cogs", name: { ko: "매출원가", en: "Cost of goods sold", ja: "売上原価", zh: "营业成本", fr: "Coût des ventes", es: "Costo de ventas" }, amount: 60_000_000, line: "cogs" },
  { id: "salary", name: { ko: "직원 급여", en: "Staff salaries", ja: "従業員給与", zh: "员工薪资", fr: "Salaires", es: "Salarios" }, amount: 15_000_000, line: "sga" },
  { id: "rent", name: { ko: "사무실 임차료", en: "Office rent", ja: "事務所賃料", zh: "办公室租金", fr: "Loyer de bureau", es: "Alquiler de oficina" }, amount: 5_000_000, line: "sga" },
  { id: "ad", name: { ko: "광고선전비", en: "Advertising", ja: "広告宣伝費", zh: "广告费", fr: "Publicité", es: "Publicidad" }, amount: 3_000_000, line: "sga" },
  { id: "interest_income", name: { ko: "은행 이자수익", en: "Bank interest income", ja: "銀行利息収入", zh: "银行利息收入", fr: "Produits d'intérêts", es: "Ingresos por intereses" }, amount: 1_000_000, line: "nonop_income" },
  { id: "interest_expense", name: { ko: "차입금 이자비용", en: "Loan interest expense", ja: "借入金利息", zh: "借款利息支出", fr: "Charges d'intérêts", es: "Gastos por intereses" }, amount: 2_000_000, line: "nonop_expense" },
  { id: "corp_tax", name: { ko: "법인세비용", en: "Income tax expense", ja: "法人税等", zh: "所得税费用", fr: "Impôt sur les sociétés", es: "Impuesto sobre sociedades" }, amount: 3_200_000, line: "tax" },
];

export interface Subtotals {
  grossProfit: number; // 매출총이익
  operatingProfit: number; // 영업이익
  pretaxProfit: number; // 법인세차감전순이익
  netProfit: number; // 당기순이익
}

export const SUBTOTAL_LABELS: { key: keyof Subtotals; label: LStr; formula: LStr }[] = [
  { key: "grossProfit", label: { ko: "매출총이익", en: "Gross profit", ja: "売上総利益", zh: "毛利润", fr: "Bénéfice brut", es: "Beneficio bruto" }, formula: { ko: "매출액 − 매출원가", en: "Revenue − COGS", ja: "売上高 − 売上原価", zh: "营业收入 − 营业成本", fr: "CA − coût des ventes", es: "Ingresos − costo" } },
  { key: "operatingProfit", label: { ko: "영업이익", en: "Operating profit", ja: "営業利益", zh: "营业利润", fr: "Résultat d'exploitation", es: "Beneficio operativo" }, formula: { ko: "매출총이익 − 판관비", en: "Gross − SG&A", ja: "売上総利益 − 販管費", zh: "毛利润 − 销售管理费用", fr: "Brut − SG&A", es: "Bruto − SG&A" } },
  { key: "pretaxProfit", label: { ko: "법인세차감전순이익", en: "Pre-tax profit", ja: "税引前当期純利益", zh: "税前利润", fr: "Résultat avant impôt", es: "Beneficio antes de impuestos" }, formula: { ko: "영업이익 + 영업외수익 − 영업외비용", en: "Operating + non-op income − non-op expense", ja: "営業利益 + 営業外収益 − 営業外費用", zh: "营业利润 + 营业外收入 − 营业外支出", fr: "Exploitation + produits − charges hors expl.", es: "Operativo + ingresos − gastos no oper." } },
  { key: "netProfit", label: { ko: "당기순이익", en: "Net profit", ja: "当期純利益", zh: "净利润", fr: "Bénéfice net", es: "Beneficio neto" }, formula: { ko: "법인세차감전순이익 − 법인세", en: "Pre-tax − tax", ja: "税引前純利益 − 法人税", zh: "税前利润 − 所得税", fr: "Avant impôt − impôt", es: "Antes de impuestos − impuesto" } },
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
