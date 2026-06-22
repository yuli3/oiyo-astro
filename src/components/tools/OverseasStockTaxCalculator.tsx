import { useMemo, useState } from "react";
import type { Locale } from "../../i18n";
import {
  computeOverseasStockTax,
  computeRsuTax,
  BASIC_DEDUCTION,
} from "../../lib/tax/overseas-stock";

type LStr = Partial<Record<Locale, string>>;
function t(s: LStr, locale: Locale): string {
  return s[locale] ?? s.en ?? s.ko ?? "";
}

const UI: Record<string, LStr> = {
  modeStock: { ko: "일반 해외주식", en: "Foreign stock" },
  modeRsu: { ko: "RSU (제한조건부주식)", en: "RSU" },
  proceeds: { ko: "양도가액 (매도 시, 원)", en: "Sale proceeds (KRW)" },
  cost: { ko: "취득가액 (원)", en: "Cost basis (KRW)" },
  vesting: { ko: "베스팅 시 가치 (주가×수량, 원)", en: "Value at vesting (KRW)" },
  sale: { ko: "매도 시 가치 (원)", en: "Value at sale (KRW)" },
  expenses: { ko: "필요경비 (수수료 등, 원)", en: "Expenses (fees, KRW)" },
  priorLoss: { ko: "같은 해 다른 해외주식 손실 (원)", en: "Same-year offsetting loss (KRW)" },
  gain: { ko: "양도차익", en: "Capital gain" },
  deduction: { ko: "기본공제 (연 250만)", en: "Basic deduction (₩2.5M/yr)" },
  base: { ko: "과세표준", en: "Taxable base" },
  tax: { ko: "예상 양도소득세 (22%)", en: "Estimated tax (22%)" },
  effective: { ko: "실효세율", en: "Effective rate" },
  vestingIncome: { ko: "베스팅 시 근로소득 (별도 과세)", en: "Vesting employment income (taxed separately)" },
  rsuNote: {
    ko: "RSU는 ① 베스팅 시 시가가 근로소득으로 과세(연말정산·종합소득)되고, ② 그 가치를 취득가로 보아 매도 시 차익에 22% 양도세가 붙습니다.",
    en: "RSU is taxed twice: ① the fair value at vesting is employment income, then ② the gain over that value is taxed at 22% when sold.",
  },
  lossNote: { ko: "차익이 없어 양도세가 발생하지 않습니다(손실은 같은 해 통산 가능).", en: "No gain, so no capital-gains tax (losses can offset within the year)." },
  disclaimer: {
    ko: "교육용 추정치입니다. 세율·공제·신고 규정은 개정될 수 있고 개인 상황에 따라 달라집니다. 실제 신고는 국세청 홈택스 및 세무 전문가를 통해 확인하세요. 확인일: 2026-06.",
    en: "Educational estimate. Rates, deductions and filing rules can change and depend on your situation — verify via Korea's NTS Hometax and a tax professional. As of 2026-06.",
  },
};

function won(n: number): string {
  return new Intl.NumberFormat("ko-KR").format(Math.round(n)) + "원";
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-foreground">{label}</span>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-right text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        placeholder="0"
      />
    </label>
  );
}

export default function OverseasStockTaxCalculator({ locale }: { locale: Locale }) {
  const [mode, setMode] = useState<"stock" | "rsu">("stock");
  const [a, setA] = useState(""); // proceeds / sale
  const [b, setB] = useState(""); // cost / vesting
  const [exp, setExp] = useState("");
  const [loss, setLoss] = useState("");

  const n = (s: string) => Number(s || 0);

  const result = useMemo(() => {
    if (mode === "rsu") {
      return computeRsuTax({ vestingValue: n(b), saleValue: n(a), expenses: n(exp), priorLoss: n(loss) });
    }
    return { vestingIncome: 0, capitalGain: computeOverseasStockTax({ proceeds: n(a), costBasis: n(b), expenses: n(exp), priorLoss: n(loss) }) };
  }, [mode, a, b, exp, loss]);

  const cg = result.capitalGain;

  return (
    <div className="w-full">
      {/* Mode toggle */}
      <div role="tablist" aria-label="mode" className="mb-6 inline-flex rounded-xl border border-border p-1">
        {(["stock", "rsu"] as const).map((mo) => (
          <button
            key={mo}
            role="tab"
            aria-selected={mode === mo}
            onClick={() => setMode(mo)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              mode === mo ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t(mo === "stock" ? UI.modeStock : UI.modeRsu, locale)}
          </button>
        ))}
      </div>

      {mode === "rsu" && (
        <p className="mb-4 rounded-lg bg-muted p-3 text-sm leading-relaxed text-muted-foreground">{t(UI.rsuNote, locale)}</p>
      )}

      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t(mode === "rsu" ? UI.sale : UI.proceeds, locale)} value={a} onChange={setA} />
        <Field label={t(mode === "rsu" ? UI.vesting : UI.cost, locale)} value={b} onChange={setB} />
        <Field label={t(UI.expenses, locale)} value={exp} onChange={setExp} />
        <Field label={t(UI.priorLoss, locale)} value={loss} onChange={setLoss} />
      </div>

      {/* Result */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        {mode === "rsu" && result.vestingIncome > 0 && (
          <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
            <span className="text-sm text-muted-foreground">{t(UI.vestingIncome, locale)}</span>
            <span className="font-semibold">{won(result.vestingIncome)}</span>
          </div>
        )}
        <dl className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">{t(UI.gain, locale)}</dt>
            <dd className={cg.gain < 0 ? "font-semibold text-destructive" : "font-semibold"}>{won(cg.gain)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">{t(UI.deduction, locale)}</dt>
            <dd>− {won(cg.deductionApplied)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">{t(UI.base, locale)}</dt>
            <dd>{won(cg.taxableBase)}</dd>
          </div>
        </dl>
        <div className="mt-3 flex items-center justify-between rounded-xl bg-primary/10 p-4">
          <span className="text-sm font-bold text-primary">{t(UI.tax, locale)}</span>
          <span className="text-xl font-extrabold text-primary">{won(cg.tax)}</span>
        </div>
        {cg.isLoss ? (
          <p className="mt-3 text-xs text-muted-foreground">{t(UI.lossNote, locale)}</p>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">
            {t(UI.effective, locale)}: {(cg.effectiveRate * 100).toFixed(1)}%
          </p>
        )}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">⚠️ {t(UI.disclaimer, locale)}</p>
    </div>
  );
}
