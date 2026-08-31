// 페이지당 h1 정확히 1개 — 래칫.
//
// 네이버 서치어드바이저 2026-08-30 진단의 "H1 요소가 2개 이상 발견" 대응.
// 0개(제목 없음)는 2개보다 나쁘므로 양쪽 다 잡는다.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const CEILING = 0;   // 2026-08-31 수정 후 실측 (수정 전 103)
const dist = resolve(import.meta.dirname, "..", "dist");
const walk = (d, out = []) => {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith(".html")) out.push(p);
  }
  return out;
};
const many = [], none = [];
for (const f of walk(dist)) {
  const html = readFileSync(f, "utf8");
  // noindex 페이지의 h1 은 검색에 의미가 없다 — 색인 대상만 본다.
  if (/<meta name="robots" content="noindex/.test(html)) continue;
  const n = (html.match(/<h1[\s>]/g) ?? []).length;
  const rel = f.slice(dist.length);
  if (n > 1) many.push(`${rel} (h1 ${n}개)`);
  else if (n === 0) none.push(rel);
}
const total = many.length + none.length;
if (total > CEILING) {
  console.error(`single h1 audit FAIL: h1 중복 ${many.length}건 / h1 없음 ${none.length}건 (ceiling ${CEILING})`);
  for (const x of [...many, ...none].slice(0, 15)) console.error(`- ${x}`);
  process.exit(1);
}
console.log(`single h1 audit PASS: h1 중복 0 / h1 없음 0`);
