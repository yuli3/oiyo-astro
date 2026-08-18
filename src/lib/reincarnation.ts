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
}

export const REINCARNATION_META = {
  source: data.source,
  asOf: data.asOf,
};

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
