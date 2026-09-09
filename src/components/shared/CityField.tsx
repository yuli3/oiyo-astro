"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { MapPin, X } from "lucide-react";
import { searchCities, type CitySearchHit } from "@/lib/ontology/natal/city-search";
import { CITIES, type City, type NatalLocale } from "@/lib/ontology/natal/signs";

// 출생지 입력 — 검색 가능한 콤보박스.
//
// 왜 select 가 아닌가: 예전에는 큐레이션된 23개 도시만 담은 <select> 가 주 입력이었고,
// GeoNames 34,128개 도시 검색은 그 아래 11px 짜리 <details> 안에 접혀 있었다.
// 한국 도시는 목록에 서울·부산뿐이라, 대구·대전에서 태어난 방문자는 드롭다운을 열어
// 자기 도시가 없는 것을 보고 "입력할 수 없다"고 결론지었다. 검색은 실제로 대구·대전을
// 모두 찾아내지만, 아무도 열지 않는 곳에 있었다. (2026-09-09 세운 보고)
//
// 지금은 입력창이 곧 검색창이다. 비어 있을 때는 큐레이션 목록이 그대로 보이고,
// 두 글자부터 전 세계 번들을 지연 로드해 함께 찾는다. 번들(약 957KB)은 사용자가
// 실제로 두 글자를 칠 때 처음 받는다 — 폼을 여는 것만으로는 받지 않는다.

export interface CityFieldCopy {
  label: string;
  placeholder: string;
  /** 결과가 0건일 때. 한글 별칭이 없는 한국 도시 25개는 라틴 표기로만 찾힌다. */
  empty: string;
  hint: string;
  popular: string;
  clear: string;
}

const COPY: Record<NatalLocale, CityFieldCopy> = {
  ko: { label: "출생지", placeholder: "도시 이름을 입력하세요 (예: 대구)", empty: "검색 결과가 없습니다. 로마자로도 찾아보세요 (예: Seogwipo)", hint: "전 세계 34,000여 개 도시에서 찾습니다", popular: "자주 찾는 도시", clear: "지우기" },
  en: { label: "Birthplace", placeholder: "Type a city name (e.g. Daegu)", empty: "No matches. Try the Latin spelling instead.", hint: "Searches 34,000+ cities worldwide", popular: "Popular cities", clear: "Clear" },
  ja: { label: "出生地", placeholder: "都市名を入力（例: 大邱）", empty: "該当なし。ローマ字表記でもお試しください。", hint: "世界 34,000 以上の都市から検索します", popular: "よく選ばれる都市", clear: "クリア" },
  zh: { label: "出生地", placeholder: "输入城市名（例：大邱）", empty: "无结果。可试试拉丁拼写。", hint: "从全球 34,000 多个城市中搜索", popular: "常选城市", clear: "清除" },
  fr: { label: "Lieu de naissance", placeholder: "Saisissez une ville (ex. Daegu)", empty: "Aucun résultat. Essayez l'orthographe latine.", hint: "Recherche parmi plus de 34 000 villes", popular: "Villes fréquentes", clear: "Effacer" },
  es: { label: "Lugar de nacimiento", placeholder: "Escribe una ciudad (ej. Daegu)", empty: "Sin resultados. Prueba la grafía latina.", hint: "Busca entre más de 34.000 ciudades", popular: "Ciudades frecuentes", clear: "Borrar" },
};

export interface CityOption {
  city: City;
  /** 라틴 표기. 현지 표기와 다를 때만 보조 줄로 보여 준다. */
  latin?: string;
  countryCode?: string;
}

/** 큐레이션 도시를 검색 결과와 같은 모양으로 맞춘다. */
function curatedOptions(lang: NatalLocale, query: string): CityOption[] {
  const q = query.trim().toLowerCase();
  const match = (city: City) =>
    !q || Object.values(city.label).some((v) => v.toLowerCase().includes(q)) || city.id.includes(q);
  return CITIES.filter(match).map((city) => ({ city, latin: city.label.en }));
}

export function CityField({
  locale,
  value,
  selected,
  onChange,
  required = false,
  id: idProp,
  copy: copyProp,
}: {
  locale: string;
  /** 선택된 도시 id ("" = 없음) */
  value: string;
  /** 이미 고른 도시(검색 결과였다면 CITIES 에 없으므로 부모가 들고 있어야 한다) */
  selected?: City | null;
  onChange: (id: string, city: City | null) => void;
  required?: boolean;
  id?: string;
  copy?: Partial<CityFieldCopy>;
}) {
  const lang = (["ko", "en", "ja", "zh", "fr", "es"].includes(locale) ? locale : "en") as NatalLocale;
  const c = { ...COPY[lang], ...copyProp };
  const reactId = useId();
  const id = idProp ?? `city-${reactId}`;
  const listId = `${id}-list`;

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [hits, setHits] = useState<CitySearchHit[]>([]);
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const chosen = useMemo<City | null>(() => {
    if (!value) return null;
    return CITIES.find((x) => x.id === value) ?? selected ?? null;
  }, [value, selected]);

  // 두 글자부터 번들을 검색한다. 요청이 뒤바뀌어 낡은 결과가 덮어쓰지 않도록
  // 이 실행이 아직 최신인지 확인하고 반영한다.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) { setHits([]); setBusy(false); return; }
    let live = true;
    setBusy(true);
    searchCities(q, 12)
      .then((r) => { if (live) setHits(r); })
      .catch(() => { if (live) setHits([]); })
      .finally(() => { if (live) setBusy(false); });
    return () => { live = false; };
  }, [query]);

  // 바깥을 누르면 닫는다.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const options = useMemo<CityOption[]>(() => {
    const curated = curatedOptions(lang, query);
    const seen = new Set(curated.map((o) => o.city.id));
    const found = hits
      .filter((h) => !seen.has(h.city.id))
      .map((h) => ({ city: h.city, latin: h.latin, countryCode: h.countryCode }));
    return [...curated, ...found].slice(0, 20);
  }, [lang, query, hits]);

  useEffect(() => { setActive(0); }, [options.length]);

  const pick = (o: CityOption) => {
    onChange(o.city.id, o.city);
    setQuery("");
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setOpen(false); return; }
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) { setOpen(true); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, options.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && options[active]) { e.preventDefault(); pick(options[active]); }
  };

  return (
    <div className="relative" ref={boxRef}>
      <label className="mb-1 block text-[11px] font-black uppercase tracking-wider text-green-600" htmlFor={id}>
        {c.label}
      </label>

      {chosen && !open ? (
        <div className="flex h-12 w-full items-center gap-2 rounded-2xl border border-green-300 bg-surface-subtle px-4">
          <MapPin className="h-4 w-4 shrink-0 text-green-600" aria-hidden="true" />
          <button
            type="button"
            onClick={() => { setOpen(true); setQuery(""); }}
            className="min-w-0 flex-1 truncate text-left text-base font-black text-slate-900"
          >
            {chosen.label[lang] || chosen.label.en}
          </button>
          <button
            type="button"
            aria-label={c.clear}
            onClick={() => { onChange("", null); setQuery(""); }}
            className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-card hover:text-slate-700"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" aria-hidden="true" />
          <input
            id={id}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={open && options[active] ? `${id}-opt-${active}` : undefined}
            autoComplete="off"
            required={required && !chosen}
            value={query}
            placeholder={c.placeholder}
            onFocus={() => setOpen(true)}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onKeyDown={onKeyDown}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-base font-black text-slate-900 outline-none focus:border-green-500 focus:bg-card focus:ring-4 focus:ring-green-500/10"
          />
        </div>
      )}

      <p className="mt-1 text-[11px] text-slate-400">{c.hint}</p>

      {open && (
        <div
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-2xl border border-green-100 bg-card shadow-lg"
        >
          {query.trim().length < 2 && (
            <p className="px-3 pt-2 text-[11px] font-bold uppercase tracking-wider text-green-600">{c.popular}</p>
          )}
          {busy && <p className="px-3 py-2 text-[11px] text-green-500">…</p>}
          {!busy && options.length === 0 && (
            <p className="px-3 py-3 text-[11px] leading-5 text-slate-500">{c.empty}</p>
          )}
          <ul className="divide-y divide-green-50">
            {options.map((o, i) => {
              const primary = o.city.label[lang] || o.city.label.en;
              return (
                <li key={o.city.id}>
                  <button
                    type="button"
                    id={`${id}-opt-${i}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => pick(o)}
                    className={`flex w-full items-baseline justify-between gap-2 px-3 py-2 text-left ${i === active ? "bg-surface-subtle" : ""}`}
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-900">{primary}</span>
                    {o.latin && o.latin !== primary && (
                      <span className="shrink-0 text-[11px] text-slate-400">{o.latin}</span>
                    )}
                    {o.countryCode && <span className="shrink-0 text-[11px] font-bold text-green-500">{o.countryCode}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CityField;
