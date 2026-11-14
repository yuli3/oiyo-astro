#!/usr/bin/env node
// Writes src/data/reincarnation-births-by-year.json: births per country for the years the
// reincarnation draw lets you pick (2026-10-19, brainstorm item B6 "태어난 해 고르기").
//
// Input is births_by_year.csv (iso3,year,value) cut from the UN World Population Prospects 2024
// Demographic Indicators, medium variant, column Births (Togo from the 2026-01-19 interim update).
// The CSV is not committed; it lives in the project's reincarnation-stats-2 bundle.
//
//   node scripts/generate-reincarnation-births-by-year.mjs <births_by_year.csv>
//
// Only countries in src/data/reincarnation-countries.json are kept. 2024 is not written: the draw
// keeps using each country's `births`, which already fills territories that have no WPP series.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const YEARS = [1950, 1990, 2050];

const input = process.argv[2];
if (!input) {
  console.error("usage: node scripts/generate-reincarnation-births-by-year.mjs <births_by_year.csv>");
  process.exit(1);
}

const countries = JSON.parse(
  readFileSync(fileURLToPath(new URL("../src/data/reincarnation-countries.json", import.meta.url)), "utf8"),
).countries;
const wanted = new Set(countries.map((row) => row.iso3));

const births = {};
for (const line of readFileSync(input, "utf8").trim().split("\n").slice(1)) {
  const [iso3, yearRaw, valueRaw] = line.split(",");
  const year = Number(yearRaw);
  if (!wanted.has(iso3) || !YEARS.includes(year)) continue;
  const value = Math.round(Number(valueRaw));
  if (!Number.isFinite(value)) continue;
  (births[iso3] ??= {})[year] = value;
}

const out = {
  source:
    "United Nations, World Population Prospects 2024, Demographic Indicators (medium variant), Births. 2050 is a projection. Togo uses the 2026-01-19 interim update.",
  years: YEARS,
  births,
};
writeFileSync(
  fileURLToPath(new URL("../src/data/reincarnation-births-by-year.json", import.meta.url)),
  `${JSON.stringify(out, null, 1)}\n`,
);
const missing = countries.filter((row) => !births[row.iso3]).map((row) => row.iso3);
console.log(`wrote ${Object.keys(births).length} countries; no WPP series: ${missing.join(" ") || "none"}`);
