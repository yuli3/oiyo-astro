#!/usr/bin/env node
// Adds each famous person's name in their own language (松尾芭蕉, Лев Толстой) to the reincarnation
// data. 2026-10-13 세운: "이름은 현지이름 그대로 써도 될것같아요".
//
// Reads famous_people_top30.csv (iso3, wikidata_qid, …) and writes famous_native.csv next to it
// with qid, native, lang. Wikidata is CC0. Run where wikidata.org is reachable (the Mac):
//
//   node scripts/fetch-reincarnation-native-names.mjs <folder>/reincarnation-stats-5/famous_people_top30.csv
//
// Which name counts as "local": the label in the language of the person's "native name" (P1559),
// so Tagore gets Bengali even though he was born in India; failing that, the label in the
// birth country's official language (P37). Labels beat the raw P1559 text because P1559 is often
// the full legal name (Лев Николаевич Толстой) where the label is the name people use.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const input = process.argv[2];
if (!input) {
  console.error(
    "usage: node scripts/fetch-reincarnation-native-names.mjs <famous_people_top30.csv>",
  );
  process.exit(1);
}

const UA = "oiyo.net reincarnation data (support@oiyo.net)";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getJson(url, init = {}) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const res = await fetch(url, {
      ...init,
      headers: {
        "User-Agent": UA,
        Accept: "application/json",
        ...init.headers,
      },
    });
    if (res.ok) return res.json();
    if (res.status !== 429 && res.status < 500)
      throw new Error(`${res.status} ${url.slice(0, 120)}`);
    await sleep(2000 * 2 ** attempt);
  }
  throw new Error(`gave up: ${url.slice(0, 120)}`);
}

const sparql = (query) =>
  getJson("https://query.wikidata.org/sparql", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ query, format: "json" }),
  }).then((json) => json.results.bindings);

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

const lines = readFileSync(input, "utf8").trim().split(/\r?\n/);
const header = splitCsvLine(lines[0]);
const people = lines
  .slice(1)
  .map((line) =>
    Object.fromEntries(splitCsvLine(line).map((cell, i) => [header[i], cell])),
  )
  .filter((row) => /^Q\d+$/.test(row.wikidata_qid));

// Country → official-language wiki codes.
const countryLangs = new Map();
for (const row of await sparql(
  "SELECT ?iso ?code WHERE { ?c wdt:P298 ?iso; wdt:P37 ?lang. ?lang wdt:P424 ?code. }",
)) {
  const list = countryLangs.get(row.iso.value) ?? [];
  if (!list.includes(row.code.value)) list.push(row.code.value);
  countryLangs.set(row.iso.value, list);
}
// Taiwan writes Traditional characters; the plain zh label is usually Simplified.
countryLangs.set("TWN", ["zh-tw", "zh-hant", "zh"]);

// Person → language of P1559 native name, and the raw text as a last resort.
const nativeOf = new Map();
const qids = [...new Set(people.map((row) => row.wikidata_qid))];
for (let i = 0; i < qids.length; i += 200) {
  const values = qids
    .slice(i, i + 200)
    .map((q) => `wd:${q}`)
    .join(" ");
  for (const row of await sparql(
    `SELECT ?item ?native WHERE { VALUES ?item { ${values} } ?item wdt:P1559 ?native. }`,
  )) {
    const qid = row.item.value.split("/").pop();
    if (!nativeOf.has(qid))
      nativeOf.set(qid, {
        text: row.native.value,
        lang: row.native["xml:lang"] ?? "",
      });
  }
  await sleep(500);
}

// All labels, 50 people per call.
const labelsOf = new Map();
for (let i = 0; i < qids.length; i += 50) {
  const ids = qids.slice(i, i + 50).join("|");
  const json = await getJson(
    `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${ids}&props=labels&format=json`,
  );
  for (const [qid, entity] of Object.entries(json.entities ?? {})) {
    labelsOf.set(
      qid,
      Object.fromEntries(
        Object.entries(entity.labels ?? {}).map(([lang, label]) => [
          lang,
          label.value,
        ]),
      ),
    );
  }
  await sleep(300);
}

const quote = (value) =>
  /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
const out = ["qid,native,lang"];
let found = 0;
for (const qid of qids) {
  const iso3 = people.find((row) => row.wikidata_qid === qid).iso3;
  const labels = labelsOf.get(qid) ?? {};
  const native = nativeOf.get(qid);
  let pick = null;
  if (native) {
    const base = native.lang.split("-")[0];
    if (labels[native.lang]) pick = [labels[native.lang], native.lang];
    else if (labels[base]) pick = [labels[base], base];
    else pick = [native.text, native.lang];
  }
  for (const code of countryLangs.get(iso3) ?? []) {
    if (pick) break;
    if (labels[code]) pick = [labels[code], code];
  }
  if (!pick) continue;
  found += 1;
  out.push([qid, pick[0], pick[1]].map(quote).join(","));
}

const target = join(dirname(input), "famous_native.csv");
writeFileSync(target, `${out.join("\n")}\n`);
console.log(
  `${found}/${qids.length} people with a local-language name → ${target}`,
);
