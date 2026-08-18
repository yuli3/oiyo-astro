import { useEffect, useMemo, useState } from "react";
import type { Locale } from "../../i18n";
import {
  REINCARNATION_COUNTRIES,
  REINCARNATION_META,
  byIso2,
  countryRank,
  countryShare,
  defaultHomeIso2,
  displayCountryName,
  oneIn,
  pickMany,
  ranked,
  tallyIso3,
  vsHome,
  type ReincarnationCountry as Country,
  type WeightMode,
} from "../../lib/reincarnation";
import ReincarnationGlobe from "./ReincarnationGlobe";

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
  empty: { ko: "가중치를 고르고 환생하거나, 나라를 찾아 확률을 보세요.", en: "Pick a weight and reincarnate, or look up a country.", ja: "重みを選んで転生するか、国を検索して確率を見てください。", zh: "选择权重后投胎，或搜索国家看概率。", fr: "Choisissez un poids, ou cherchez un pays.", es: "Elige un peso o busca un país." },
  spin: { ko: "지구 돌리기", en: "Spin globe", ja: "地球を回す", zh: "转动地球", fr: "Tourner le globe", es: "Girar el globo" },
  compare: { ko: "취향으로 나라 찾기", en: "Find a country by taste", ja: "好みで国を探す", zh: "按喜好找国家", fr: "Trouver un pays par goût", es: "Buscar un país por gusto" },
  lookup: { ko: "나라 찾기", en: "Look up a country", ja: "国を探す", zh: "查找国家", fr: "Chercher un pays", es: "Buscar un país" },
  home: { ko: "지금 사는 곳", en: "Where you live now", ja: "いま住んでいる国", zh: "你现在住的地方", fr: "Où vous vivez", es: "Donde vives ahora" },
  rank: { ko: "순위", en: "Rank", ja: "順位", zh: "排名", fr: "Rang", es: "Puesto" },
  oneIn: { ko: "한 명당", en: "One in", ja: "1人あたり", zh: "每", fr: "Un sur", es: "Uno de cada" },
  vs: { ko: "대비", en: "vs", ja: "対", zh: "对比", fr: "contre", es: "frente a" },
  top: { ko: "상위 10", en: "Top 10", ja: "上位10", zh: "前10", fr: "Top 10", es: "Top 10" },
  share: { ko: "공유", en: "Share", ja: "共有", zh: "分享", fr: "Partager", es: "Compartir" },
  copied: { ko: "복사됨", en: "Copied", ja: "コピーしました", zh: "已复制", fr: "Copié", es: "Copiado" },
};

function formatInt(n: number, locale: Locale): string {
  if (!Number.isFinite(n)) return "—";
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

function formatX(n: number, locale: Locale): string {
  return `${new Intl.NumberFormat(locale === "zh" ? "zh-CN" : locale, {
    maximumFractionDigits: n >= 10 ? 0 : 1,
  }).format(n)}×`;
}

function nameOf(row: Country, locale: Locale): string {
  return displayCountryName(row.iso2, locale, row.name);
}

function readQuery(): { mode: WeightMode; iso2?: string } {
  if (typeof window === "undefined") return { mode: "births" };
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode") === "population" ? "population" : "births";
  const iso2 = params.get("c") ?? undefined;
  return { mode, iso2 };
}

export default function ReincarnationCountry({ locale }: Props) {
  const [mode, setMode] = useState<WeightMode>("births");
  const [draws, setDraws] = useState(1);
  const [yaw, setYaw] = useState(20);
  const [results, setResults] = useState<Country[]>([]);
  const [focus, setFocus] = useState<Country | null>(null);
  const [homeIso2, setHomeIso2] = useState(defaultHomeIso2(locale));
  const [query, setQuery] = useState("");
  const [shared, setShared] = useState(false);
  const [ready, setReady] = useState(false);

  const home = byIso2(homeIso2) ?? byIso2("KR")!;
  const latest = results[results.length - 1] ?? focus;
  const counts = useMemo(() => tallyIso3(results), [results]);
  const hitIso3 = useMemo(() => results.map((row) => row.iso3), [results]);
  const top = useMemo(() => ranked(mode).slice(0, 10), [mode]);
  const options = useMemo(
    () =>
      REINCARNATION_COUNTRIES.map((row) => ({
        iso2: row.iso2,
        label: nameOf(row, locale),
      })).sort((a, b) => a.label.localeCompare(b.label, locale === "zh" ? "zh-CN" : locale)),
    [locale],
  );

  useEffect(() => {
    const incoming = readQuery();
    setMode(incoming.mode);
    if (incoming.iso2) setFocus(byIso2(incoming.iso2) ?? null);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (mode !== "births") params.set("mode", mode);
    if (latest) params.set("c", latest.iso2);
    const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
    window.history.replaceState(null, "", next);
  }, [ready, mode, latest?.iso2]);

  function lookUp(value: string) {
    setQuery(value);
    const match = options.find((item) => item.label === value || item.iso2 === value.toUpperCase());
    const row = match ? byIso2(match.iso2) : undefined;
    if (row) {
      setFocus(row);
      setResults([]);
    }
  }

  async function share() {
    if (!latest || typeof window === "undefined") return;
    const url = window.location.href;
    const title = nameOf(latest, locale);
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        window.setTimeout(() => setShared(false), 1500);
      }
    } catch {
      await navigator.clipboard.writeText(url);
      setShared(true);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        <label className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-800">{COPY.home[locale]}</span>
          <select
            value={home.iso2}
            onChange={(e) => setHomeIso2(e.target.value)}
            className="rounded-md border border-slate-200 px-2 py-1"
          >
            {options.map((item) => (
              <option key={item.iso2} value={item.iso2}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <p className="mt-2">
          {nameOf(home, locale)} · {COPY.birthChance[locale]} {formatPct(countryShare(home, "births"), locale)} (
          {COPY.oneIn[locale]} {formatInt(oneIn(countryShare(home, "births")), locale)}) · {COPY.rank[locale]}{" "}
          {countryRank(home, "births")}
        </p>
      </div>

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
          onClick={() => {
            const next = pickMany(mode, draws);
            setResults(next);
            setFocus(next[next.length - 1] ?? null);
          }}
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

      <label className="block text-sm text-slate-600">
        {COPY.lookup[locale]}
        <input
          list="reincarnation-countries"
          value={query}
          onChange={(e) => lookUp(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
        />
        <datalist id="reincarnation-countries">
          {options.map((item) => (
            <option key={item.iso2} value={item.label} />
          ))}
        </datalist>
      </label>

      <ReincarnationGlobe
        focusIso3={latest?.iso3}
        homeIso3={home.iso3}
        hitIso3={hitIso3}
        yaw={yaw}
        onSelect={(iso2) => {
          const row = byIso2(iso2);
          if (!row) return;
          setFocus(row);
          setResults([]);
        }}
      />

      {latest ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-3xl font-black tracking-tight text-slate-900">{nameOf(latest, locale)}</p>
          <dl className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <div>
              <dt className="text-slate-400">{COPY.birthChance[locale]}</dt>
              <dd className="font-semibold">
                {formatPct(countryShare(latest, "births"), locale)} · {COPY.oneIn[locale]}{" "}
                {formatInt(oneIn(countryShare(latest, "births")), locale)} · {COPY.rank[locale]}{" "}
                {countryRank(latest, "births")}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400">{COPY.popChance[locale]}</dt>
              <dd className="font-semibold">
                {formatPct(countryShare(latest, "population"), locale)} · {COPY.oneIn[locale]}{" "}
                {formatInt(oneIn(countryShare(latest, "population")), locale)} · {COPY.rank[locale]}{" "}
                {countryRank(latest, "population")}
              </dd>
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
          {latest.iso3 !== home.iso3 && (
            <p className="mt-3 text-sm text-slate-600">
              {COPY.vs[locale]} {nameOf(home, locale)}: {COPY.births[locale]}{" "}
              {formatX(vsHome(latest, home, "births"), locale)} · {COPY.population[locale]}{" "}
              {formatX(vsHome(latest, home, "population"), locale)}
            </p>
          )}
          <button
            type="button"
            onClick={share}
            className="mt-4 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700"
          >
            {shared ? COPY.copied[locale] : COPY.share[locale]}
          </button>
          {results.length > 1 && (
            <ol className="mt-4 grid gap-1 text-sm text-slate-700 sm:grid-cols-2">
              {counts.map((row) => {
                const country = REINCARNATION_COUNTRIES.find((item) => item.iso3 === row.iso3);
                if (!country) return null;
                return (
                  <li key={row.iso3}>
                    <button type="button" className="underline-offset-2 hover:underline" onClick={() => setFocus(country)}>
                      {nameOf(country, locale)}
                      {row.count > 1 ? ` ×${row.count}` : ""}
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-500">{COPY.empty[locale]}</p>
      )}

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">{COPY.top[locale]} · {COPY[mode][locale]}</h2>
        <ol className="mt-2 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
          {top.map((row, i) => (
            <li key={row.iso3}>
              <button
                type="button"
                onClick={() => {
                  setFocus(row);
                  setResults([]);
                }}
                className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-slate-50"
              >
                <span>
                  {i + 1}. {nameOf(row, locale)}
                </span>
                <span className="text-slate-500">{formatPct(countryShare(row, mode), locale)}</span>
              </button>
            </li>
          ))}
        </ol>
      </section>

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
