import { useMemo, useState } from "react";
import type { Locale } from "../../i18n";
import {
  REINCARNATION_COUNTRIES,
  REINCARNATION_META,
  countryShare,
  displayCountryName,
  pickMany,
  projectOrthographic,
  tallyIso3,
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
  birthChance: { ko: "신생아 기준", en: "If born today", ja: "新生児基準", zh: "按新生儿", fr: "Si né aujourd'hui", es: "Si naciera hoy" },
  popChance: { ko: "인구 기준", en: "If living today", ja: "人口基準", zh: "按人口", fr: "Si vivant aujourd'hui", es: "Si viviera hoy" },
  source: { ko: "출처", en: "Source", ja: "出典", zh: "来源", fr: "Source", es: "Fuente" },
  empty: { ko: "가중치를 고르고 환생해 보세요.", en: "Pick a weight and reincarnate.", ja: "重みを選んで転生してみてください。", zh: "选择权重后投胎。", fr: "Choisissez un poids, puis réincarnez-vous.", es: "Elige un peso y reencarna." },
  spin: { ko: "지구 돌리기", en: "Spin globe", ja: "地球を回す", zh: "转动地球", fr: "Tourner le globe", es: "Girar el globo" },
  compare: { ko: "취향으로 나라 찾기", en: "Find a country by taste", ja: "好みで国を探す", zh: "按喜好找国家", fr: "Trouver un pays par goût", es: "Buscar un país por gusto" },
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

function nameOf(row: Country, locale: Locale): string {
  return displayCountryName(row.iso2, locale, row.name);
}

export default function ReincarnationCountry({ locale }: Props) {
  const [mode, setMode] = useState<WeightMode>("births");
  const [draws, setDraws] = useState(1);
  const [yaw, setYaw] = useState(20);
  const [results, setResults] = useState<Country[]>([]);

  const latest = results[results.length - 1] ?? null;
  const counts = useMemo(() => tallyIso3(results), [results]);
  const hit = useMemo(() => new Set(results.map((row) => row.iso3)), [results]);

  const dots = useMemo(
    () =>
      REINCARNATION_COUNTRIES.flatMap((row) => {
        if (row.lon == null || row.lat == null) return [];
        const point = projectOrthographic(row.lon, row.lat, yaw);
        return point.visible ? [{ ...row, ...point }] : [];
      }),
    [yaw],
  );

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
          onClick={() => setResults(pickMany(mode, draws))}
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
        >
          {results.length ? COPY.again[locale] : COPY.roll[locale]}
        </button>
        <button
          type="button"
          onClick={() => setYaw((value) => (value + 30) % 360)}
          className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600"
        >
          {COPY.spin[locale]}
        </button>
      </div>

      <svg viewBox="0 0 100 70" role="img" aria-label="globe" className="w-full rounded-2xl bg-slate-950">
        <defs>
          <radialGradient id="reincarnation-globe" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#1e3a5f" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="35" r="32" fill="url(#reincarnation-globe)" stroke="#334155" strokeWidth="0.4" />
        {dots.map((dot) => (
          <circle
            key={dot.iso3}
            cx={dot.x}
            cy={dot.y}
            r={hit.has(dot.iso3) ? 1.15 : 0.38}
            fill={hit.has(dot.iso3) ? "#34d399" : "#64748b"}
            opacity={hit.has(dot.iso3) ? 1 : 0.55}
          />
        ))}
      </svg>

      {latest ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-3xl font-black tracking-tight text-slate-900">{nameOf(latest, locale)}</p>
          <dl className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <div>
              <dt className="text-slate-400">{COPY.birthChance[locale]}</dt>
              <dd className="font-semibold">{formatPct(countryShare(latest, "births"), locale)}</dd>
            </div>
            <div>
              <dt className="text-slate-400">{COPY.popChance[locale]}</dt>
              <dd className="font-semibold">{formatPct(countryShare(latest, "population"), locale)}</dd>
            </div>
            <div>
              <dt className="text-slate-400">{COPY.population[locale]}</dt>
              <dd>{formatInt(latest.population, locale)}</dd>
            </div>
            <div>
              <dt className="text-slate-400">{COPY.births[locale]}</dt>
              <dd>{formatInt(latest.births, locale)}</dd>
            </div>
          </dl>
          {results.length > 1 && (
            <ol className="mt-4 grid gap-1 text-sm text-slate-700 sm:grid-cols-2">
              {counts.map((row) => {
                const country = REINCARNATION_COUNTRIES.find((item) => item.iso3 === row.iso3);
                if (!country) return null;
                return (
                  <li key={row.iso3}>
                    {nameOf(country, locale)}
                    {row.count > 1 ? ` ×${row.count}` : ""}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-500">{COPY.empty[locale]}</p>
      )}

      <p className="text-sm">
        <a className="font-semibold text-emerald-700 hover:underline" href={`/${locale}/country/match`}>
          {COPY.compare[locale]}
        </a>
      </p>
      <p className="text-xs leading-relaxed text-slate-400">
        {COPY.source[locale]}: {REINCARNATION_META.source} ({REINCARNATION_META.asOf})
      </p>
    </div>
  );
}
