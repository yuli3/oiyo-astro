#!/usr/bin/env node
// Writes src/data/past-life-1426-generated.json and the small images under
// public/images/past-life-1426/ for /joseon-1426/, /europe-1426/ and /us-birth-state/ (2026-11-02).
//
// Input is the folder collected on the Mac (cloud sessions cannot reach Wikidata, Commons or SSA):
//   SOURCES.md, us-names-by-state.json, us-states-wikidata.json, europe-1426.json,
//   people-alive-1426.json, joseon-offices-stipends-robes.json, flags-us/, rulers-eu/
// Raw inputs are not committed (~10 MB). A copy lives on branch claude/past-life-1426-data.
//
//   node scripts/generate-past-life-1426.mjs <folder>
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const dir = process.argv[2];
if (!dir) throw new Error("usage: generate-past-life-1426.mjs <folder>");
const read = (f) => JSON.parse(readFileSync(join(dir, f), "utf8"));
const OUT_IMG = "public/images/past-life-1426";
mkdirSync(`${OUT_IMG}/flags`, { recursive: true });
mkdirSync(`${OUT_IMG}/rulers`, { recursive: true });

// ── US ──
const names = read("us-names-by-state.json");
const states = read("us-states-wikidata.json").states;
const us = {};
for (const [code, s] of Object.entries(states)) {
  const n = names.states[code];
  await sharp(join(dir, s.flag.local), { density: 72 }).resize({ width: 360 }).webp({ quality: 82 }).toFile(`${OUT_IMG}/flags/${code}.webp`);
  us[code] = {
    nickname: (s.nicknames_en ?? [])[0] ?? null,
    capital: s.capital?.[0] ? { en: s.capital[0].en, ko: s.capital[0].ko ?? null } : null,
    bird: s.state_bird ? { common: s.state_bird.common, scientific: s.state_bird.scientific } : null,
    flag: { page: s.flag.commons_page, artist: s.flag.Artist || null, license: s.flag.LicenseShortName },
    namesYear: n.year,
    female: n.female.map((x) => [x.name, x.count]),
    male: n.male.map((x) => [x.name, x.count]),
  };
}

// ── Europe rulers' portraits ──
// Dropped 2026-11-02: naples (Commons description names another person), moldavia (1995 stamp),
// serbia (date/medium unclear). Florence has no single ruler.
const DROP = new Set(["naples", "moldavia", "serbia", "florence"]);
const rulers = {};
for (const r of read("europe-1426.json")) {
  const p = r.portrait;
  if (!p || DROP.has(r.id) || !p.licence_ok) continue;
  const year = Number((/(\d{4})/.exec(p.DateTimeOriginal ?? "") ?? [])[1]) || null;
  await sharp(join(dir, p.local)).resize({ width: 320, withoutEnlargement: true }).webp({ quality: 80 }).toFile(`${OUT_IMG}/rulers/${r.id}.webp`);
  rulers[r.id] = {
    page: p.commons_page,
    license: p.LicenseShortName,
    artist: (p.Artist || "").replace(/<[^>]+>/g, "").trim().slice(0, 120) || null,
    year,
    kind: /coin/i.test(r.portrait_note ?? "") ? "coin" : /seal/i.test(r.portrait_note ?? "") ? "seal" : "image",
  };
}

// ── People alive in 1426 ──
const OCC = new Set(["politician", "painter", "aristocrat", "military personnel", "writer", "sovereign", "poet", "monarch", "condottiero", "philosopher", "diplomat", "Catholic priest", "ruler", "explorer", "sculptor", "historian", "architect", "mathematician", "astronomer", "composer", "theologian", "typographer", "knight", "banker", "merchant", "Buddhist monk"]);
const peopleIn = read("people-alive-1426.json");
const people = (Array.isArray(peopleIn) ? peopleIn : peopleIn.people)
  .filter((p) => p.labels?.en && p.birth_year <= 1426 && p.death_year > 1426)
  .map((p) => ({
    qid: p.qid,
    l: p.labels,
    b: p.birth_year,
    d: p.death_year,
    o: (p.occupations_en ?? []).find((o) => OCC.has(o)) ?? null,
    s: p.sitelinks,
  }))
  .sort((a, b) => b.s - a.s);

// ── Joseon stipends (1438 녹과) ──
const stipends = {};
for (const g of read("joseon-offices-stipends-robes.json").stipend_by_grade) {
  const t = g.annual_total;
  stipends[g.grade] = {
    rice: (t["중미"] ?? 0) + (t["조미"] ?? 0) + (t["전미"] ?? 0),
    beans: t["황두"] ?? 0,
    wheat: t["소맥"] ?? 0,
    silk: t["주"] ?? 0,
    cloth: t["정포"] ?? 0,
    url: g.passages[0].url,
  };
}

writeFileSync(
  "src/data/past-life-1426-generated.json",
  JSON.stringify({ generated: "2026-11-02", namesSource: names.original_url, us, rulers, stipends }) + "\n",
);
// Loaded lazily by the Europe page only.
writeFileSync("src/data/past-life-1426-people.json", JSON.stringify(people) + "\n");
console.log(`us ${Object.keys(us).length}, rulers ${Object.keys(rulers).length}, people ${people.length}, stipends ${Object.keys(stipends).length}`);
