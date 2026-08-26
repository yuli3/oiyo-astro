// Regrowth gate for "bare" pages: no <h2>, thin body, no FAQ JSON-LD.
//
// Why this exists: SEO_BARE_PAGES_INVENTORY_2026-06-14 flagged 56 bare pages.
// All 56 got fixed -- and a week later 67 *new* pages landed with the exact
// same defect, because nothing in CI checked for it. audit:page-structure
// only checks for nested <main>; it never looked at prose/h2/FAQ.
//
// This script does not fix anything and does not fail on the current count.
// It locks today's count as a ceiling so the next batch that adds bare pages
// fails CI instead of silently growing the pile again. Source:
// company-brain/projects/oiyo-ecosystem/low-quality-content-full-audit-2026-08-26.md P1-1/P1-2.
//
// Run after `npm run build`. Update the baseline only when a human has
// reviewed the new bare pages and decided they're acceptable (or after a
// batch that reduces the count -- lower the number, don't just raise it).

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const BASELINE_FILE = "config/content-depth-baseline.json";
const LOCALES = new Set(["ko", "en", "ja", "zh", "fr", "es"]);

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name === "index.html") out.push(p);
  }
  return out;
}

function textLength(html) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? html;
  const stripped = main
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<[^>]+>/g, "");
  let units = 0;
  for (const ch of stripped) {
    units += /[　-鿿가-힣]/.test(ch) ? 1 : ch.trim() ? 0.5 : 0;
  }
  return Math.round(units);
}

if (!existsSync(DIST)) {
  console.error("content depth audit: dist/ missing, run `npm run build` first");
  process.exit(1);
}

function mainText(html) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? "";
  return main
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<[^>]+>/g, " ");
}

const bare = [];
const koreanLeaks = [];
for (const file of walk(DIST)) {
  const locale = file.split("/")[1];
  if (!LOCALES.has(locale)) continue;
  const html = readFileSync(file, "utf8");
  if (/noindex/.test(html.match(/<meta name="robots"[^>]*>/)?.[0] ?? "")) continue;
  const h2Count = (html.match(/<h2\b/g) ?? []).length;
  const hasFaqLd = /"@type"\s*:\s*"FAQPage"/.test(html);
  const bodyUnits = textLength(html);
  if (h2Count === 0 && bodyUnits < 300 && !hasFaqLd) {
    bare.push(file.replace(`${DIST}/`, ""));
  }

  // Locale-blind component gate: a non-ko page whose main text is mostly
  // Hangul means the component hardcoded a Korean fallback instead of
  // reading the locale prop -- found live in 11 oiyo test components
  // (PerfumePersonalityTest.tsx and siblings) rendering Korean on /en/ and
  // /ja/ routes. Source: low-quality-content-full-audit-2026-08-26.md P1-6.
  if (locale !== "ko") {
    const text = mainText(html);
    const hangul = (text.match(/[가-힣]/g) ?? []).length;
    const cjkOrLatinLetters = (text.match(/[가-힣぀-ヿ一-鿿 a-zA-Z]/g) ?? []).length;
    if (cjkOrLatinLetters > 40 && hangul / cjkOrLatinLetters > 0.3) {
      koreanLeaks.push(file.replace(`${DIST}/`, ""));
    }
  }
}

const baseline = existsSync(BASELINE_FILE)
  ? JSON.parse(readFileSync(BASELINE_FILE, "utf8"))
  : null;

if (!baseline) {
  console.log(
    `content depth audit: no baseline file at ${BASELINE_FILE}. ` +
      `Current counts: ${bare.length} bare pages, ${koreanLeaks.length} non-ko Korean-leak pages. ` +
      `Create the baseline file to enable the gate:\n` +
      JSON.stringify(
        {
          maxBarePages: bare.length,
          maxKoreanLeaks: koreanLeaks.length,
          recordedOn: new Date().toISOString().slice(0, 10),
        },
        null,
        2,
      ),
  );
  process.exit(0);
}

const failures = [];
if (bare.length > baseline.maxBarePages) {
  failures.push(
    `${bare.length} bare pages (h2=0, body<300 units, no FAQ JSON-LD), ceiling is ${baseline.maxBarePages}.\n` +
      `New bare pages since baseline:\n` +
      bare.slice(0, 20).map((f) => `  ${f}`).join("\n") +
      (bare.length > 20 ? `\n  ... and ${bare.length - 20} more` : ""),
  );
}
if (koreanLeaks.length > (baseline.maxKoreanLeaks ?? 0)) {
  failures.push(
    `${koreanLeaks.length} non-ko pages render mostly Korean text (locale-blind component), ` +
      `ceiling is ${baseline.maxKoreanLeaks ?? 0}.\n` +
      koreanLeaks.slice(0, 20).map((f) => `  ${f}`).join("\n") +
      (koreanLeaks.length > 20 ? `\n  ... and ${koreanLeaks.length - 20} more` : ""),
  );
}

if (failures.length) {
  console.error(`content depth audit FAIL (recorded ${baseline.recordedOn}):\n\n${failures.join("\n\n")}`);
  process.exit(1);
}

console.log(
  `content depth audit PASS: ${bare.length} bare pages (ceiling ${baseline.maxBarePages}), ` +
    `${koreanLeaks.length} Korean-leak pages (ceiling ${baseline.maxKoreanLeaks ?? 0}), recorded ${baseline.recordedOn}.`,
);
