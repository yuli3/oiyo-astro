import data from "../data/reincarnation-countries.json";

export type WeightMode = "births" | "population";

export interface ReincarnationCountry {
  iso2: string;
  iso3: string;
  name: string;
  population: number;
  births: number;
  popYear: number;
  cbrYear: number;
  lon: number | null;
  lat: number | null;
  birthsYear?: number;
  birthsSource?: "wpp2024" | "wb-cbr-estimate";
  continent?: Continent;
}

export const CONTINENTS = ["asia", "africa", "europe", "americas", "oceania"] as const;
export type Continent = (typeof CONTINENTS)[number];

export function parseContinent(raw: string | null | undefined): Continent | "all" {
  const value = (raw ?? "").trim().toLowerCase();
  return (CONTINENTS as readonly string[]).includes(value) ? (value as Continent) : "all";
}

export function matchesContinent(row: ReincarnationCountry, continent: Continent | "all"): boolean {
  if (continent === "all") return true;
  return row.continent === continent;
}

export const REINCARNATION_META = {
  source: data.source,
  asOf: data.asOf,
  pinSource: (data as { pinSource?: string }).pinSource,
};

export const REINCARNATION_HISTORY_KEY = "oiyo:reincarnation-history:v1";
export const REINCARNATION_HISTORY_MAX = 24;

export const REINCARNATION_COUNTRIES = data.countries as ReincarnationCountry[];

export function weightTotal(mode: WeightMode): number {
  return REINCARNATION_COUNTRIES.reduce((sum, row) => sum + row[mode], 0);
}

export function countryShare(row: ReincarnationCountry, mode: WeightMode): number {
  const total = weightTotal(mode);
  return total === 0 ? 0 : row[mode] / total;
}

export function pickCountry(mode: WeightMode, random = Math.random): ReincarnationCountry {
  let ticket = random() * weightTotal(mode);
  for (const row of REINCARNATION_COUNTRIES) {
    ticket -= row[mode];
    if (ticket <= 0) return row;
  }
  return REINCARNATION_COUNTRIES[REINCARNATION_COUNTRIES.length - 1];
}

export function pickMany(mode: WeightMode, count: number, random = Math.random): ReincarnationCountry[] {
  const n = Math.max(1, Math.min(20, Math.floor(count)));
  return Array.from({ length: n }, () => pickCountry(mode, random));
}

export function projectLonLat(lon: number, lat: number): { x: number; y: number } {
  return {
    x: 50 + (lon / 180) * 46,
    y: 50 - (lat / 90) * 34,
  };
}

const DISPLAY_LOCALE: Record<string, string> = {
  ko: "ko",
  en: "en",
  ja: "ja",
  zh: "zh-CN",
  fr: "fr",
  es: "es",
};

export function displayCountryName(iso2: string, locale: string, fallback: string): string {
  try {
    const names = new Intl.DisplayNames([DISPLAY_LOCALE[locale] ?? locale], { type: "region" });
    return names.of(iso2.toUpperCase()) ?? fallback;
  } catch {
    return fallback;
  }
}

export function projectOrthographic(
  lon: number,
  lat: number,
  yawDeg = 10,
): { x: number; y: number; visible: boolean } {
  const yaw = (yawDeg * Math.PI) / 180;
  const lam = (lon * Math.PI) / 180 - yaw;
  const phi = (lat * Math.PI) / 180;
  const x = Math.cos(phi) * Math.sin(lam);
  const y = Math.sin(phi);
  const z = Math.cos(phi) * Math.cos(lam);
  if (z < 0) return { x: 50, y: 35, visible: false };
  return { x: 50 + x * 32, y: 35 - y * 32, visible: true };
}

export function tallyIso3(rows: ReincarnationCountry[]): { iso3: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const row of rows) counts.set(row.iso3, (counts.get(row.iso3) ?? 0) + 1);
  return [...counts.entries()]
    .map(([iso3, count]) => ({ iso3, count }))
    .sort((a, b) => b.count - a.count);
}

const HOME_ISO2: Record<string, string> = {
  ko: "KR",
  ja: "JP",
  zh: "CN",
  fr: "FR",
  es: "ES",
  en: "US",
};

export function defaultHomeIso2(locale: string): string {
  return HOME_ISO2[locale] ?? "KR";
}

export function byIso2(iso2: string): ReincarnationCountry | undefined {
  const code = iso2.trim().toUpperCase();
  return REINCARNATION_COUNTRIES.find((row) => row.iso2 === code);
}

export function ranked(mode: WeightMode): ReincarnationCountry[] {
  return [...REINCARNATION_COUNTRIES].sort((a, b) => b[mode] - a[mode] || a.iso3.localeCompare(b.iso3));
}

export function countryRank(row: ReincarnationCountry, mode: WeightMode): number {
  return ranked(mode).findIndex((item) => item.iso3 === row.iso3) + 1;
}

export function oneIn(share: number): number {
  if (share <= 0) return Number.POSITIVE_INFINITY;
  return Math.max(1, Math.round(1 / share));
}

export function vsHome(row: ReincarnationCountry, home: ReincarnationCountry, mode: WeightMode): number {
  const base = countryShare(home, mode);
  if (base <= 0) return 0;
  return countryShare(row, mode) / base;
}

export function yawToCenter(lon: number): number {
  return ((lon % 360) + 360) % 360;
}

export function latLonToCartesian(lat: number, lon: number, radius = 1): [number, number, number] {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return [
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

export function parseShareIso2(raw: string | null | undefined): string[] {
  if (!raw) return [];
  const out: string[] = [];
  for (const part of raw.split(/[,\s]+/)) {
    const code = part.trim().toUpperCase();
    if (code.length !== 2 || !byIso2(code)) continue;
    out.push(code);
    if (out.length >= 20) break;
  }
  return out;
}

export function formatShareIso2(iso2: string[]): string {
  return iso2
    .map((code) => code.trim().toUpperCase())
    .filter((code) => byIso2(code))
    .slice(0, 20)
    .join(",");
}

export type ReincarnationHistoryEntry = {
  id: string;
  at: string;
  mode: WeightMode;
  iso2: string[];
};

export function parseHistory(raw: unknown): ReincarnationHistoryEntry[] {
  let value = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) return [];
  const out: ReincarnationHistoryEntry[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    if (typeof rec.id !== "string" || typeof rec.at !== "string") continue;
    const mode: WeightMode | null = rec.mode === "population" ? "population" : rec.mode === "births" ? "births" : null;
    if (!mode) continue;
    const iso2 = Array.isArray(rec.iso2)
      ? rec.iso2
          .filter((code): code is string => typeof code === "string")
          .map((code) => code.trim().toUpperCase())
          .filter((code) => byIso2(code))
          .slice(0, 20)
      : [];
    if (!iso2.length) continue;
    out.push({ id: rec.id.slice(0, 40), at: rec.at, mode, iso2 });
    if (out.length >= REINCARNATION_HISTORY_MAX) break;
  }
  return out;
}

export function appendHistory(
  list: ReincarnationHistoryEntry[],
  entry: ReincarnationHistoryEntry,
): ReincarnationHistoryEntry[] {
  return [entry, ...list.filter((row) => row.id !== entry.id)].slice(0, REINCARNATION_HISTORY_MAX);
}

export function countriesFromIso2(iso2: string[]): ReincarnationCountry[] {
  const rows: ReincarnationCountry[] = [];
  for (const code of iso2) {
    const row = byIso2(code);
    if (row) rows.push(row);
    if (rows.length >= 20) break;
  }
  return rows;
}
