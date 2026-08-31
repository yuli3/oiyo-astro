// 사이트맵과 robots meta 의 일관성 감사 — 허용치 0.
//
// astro.config.mjs 의 크롤 예산 정책이 요구하는 lockstep 을 실제로 강제한다:
// "sitemap-listed but noindex is a contradictory signal".
// 2026-08-31 실측에서 14개 URL 이 사이트맵에 있으면서 noindex 였다.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const dist = resolve(import.meta.dirname, "..", "dist");
const urls = [];
for (const f of readdirSync(dist)) {
  if (!/^sitemap-\d+\.xml$/.test(f)) continue;
  for (const m of readFileSync(join(dist, f), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)) urls.push(m[1]);
}
if (!urls.length) { console.error("sitemap noindex audit: 사이트맵 URL 을 찾지 못했다 — 빌드 후 실행할 것"); process.exit(1); }

const bad = [];
for (const url of urls) {
  const path = new URL(url).pathname;
  const file = join(dist, path, "index.html");
  if (!existsSync(file)) continue;
  if (/<meta name="robots" content="noindex/.test(readFileSync(file, "utf8"))) bad.push(path);
}
if (bad.length) {
  console.error(`sitemap noindex audit FAIL: ${bad.length} URL 이 사이트맵에 있으면서 noindex 다`);
  console.error("config/noindex-routes.js 에 패턴을 추가하거나 페이지의 noindex 선언을 걷어낼 것.");
  for (const p of bad.slice(0, 20)) console.error(`- ${p}`);
  process.exit(1);
}
console.log(`sitemap noindex audit PASS: ${urls.length} sitemap URLs, 0 noindex contradiction`);
