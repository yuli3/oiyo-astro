#!/usr/bin/env node
// Writes src/data/reincarnation-life-stages.json: per-country numbers for the reincarnation
// "life stops" (ages 5/15/30/50/70) and the "first look" facts (2026-10-13, 세운's request to
// pull in as much open data as possible while the 1in8b.life meme is hot).
//
// Input is the folder that holds reincarnation-stats-2 … reincarnation-stats-5, the cleaned
// CSVs collected on the Mac (SOURCES.md in each folder lists URLs and licences). The CSVs are
// not committed; this script and the JSON it writes are the record.
//
//   node scripts/generate-reincarnation-life-stages.mjs <folder>
//
// Licence gate: the site carries ads, so only sources that allow commercial reuse are read
// here. Left out on purpose: WHO GHO-derived files (smoking, obesity, vehicles, cause of death,
// alcohol: CC BY-NC-SA 3.0 IGO or unclear), UNDP HDI/GII and FAO undernourishment (no licence
// in the files), World Happiness Report, twin births and UN household size (unclear),
// and the Wikipedia national-symbol lists (CC BY-SA would bind the JSON to share-alike).
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const MAX_YEAR = 2025;
const TEMP_WINDOW = 10; // average the last 10 years: one year's weather is noise, not climate

const dir = process.argv[2];
if (!dir) {
  console.error("usage: node scripts/generate-reincarnation-life-stages.mjs <folder-with-reincarnation-stats-2..5>");
  process.exit(1);
}

const root = fileURLToPath(new URL("..", import.meta.url));
const wanted = new Set(
  JSON.parse(readFileSync(`${root}src/data/reincarnation-countries.json`, "utf8")).countries.map((row) => row.iso3),
);

function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else quoted = !quoted;
    } else if (ch === "," && !quoted) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

function readCsv(path) {
  const lines = readFileSync(`${dir}/${path}`, "utf8").trim().split(/\r?\n/);
  const header = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    return Object.fromEntries(header.map((key, i) => [key, cells[i] ?? ""]));
  });
}

const countries = {};
const coverage = {};
function put(iso3, key, value) {
  if (!wanted.has(iso3) || value === undefined || value === null) return;
  countries[iso3] ??= {};
  countries[iso3][key] = value;
  coverage[key] = (coverage[key] ?? 0) + 1;
}

const round = (n, digits) => Number(n.toFixed(digits));

/** Latest value at or before MAX_YEAR per country, optionally filtered. */
function latestBy(rows, { filter = () => true, valueKey = "value", minYear = -Infinity } = {}) {
  const best = new Map();
  for (const row of rows) {
    const year = Number(row.year);
    const value = Number(row[valueKey]);
    if (!filter(row) || row[valueKey] === "" || !Number.isFinite(value) || year > MAX_YEAR || year < minYear) continue;
    const prev = best.get(row.iso3);
    if (!prev || year > prev.year) best.set(row.iso3, { year, value });
  }
  return best;
}

// --- Survival to each age (UN WPP 2024 life tables, CC BY 3.0 IGO). Stored as % of births.
const survival = readCsv("reincarnation-stats-2/survival_to_age.csv");
for (const age of ["5", "15", "30", "50", "70", "90"]) {
  for (const [iso3, { value }] of latestBy(survival, { filter: (r) => r.age === age })) {
    if (!wanted.has(iso3)) continue;
    countries[iso3] ??= {};
    countries[iso3].survive ??= {};
    countries[iso3].survive[age] = round(value * 100, 1);
  }
}
coverage.survive = Object.values(countries).filter((row) => row.survive).length;

// --- Simple latest-value indicators.
const SIMPLE = [
  // key, file, digits, minYear
  ["electricity", "reincarnation-stats-3/electricity_access.csv", 0, 2015], // World Bank, CC BY 4.0
  ["schoolYears", "reincarnation-stats-5/expected_years_of_schooling.csv", 1, 2015], // UNDP via OWID, CC BY 3.0 IGO
  ["motherAge", "reincarnation-stats-3/mother_age_at_birth.csv", 1, 2015], // UN WPP, CC BY 3.0 IGO
  ["fertility", "reincarnation-stats-3/fertility_rate.csv", 2, 2015], // UN WPP
  ["urban", "reincarnation-stats-3/urban_share.csv", 0, 2015], // UN WUP 2025, CC BY 3.0 IGO
  ["migrants", "reincarnation-stats-4/migrant_share.csv", 1, 2015], // UN DESA, CC BY 3.0 IGO
  ["workHours", "reincarnation-stats-3/working_hours.csv", 0, 2010], // Penn World Table via OWID, CC BY 4.0
];
for (const [key, file, digits, minYear] of SIMPLE) {
  for (const [iso3, { value }] of latestBy(readCsv(file), { minYear })) put(iso3, key, round(value, digits));
}

// --- First marriage by sex (UN World Marriage Data 2019, CC BY 3.0 IGO). Keep the survey year:
// some countries' latest survey is from the 1990s, and the page says so instead of hiding it.
const marriage = readCsv("reincarnation-stats-3/age_first_marriage.csv");
for (const sex of ["female", "male"]) {
  for (const [iso3, { year, value }] of latestBy(marriage, { filter: (r) => r.sex === sex, minYear: 2000 })) {
    if (!wanted.has(iso3)) continue;
    countries[iso3] ??= {};
    countries[iso3].marriage ??= {};
    countries[iso3].marriage[sex === "female" ? "f" : "m"] = round(value, 1);
    countries[iso3].marriage.year = Math.max(countries[iso3].marriage.year ?? 0, year);
  }
}

// --- Climate: mean of the last TEMP_WINDOW years (ERA5 via OWID, CC BY 4.0 + Copernicus notice).
{
  const byIso = new Map();
  for (const row of readCsv("reincarnation-stats-4/annual_temperature.csv")) {
    const year = Number(row.year);
    if (year > MAX_YEAR || year <= MAX_YEAR - TEMP_WINDOW || row.value === "") continue;
    const list = byIso.get(row.iso3) ?? [];
    list.push(Number(row.value));
    byIso.set(row.iso3, list);
  }
  for (const [iso3, list] of byIso) {
    if (list.length >= TEMP_WINDOW - 2) put(iso3, "temp", round(list.reduce((a, b) => a + b, 0) / list.length, 1));
  }
}

// --- Food (FAOSTAT Food Balance Sheets, CC BY 4.0). The 2010-onward series wins. The 1961–2013
// series uses a different method (Korea rice 2013: 85 vs 130 kg), so it is never mixed into the
// same country; it is only the fallback for countries the new series leaves out (Japan), and the
// year goes with it so the page can say "2013".
{
  const all = readCsv("reincarnation-stats-5/food_supply_per_capita.csv");
  const kcalAll = readCsv("reincarnation-stats-5/daily_calorie_supply.csv");
  const ITEMS = { rice: "rice", wheat: "wheat", meat_total: "meat", fish_seafood: "fish", coffee: "coffee", milk_excl_butter: "milk" };
  for (const series of ["fbs_2010_onward", "fbs_historic_1961_2013"]) {
    const food = all.filter((r) => r.series === series);
    const kcal = latestBy(kcalAll.filter((r) => r.series === series), { valueKey: "kcal_per_capita_per_day", minYear: 2010 });
    const done = new Set(Object.keys(countries).filter((iso3) => countries[iso3].food));
    for (const [item, key] of Object.entries(ITEMS)) {
      for (const [iso3, { year, value }] of latestBy(food, { filter: (r) => r.item === item, valueKey: "kg_per_capita_per_year", minYear: 2010 })) {
        if (!wanted.has(iso3) || done.has(iso3)) continue;
        countries[iso3] ??= {};
        countries[iso3].food ??= { year };
        countries[iso3].food[key] = round(value, 1);
        if (kcal.has(iso3)) countries[iso3].food.kcal = Math.round(kcal.get(iso3).value);
      }
    }
  }
}

// --- Driving side (Wikidata, CC0) and median age (CIA World Factbook, public domain).
for (const row of readCsv("reincarnation-stats-5/driving_side_calling_code.csv")) {
  if (row.driving_side === "left" || row.driving_side === "right") put(row.iso3, "drive", row.driving_side);
}
for (const row of readCsv("reincarnation-stats-5/factbook_country_profile.csv")) {
  const age = Number(row.median_age_total);
  if (row.median_age_total !== "" && Number.isFinite(age)) put(row.iso3, "medianAge", round(age, 1));
}

// --- Famous people born there (Wikidata, CC0), ranked by Wikipedia language editions.
// Only artists, scientists, writers and athletes, and nobody whose occupations include politics,
// war, rule or religion: the raw top 1 for Austria is Hitler, for Russia Putin. A reincarnation
// page that says "you share a birthplace with ..." must not land on those.
const FAMOUS_ALLOW =
  /writer|poet|novelist|playwright|composer|musician|singer|songwriter|pianist|guitarist|conductor|actor|actress|film director|painter|sculptor|artist|photographer|architect|dancer|physicist|mathematician|chemist|astronomer|scientist|biologist|inventor|engineer|physician|philosopher|explorer|football player|athlet|basketball|tennis|swimmer|sprinter|runner|cricketer|boxer|cyclist|racing|chess/i;
const FAMOUS_BLOCK =
  /politic|military|soldier|officer|monarch|sovereign|king|queen|emperor|ruler|dictator|revolutionary|head of (government|state)|statesperson|diplomat|minister|governor|president|aristocrat|perpetrator|criminal|terrorist|murderer|activist|priest|bishop|pope|theologian|religious|prophet|missionary|cleric|imam|rabbi|monk|nun|saint/i;
{
  const byIso = new Map();
  for (const row of readCsv("reincarnation-stats-5/famous_people_top30.csv")) {
    if (!FAMOUS_ALLOW.test(row.occupations) || FAMOUS_BLOCK.test(row.occupations)) continue;
    const list = byIso.get(row.iso3) ?? [];
    list.push(row);
    byIso.set(row.iso3, list);
  }
  for (const [iso3, list] of byIso) {
    list.sort((a, b) => Number(a.rank) - Number(b.rank));
    put(
      iso3,
      "famous",
      list.slice(0, 3).map((row) => ({
        ko: row.name_ko || row.name,
        en: row.name || row.name_ko,
        born: row.birth_year === "" ? undefined : Number(row.birth_year),
      })),
    );
  }
}

// --- Most common baby names in the latest year (official registries; all allow reuse with credit).
{
  const latestYear = new Map();
  const rows = readCsv("reincarnation-stats-5/baby_names_top100.csv");
  for (const row of rows) latestYear.set(row.iso3, Math.max(latestYear.get(row.iso3) ?? 0, Number(row.year)));
  for (const row of rows) {
    if (row.rank !== "1" || Number(row.year) !== latestYear.get(row.iso3) || !wanted.has(row.iso3)) continue;
    countries[row.iso3] ??= {};
    countries[row.iso3].names ??= { year: Number(row.year), scope: row.scope };
    countries[row.iso3].names[row.sex === "female" ? "f" : "m"] = row.name;
  }
}

const sorted = Object.fromEntries(
  Object.keys(countries)
    .filter((iso3) => wanted.has(iso3) && Object.keys(countries[iso3]).length > 0)
    .sort()
    .map((iso3) => [iso3, countries[iso3]]),
);
for (const key of ["marriage", "food", "names"]) coverage[key] = Object.values(sorted).filter((row) => row[key]).length;
for (const [key, n] of Object.entries(coverage).sort()) console.log(`${key}: ${n}/${wanted.size}`);

const out = {
  source:
    "UN World Population Prospects 2024 (survival, mother’s age, fertility); UN World Urbanization Prospects 2025; UN World Marriage Data 2019; UN DESA International Migrant Stock 2024; World Bank (electricity); UNDP Human Development Report (expected schooling); Penn World Table 11.0 (working hours); FAOSTAT Food Balance Sheets; Copernicus ERA5 via Our World in Data (temperature, contains modified Copernicus Climate Change Service information 2026); CIA World Factbook (median age); Wikidata (driving side, people born in each country); SSA, INSEE, SSB, Statistics Canada, NSW BDM and ONS (baby names).",
  asOf: `latest year with data, up to ${MAX_YEAR}; temperature is the ${MAX_YEAR - TEMP_WINDOW + 1}–${MAX_YEAR} mean`,
  countries: sorted,
};
writeFileSync(`${root}src/data/reincarnation-life-stages.json`, `${JSON.stringify(out)}\n`);
