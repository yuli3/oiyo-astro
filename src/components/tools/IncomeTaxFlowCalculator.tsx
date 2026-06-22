import { useMemo, useState } from "react";
import type { Locale } from "../../i18n";
import { computeIncomeTaxFlow } from "../../lib/tax/income-tax-flow";

type LStr = Partial<Record<Locale, string>>;
function t(s: LStr, locale: Locale): string {
  return s[locale] ?? s.en ?? s.ko ?? "";
}
function won(n: number): string {
  return new Intl.NumberFormat("ko-KR").format(Math.round(n)) + "원";
}

const UI: Record<string, LStr> = {
  income: { ko: "종합소득금액 (1년, 원)", en: "Total income (KRW/yr)" },
  deductions: { ko: "소득공제 (원)", en: "Income deductions (KRW)" },
  credits: { ko: "세액공제·감면 (원)", en: "Tax credits (KRW)" },
  prepaid: { ko: "기납부세액 (원천징수·중간예납, 원)", en: "Prepaid tax (withheld, KRW)" },
  base: { ko: "과세표준", en: "Taxable base" },
  baseHint: { ko: "세금을 매기는 기준. 소득금액 − 소득공제. 공제가 클수록 줄어듭니다.", en: "Income − deductions; the amount tax is applied to." },
  computed: { ko: "산출세액", en: "Computed tax" },
  computedHint: { ko: "과세표준 × 세율 − 누진공제. 구간별 누진세율을 적용합니다.", en: "Base × rate − progressive deduction (bracket method)." },
  determined: { ko: "결정세액", en: "Determined tax" },
  determinedHint: { ko: "산출세액 − 세액공제. 최종 확정된 소득세입니다.", en: "Computed tax − credits; the final income tax." },
  local: { ko: "지방소득세 (10%)", en: "Local income tax (10%)" },
  localHint: { ko: "결정세액의 10%가 지방소득세로 추가됩니다.", en: "10% of determined tax, added on top." },
  payable: { ko: "납부할 세액", en: "Tax payable" },
  refund: { ko: "환급액", en: "Refund" },
  payableHint: { ko: "결정세액+지방세 − 기납부세액. 음수면 환급받습니다.", en: "Total − prepaid; negative means a refund." },
  rateLabel: { ko: "적용 한계세율", en: "Marginal rate" },
  disclaimer: {
    ko: "교육용 추정치입니다. 세율·공제·구간은 개정될 수 있고 개인 상황(부양가족·각종 공제)에 따라 크게 달라집니다. 실제 신고는 국세청 홈택스와 세무 전문가를 통해 확인하세요. 확인일: 2026-06.",
    en: "Educational estimate. Brackets, deductions and credits change and depend on your situation — verify via Korea's NTS Hometax and a professional. As of 2026-06.",
  },
};

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-foreground">{label}</span>
      <input
        type="text" inputMode="numeric" value={value} placeholder="0"
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-right text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </label>
  );
}

function Step({ n, label, value, hint, op, emphasize }: { n: number; label: string; value: string; hint: string; op?: string; emphasize?: boolean }) {
  return (
    <li className={`relative rounded-xl border p-4 ${emphasize ? "border-primary bg-primary/10" : "border-border bg-card"}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{n}</span>
          <span className={`font-bold ${emphasize ? "text-primary" : "text-foreground"}`}>{label}</span>
        </div>
        <span className={`tabular-nums font-extrabold ${emphasize ? "text-primary" : "text-foreground"}`}>{value}</span>
      </div>
      {op && <p className="mt-1 pl-8 text-[11px] font-medium text-primary/70">{op}</p>}
      <p className="mt-1 pl-8 text-xs leading-relaxed text-muted-foreground">{hint}</p>
    </li>
  );
}

export default function IncomeTaxFlowCalculator({ locale }: { locale: Locale }) {
  const [income, setIncome] = useState("");
  const [ded, setDed] = useState("");
  const [cred, setCred] = useState("");
  const [pre, setPre] = useState("");
  const n = (s: string) => Number(s || 0);

  const r = useMemo(
    () => computeIncomeTaxFlow({ income: n(income), deductions: n(ded), credits: n(cred), prepaid: n(pre) }),
    [income, ded, cred, pre],
  );

  return (
    <div className="w-full">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t(UI.income, locale)} value={income} onChange={setIncome} />
        <Field label={t(UI.deductions, locale)} value={ded} onChange={setDed} />
        <Field label={t(UI.credits, locale)} value={cred} onChange={setCred} />
        <Field label={t(UI.prepaid, locale)} value={pre} onChange={setPre} />
      </div>

      <ol className="mt-6 space-y-2">
        <Step n={1} label={t(UI.base, locale)} op={`${t(UI.income, locale).split(" (")[0]} − ${t(UI.deductions, locale).split(" (")[0]}`} value={won(r.taxableBase)} hint={t(UI.baseHint, locale)} />
        <Step n={2} label={t(UI.computed, locale)} op={`${t(UI.rateLabel, locale)}: ${(r.rate * 100).toFixed(0)}% (− ${won(r.prog)})`} value={won(r.computedTax)} hint={t(UI.computedHint, locale)} />
        <Step n={3} label={t(UI.determined, locale)} value={won(r.determinedTax)} hint={t(UI.determinedHint, locale)} />
        <Step n={4} label={t(UI.local, locale)} value={won(r.localTax)} hint={t(UI.localHint, locale)} />
        <Step
          n={5}
          label={r.isRefund ? t(UI.refund, locale) : t(UI.payable, locale)}
          value={won(Math.abs(r.payable))}
          hint={t(UI.payableHint, locale)}
          emphasize
        />
      </ol>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">⚠️ {t(UI.disclaimer, locale)}</p>
    </div>
  );
}
