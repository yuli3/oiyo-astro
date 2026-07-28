import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const read = (file) => readFile(resolve(ROOT, file), "utf8");
const targets = [
  ["src/pages/[locale]/riasec-career-test.astro", "riasec", "Holland"],
  ["src/pages/[locale]/stress-response-test.astro", "stress-response", "Fight-Flight-Freeze-Fawn"],
  ["src/pages/[locale]/stress-type-test.astro", "stress-type", "Fight-Flight-Freeze-Fawn"],
];
const [sourceNotes, ...pages] = await Promise.all([read("src/data/test-source-notes.ts"), ...targets.map(([file]) => read(file))]);
const errors = [];
for (const [[file, key, basis], page] of targets.map((target, index) => [target, pages[index]])) {
  if (!page.includes("TestSourceNote") || !page.includes(`TEST_SOURCE_NOTES['${key}']`)) errors.push(`${file}: source note not rendered`);
  const entry = sourceNotes.match(new RegExp(`\\n  ['\"]?${key}['\"]?: \\{([\\s\\S]*?)\\n  \\},`))?.[1] ?? "";
  if (!entry.includes(basis)) errors.push(`${key}: basis missing`);
  if (!entry.includes("caution: 'reflection'")) errors.push(`${key}: reflection boundary missing`);
}
if (errors.length) throw new Error(`Career/stress source-boundary audit failed: ${errors.join("; ")}`);
console.log("Career/stress source-boundary audit PASS: 3 existing tests render model basis and reflection (non-diagnostic, non-fixed-label) limits.");
