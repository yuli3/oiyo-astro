#!/usr/bin/env node
// Writes src/data/reincarnation-country-names.json: the country name in each locale and the
// order the picker lists them in.
//
// Why a committed file instead of Intl.DisplayNames at render time: the names and the sort
// order come from the ICU data of whatever runs the code. The build (Node) and the visitor's
// browser carry different CLDR versions, so the server HTML said "Hong Kong SAR China" where
// the browser said "Hong Kong", and React threw hydration error #418 on every visit
// (measured 2026-10-07). A file gives both sides the same strings.
//
// Run after changing src/data/reincarnation-countries.json:
//   node scripts/generate-reincarnation-country-names.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const source = JSON.parse(readFileSync(`${root}src/data/reincarnation-countries.json`, "utf8"));
const countries = Array.isArray(source) ? source : source.countries;
const LOCALES = { ko: "ko", en: "en", ja: "ja", zh: "zh-CN", fr: "fr", es: "es" };

const names = {};
const order = {};
for (const [locale, tag] of Object.entries(LOCALES)) {
  const display = new Intl.DisplayNames([tag], { type: "region" });
  names[locale] = {};
  for (const country of countries) {
    const iso2 = country.iso2.toUpperCase();
    let label;
    try { label = display.of(iso2); } catch { label = undefined; }
    names[locale][iso2] = label && label !== iso2 ? label : country.name;
  }
  order[locale] = countries
    .map((country) => country.iso2.toUpperCase())
    .sort((a, b) => names[locale][a].localeCompare(names[locale][b], tag) || a.localeCompare(b));
}

const out = {
  generatedWith: { node: process.version, icu: process.versions.icu, cldr: process.versions.cldr },
  names,
  order,
};
writeFileSync(`${root}src/data/reincarnation-country-names.json`, `${JSON.stringify(out, null, 1)}\n`);
console.log(`wrote ${countries.length} countries × ${Object.keys(LOCALES).length} locales`);
