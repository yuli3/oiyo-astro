import { useMemo, useState } from "react";
import type { Locale } from "../../i18n";
import {
  REINCARNATION_COUNTRIES,
  REINCARNATION_META,
  countryShare,
  pickMany,
  projectLonLat,
  type ReincarnationCountry as Country,
  type WeightMode,
} from "../../lib/reincarnation";

interface Props {
  locale: Locale;
}

const COPY = {
  roll: { ko: "환생하기", en: "Reincarnate", ja: "転生する", zh: "投胎", fr: "Réincarner", es: "Reencarnar" },
  again: { ko: "다시", en: "Again", ja: "もう一度", zh: "再来一次", fr: "Encore", es: "Otra vez" },
  births: { ko: "신생아", en: "Births", ja: "新生児", zh: "新生儿", fr: "Naissances", es: "Nacimientos" },
  population: { ko: "인구", en: "Population", ja: "人口", zh: "人口", fr: "Population", es: "Población" },
  times: { ko: "횟수", en: "Draws", ja: "回数", zh: "次数", fr: "Tirages", es: "Veces" },
  chance: { ko: "이 가중치에서 확률", en: "Chance under this weight", ja: "この重みでの確率", zh: "该权重下的概率", fr: "Probabilité sous ce poids", es: "Probabilidad con este peso" },
  source: { ko: "출처", en: "Source", ja: "出典", zh: "来源", fr: "Source", es: "Fuente" },
  empty: { ko: "가중치를 고르고 환생해 보세요.", en: "Pick a weight and reincarnate.", ja: "重みを選んで転生してみてください。", zh: "选择权重后投胎。", fr: "Choisissez un poids, puis réincarnez-vous.", es: "Elige un peso y reencarna." },
};

function formatInt(n: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : locale).format(n);
}

function formatPct(share: number, locale: Locale): string {
  const pct = share * 100;
  const digits = pct >= 10 ? 1 : pct >= 1 ? 2 : 3;
  return `${new Intl.NumberFormat(locale === "zh" ? "zh-CN" : locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(pct)}%`;
}

export default function ReincarnationCountry({ locale }: Props) {
  const [mode, setMode] = useState<WeightMode>("births");
  const [draws, setDraws] = useState(1);
  const [results, setResults] = useState<Country[]>([]);

  const latest = results[results.length - 1] ?? null;

  const dots = useMemo(
    () =>
      REINCARNATION_COUNTRIES.filter((row) => row.lon != null && row.lat != null).map((row) => ({
        ...row,
        ...projectLonLat(row.lon as number, row.lat as number),
      })),
    [],
  );

  function roll() {
    setResults(pickMany(mode, draws));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 text-sm font-semibold">
          {(["births", "population"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              className={`rounded-full px-3 py-1.5 ${mode === key ? "bg-slate-900 text-white" : "text-slate-600"}`}
            >
              {COPY[key][locale]}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          {COPY.times[locale]}
          <input
            type="number"
            min={1}
            max={20}
            value={draws}
            onChange={(e) => setDraws(Number(e.target.value) || 1)}
            className="w-16 rounded-md border border-slate-200 px-2 py-1"
          />
        </label>
        <button
          type="button"
          onClick={roll}
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
        >
          {results.length ? COPY.again[locale] : COPY.roll[locale]}
        </button>
      </div>

      <svg viewBox="0 0 100 70" role="img" aria-label="world" className="w-full rounded-2xl bg-slate-950">
        <ellipse cx="50" cy="35" rx="47" ry="32" fill="#0f172a" stroke="#334155" strokeWidth="0.4" />
        {dots.map((dot) => {
          const hit = results.some((row) => row.iso3 === dot.iso3);
          return (
            <circle
              key={dot.iso3}
              cx={dot.x}
              cy={dot.y * 0.7}
              r={hit ? 1.1 : 0.35}
              fill={hit ? "#34d399" : "#64748b"}
              opacity={hit ? 1 : 0.55}
            />
          );
        })}
      </svg>

      {latest ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-3xl font-black tracking-tight text-slate-900">{latest.name}</p>
          <p className="mt-2 text-sm text-slate-600">
            {COPY.chance[locale]}: {formatPct(countryShare(latest, mode), locale)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {COPY.population[locale]} {formatInt(latest.population, locale)} · {COPY.births[locale]}{" "}
            {formatInt(latest.births, locale)}
          </p>
          {results.length > 1 && (
            <ol className="mt-4 grid gap-1 text-sm text-slate-700 sm:grid-cols-2">
              {results.map((row, i) => (
                <li key={`${row.iso3}-${i}`}>
                  {i + 1}. {row.name}
                </li>
              ))}
            </ol>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-500">{COPY.empty[locale]}</p>
      )}

      <p className="text-xs leading-relaxed text-slate-400">
        {COPY.source[locale]}: {REINCARNATION_META.source} ({REINCARNATION_META.asOf})
      </p>
    </div>
  );
}
