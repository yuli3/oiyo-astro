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
