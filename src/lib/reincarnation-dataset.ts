/**
 * Open dataset behind the reincarnation-country draw (2026-11-20).
 *
 * The same numbers the draw uses (src/data/reincarnation-countries.json), with
 * each country's share of births and of population precomputed, so the table
 * page, the CSV and the JSON download can never disagree. Published under
 * CC BY 4.0 so other sites can cite it; the upstream sources are UN WPP 2024
 * (CC BY 3.0 IGO) and World Bank WDI (CC BY 4.0), credited in every format.
 */
import raw from "../data/reincarnation-countries.json";

export interface DatasetRow {
  rank: number;
  iso2: string;
  iso3: string;
  name: string;
  continent: string;
  births: number;
  birthsYear: number;
  birthsSource: string;
  birthSharePct: number;
  oneInNBirths: number;
  population: number;
  popYear: number;
  populationSharePct: number;
}

export const DATASET_LICENSE = "https://creativecommons.org/licenses/by/4.0/";
export const DATASET_SOURCES = raw.source as string;
export const DATASET_AS_OF = raw.asOf as string;
export const DATASET_CITATION =
  "OIYO (2026). Reincarnation country weights: share of world births and population by country. https://oiyo.net/en/reincarnation-country/data/ (CC BY 4.0). Sources: UN World Population Prospects 2024; World Bank WDI.";

const round = (n: number, d: number) => Math.round(n * 10 ** d) / 10 ** d;

export function datasetRows(): DatasetRow[] {
  const countries = raw.countries as Array<Record<string, unknown>>;
  const totalBirths = countries.reduce((s, c) => s + Number(c.births), 0);
  const totalPop = countries.reduce((s, c) => s + Number(c.population), 0);
  return countries
    .map((c) => ({
      iso2: String(c.iso2),
      iso3: String(c.iso3),
      name: String(c.name),
      continent: String(c.continent),
      births: Math.round(Number(c.births)),
      birthsYear: Number(c.birthsYear),
      birthsSource: String(c.birthsSource),
      birthSharePct: round((Number(c.births) / totalBirths) * 100, 4),
      oneInNBirths: Math.round(totalBirths / Number(c.births)),
      population: Math.round(Number(c.population)),
      popYear: Number(c.popYear),
      populationSharePct: round((Number(c.population) / totalPop) * 100, 4),
    }))
    .sort((a, b) => b.births - a.births)
    .map((r, i) => ({ rank: i + 1, ...r }));
}

export const CSV_COLUMNS: (keyof DatasetRow)[] = [
  "rank", "iso2", "iso3", "name", "continent", "births", "birthsYear", "birthsSource",
  "birthSharePct", "oneInNBirths", "population", "popYear", "populationSharePct",
];

const cell = (v: unknown) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function datasetCsv(): string {
  const rows = datasetRows();
  return [CSV_COLUMNS.join(","), ...rows.map((r) => CSV_COLUMNS.map((k) => cell(r[k])).join(","))].join("\n") + "\n";
}
