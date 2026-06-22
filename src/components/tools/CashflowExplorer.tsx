import { useState } from "react";
import type { Locale } from "../../i18n";
import {
  CASHFLOW_MODELS,
  MODEL_CATEGORIES,
  type CashflowModel,
  type LStr,
} from "../../lib/business/cashflow-models";

function t(s: LStr | undefined, locale: Locale): string {
  if (!s) return "";
  return s[locale] ?? s.en ?? s.ko ?? "";
}

const UI: Record<string, LStr> = {
  pick: { ko: "업종을 선택하세요", en: "Pick a business" },
  revenue: { ko: "💰 수익원 (돈이 들어온다)", en: "💰 Revenue (money in)" },
  costs: { ko: "💸 비용 (돈이 나간다)", en: "💸 Costs (money out)" },
  profit: { ko: "📈 순이익은 어디서 나오나", en: "📈 Where the profit comes from" },
  insight: { ko: "🔑 이 사업의 핵심", en: "🔑 The key to this model" },
  flowHint: {
    ko: "수익원 → 사업 → 비용 → 순이익 순서로 돈이 흐릅니다.",
    en: "Money flows: revenue → business → costs → net profit.",
  },
};

export default function CashflowExplorer({ locale }: { locale: Locale }) {
  const [activeId, setActiveId] = useState(CASHFLOW_MODELS[0].id);
  const model = CASHFLOW_MODELS.find((m) => m.id === activeId) as CashflowModel;

  return (
    <div className="w-full">
      {/* Business selector */}
      <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">
        {t(UI.pick, locale)}
      </h2>
      <div
        role="tablist"
        aria-label={t(UI.pick, locale)}
        className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"
      >
        {CASHFLOW_MODELS.map((m) => {
          const active = m.id === activeId;
          return (
            <button
              key={m.id}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveId(m.id)}
              className={`flex flex-col items-center gap-1 rounded-xl border px-3 py-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground hover:border-primary/40"
              }`}
            >
              <span className="text-2xl leading-none" aria-hidden="true">{m.icon}</span>
              <span className="text-xs font-semibold leading-tight">{t(m.name, locale)}</span>
            </button>
          );
        })}
      </div>

      {/* Selected model */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div className="mb-1 flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">{model.icon}</span>
          <div>
            <h3 className="text-xl font-extrabold">{t(model.name, locale)}</h3>
            <p className="text-xs font-medium uppercase tracking-wider text-primary">
              {t(MODEL_CATEGORIES[model.category], locale)}
            </p>
          </div>
        </div>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{t(model.tagline, locale)}</p>

        <p className="sr-only">{t(UI.flowHint, locale)}</p>

        {/* Flow: revenue → business → costs (mobile: stacked, md: 3 columns) */}
        <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-stretch md:gap-2">
          {/* Revenue */}
          <section aria-label={t(UI.revenue, locale)} className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <h4 className="mb-2 text-xs font-bold text-primary">{t(UI.revenue, locale)}</h4>
            <ul className="space-y-2">
              {model.revenue.map((r, i) => (
                <li key={i} className="text-sm">
                  <span className="font-semibold text-foreground">+ {t(r.label, locale)}</span>
                  {r.note && <span className="block text-xs text-muted-foreground">{t(r.note, locale)}</span>}
                </li>
              ))}
            </ul>
          </section>

          {/* Business node + arrows */}
          <div className="flex items-center justify-center md:flex-col md:gap-2">
            <span className="text-2xl text-muted-foreground md:rotate-0" aria-hidden="true">→</span>
            <div className="mx-2 flex flex-col items-center rounded-xl border-2 border-primary bg-primary/10 px-4 py-3 md:my-2">
              <span className="text-2xl" aria-hidden="true">{model.icon}</span>
              <span className="text-[11px] font-bold text-primary">{t(model.name, locale)}</span>
            </div>
            <span className="text-2xl text-muted-foreground" aria-hidden="true">→</span>
          </div>

          {/* Costs */}
          <section aria-label={t(UI.costs, locale)} className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <h4 className="mb-2 text-xs font-bold text-destructive">{t(UI.costs, locale)}</h4>
            <ul className="space-y-2">
              {model.costs.map((c, i) => (
                <li key={i} className="text-sm">
                  <span className="font-semibold text-foreground">− {t(c.label, locale)}</span>
                  {c.note && <span className="block text-xs text-muted-foreground">{t(c.note, locale)}</span>}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Net profit */}
        <div className="mt-3 rounded-xl border border-accent/40 bg-accent/10 p-4">
          <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-accent-foreground">{t(UI.profit, locale)}</h4>
          <p className="text-sm font-medium leading-relaxed text-foreground">{t(model.profit, locale)}</p>
        </div>

        {/* Insight */}
        <div className="mt-3 rounded-xl bg-muted p-4">
          <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t(UI.insight, locale)}</h4>
          <p className="text-sm leading-relaxed text-foreground">{t(model.insight, locale)}</p>
        </div>
      </div>
    </div>
  );
}
