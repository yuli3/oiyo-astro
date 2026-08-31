// 내부 링크 트레일링 슬래시 래칫.
//
// 왜: Cloudflare Pages는 슬래시 없는 경로를 308로 정규화한다. Google·Bing은 308을 따라가
// 목표를 색인하지만 네이버 Yeti는 "리다이렉션된 페이지"로 분류해 수집제한하고 목표를
// 색인하지 않는다. 2026-08-30 서치어드바이저 진단: 색인 0 / 수집제한 21(전부 리다이렉션).
// 내부 링크가 곧 크롤 경로이므로 링크를 canonical(서빙) 형태로 내야 한다.
//
// 래칫이다 — 기존 수치를 한 번에 0으로 만들 의무는 없지만 늘리면 실패한다.
// 개선하면 CEILING을 낮춘다. 통과시키려고 올리지 않는다.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const CEILING = 438;          // 2026-08-31 실측 (개선 전 30,568)
const dist = resolve(import.meta.dirname, "..", "dist");
const LINK = /href="\/(?:ko|en|ja|zh|fr|es)\/[a-z0-9/-]*[a-z0-9]"/g;

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith(".html")) out.push(p);
  }
  return out;
}

let total = 0;
const worst = new Map();
for (const file of walk(dist)) {
  for (const m of readFileSync(file, "utf8").matchAll(LINK)) {
    total += 1;
    worst.set(m[0], (worst.get(m[0]) ?? 0) + 1);
  }
}

if (total > CEILING) {
  console.error(`internal link slash audit FAIL: ${total} slashless internal links (ceiling ${CEILING})`);
  console.error("새로 추가된 링크는 서빙 형태(트레일링 슬래시)로 낼 것 — localePath() 또는 withTrailingSlash() 사용.");
  for (const [href, n] of [...worst].sort((a, b) => b[1] - a[1]).slice(0, 10)) console.error(`- ${n}× ${href}`);
  process.exit(1);
}
const slack = CEILING - total;
console.log(`internal link slash audit PASS: ${total} slashless internal links (ceiling ${CEILING}${slack ? `, ${slack} 개선됨 — CEILING을 ${total}로 낮출 것` : ""})`);
