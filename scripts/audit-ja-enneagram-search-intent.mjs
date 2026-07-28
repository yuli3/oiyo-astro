import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const [page, component] = await Promise.all([
  readFile(resolve(root, "src/pages/[locale]/enneagram/test.astro"), "utf8"),
  readFile(resolve(root, "src/components/tests/EnneagramTest.tsx"), "utf8"),
]);
const errors = [];
for (const token of ["9タイプ性格診断", "エニアグラム", "9つの性格タイプ", "27問", "タイプ1 改革者", "タイプ9 調停者", "FAQPage", "<Layout"]) if (!page.includes(token)) errors.push(`page token: ${token}`);
for (const token of ["9タイプ性格診断（エニアグラム）", "27問で9つの性格タイプ"]) if (!component.includes(token)) errors.push(`component token: ${token}`);
if (page.includes("ﾀｲﾌﾟ") || component.includes("ﾀｲﾌﾟ")) errors.push("half-width keyword must not be rendered");
if (errors.length) throw new Error(`Japanese Enneagram search-intent audit failed: ${errors.join("; ")}`);
console.log("Japanese Enneagram search-intent audit PASS: direct intent, 9-type scan, FAQ/schema and no half-width keyword.");
