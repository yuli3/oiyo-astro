#!/usr/bin/env node
// Writes src/data/reincarnation-life-stats.json: per-country averages for the reincarnation
// birth card and 100-square life map (2026-10-13, 세운's "1in8b.life" batch).
//
// Input is a folder of Our World in Data grapher downloads, fetched with
//   https://ourworldindata.org/grapher/<slug>.csv?v=1&csvType=full&useColumnShortNames=true
// for the slugs in SOURCES below. The raw CSVs are not committed (several MB); this file and
// the JSON it writes are the record. Cloud sessions cannot reach ourworldindata.org, so the
// download runs on the Mac.
//
//   node scripts/generate-reincarnation-life-stats.mjs <folder-with-csvs>
//
// For each country in src/data/reincarnation-countries.json and each indicator, keeps the
// latest year at or before MAX_YEAR (and not before the indicator's minYear) that has a value. MAX_YEAR stops projections (schooling
// runs to 2040, income nowcasts to 2026) from being shown as today's numbers.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const MAX_YEAR = 2025;
const SOURCES = {
  lifeExpectancy: { file: "life-expectancy.csv", column: "life_expectancy_0", digits: 1 },
  childMortality: { file: "child-mortality.csv", column: "child_mortality_rate", digits: 2 },
  schooling: {
    file: "mean-years-of-schooling.csv",
    column: "mf_youth_and_adults__15_64_years__average_years_of_education",
    digits: 1,
  },
  dailyIncome: {
    file: "daily-median-income.csv",
    column:
      "median__ppp_version_2021__welfare_type_income_or_consumption__period_day__table_income_or_consumption_consolidated__survey_comparability_no_spells",
    digits: 2,
    // Income comes from household surveys that some countries last ran in the 1990s.
    // A 30-year-old median is not "the life you are born into", so drop it and keep the year.
    minYear: 2010,
    keepYear: true,
  },
  internet: { file: "share-of-individuals-using-the-internet.csv", column: "it_net_user_zs", digits: 1, minYear: 2015 },
};

const dir = process.argv[2];
if (!dir) {
  console.error("usage: node scripts/generate-reincarnation-life-stats.mjs <folder-with-csvs>");
  process.exit(1);
}

const root = fileURLToPath(new URL("..", import.meta.url));
const source = JSON.parse(readFileSync(`${root}src/data/reincarnation-countries.json`, "utf8"));
const wanted = new Set(source.countries.map((row) => row.iso3));

// OWID entity names can contain commas inside quotes ("Korea, North" is not used, but
// "Bonaire Sint Eustatius and Saba" style names may be quoted), so split carefully.
function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let quoted = false;
  for (const ch of line) {
    if (ch === '"') quoted = !quoted;
    else if (ch === "," && !quoted) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

const countries = {};
const years = {};
for (const [key, spec] of Object.entries(SOURCES)) {
  const lines = readFileSync(`${dir}/${spec.file}`, "utf8").trim().split(/\r?\n/);
  const header = splitCsvLine(lines[0]);
  const col = header.indexOf(spec.column);
  if (col < 0) throw new Error(`${spec.file}: column ${spec.column} not found`);
  const best = new Map();
  for (const line of lines.slice(1)) {
    const cells = splitCsvLine(line);
    const iso3 = cells[1];
    const year = Number(cells[2]);
    const value = cells[col] === "" ? NaN : Number(cells[col]);
    if (!wanted.has(iso3) || !Number.isFinite(value) || year > MAX_YEAR || year < (spec.minYear ?? -Infinity)) continue;
    const prev = best.get(iso3);
    if (!prev || year > prev.year) best.set(iso3, { year, value });
  }
  const seen = [];
  for (const [iso3, { year, value }] of best) {
    countries[iso3] ??= {};
    countries[iso3][key] = Number(value.toFixed(spec.digits));
    if (spec.keepYear) countries[iso3][`${key}Year`] = year;
    seen.push(year);
  }
  seen.sort((a, b) => a - b);
  years[key] = seen.length ? `${seen[0]}–${seen[seen.length - 1]}` : "";
  console.log(`${key}: ${best.size}/${wanted.size} countries, years ${years[key]}`);
}

const sorted = Object.fromEntries(Object.keys(countries).sort().map((iso3) => [iso3, countries[iso3]]));
const out = {
  source:
    "Our World in Data grapher: life expectancy (UN WPP 2024, HMD), under-5 mortality (UN IGME 2025), average years of schooling ages 15–64 (Barro & Lee 2015; Lee & Lee 2016), median daily income or consumption in 2021 PPP $ (World Bank PIP), internet users (ITU via World Bank).",
  asOf: `latest year with data, up to ${MAX_YEAR}`,
  years,
  countries: sorted,
};
writeFileSync(`${root}src/data/reincarnation-life-stats.json`, `${JSON.stringify(out, null, 1)}\n`);
