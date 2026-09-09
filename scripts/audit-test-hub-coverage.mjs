#!/usr/bin/env node
// /tests 허브 도달성 감사 — 2026-09-09.
//
// 왜 이 감사가 따로 필요한가:
//
// `audit-tests-question-ia.mjs` 는 **디렉터리에 있는 검사**가 lane 에 매핑됐는지
// 본다. 그래서 디렉터리에 애초에 없는 검사는 그 감사에 걸리지 않는다. 실제로
// 2026-09-09 에 RIASEC 이 그렇게 빠져 있는 것을 세운이 발견했고, 전수로 대조하니
// HEXACO·TCI·권위주의 척도·조선 붕당·경제학파 다섯이 더 나왔다. 전부 라이브였고
// 200 을 주고 문항 UI 가 있었는데 허브에서 닿을 수 없었다. HEXACO 와 TCI 는 결과
// 공유 카드까지 붙어 있어서, **사이트 안에서 찾을 수 없는 페이지의 결과가 밖으로는
// 공유될 수 있는** 상태였다.
//
// 허브 목록이 손으로 관리되는 한 이 결함은 반복된다. 검사를 추가할 때 데이터 두
// 파일을 같이 고쳐야 하고, 안 고치면 빌드는 통과하면서 조용히 빠진다. 여기서 막는다.
//
// 판별 기준은 파일 이름이 아니라 **`components/tests/` 임포트**다. 이름 규칙은
// `authoritarian/test.astro` 처럼 어긋나고 새 규칙이 생길 때마다 새는데, 검사
// 컴포넌트를 렌더한다는 사실은 그 페이지가 검사라는 것의 정의에 가깝다.
//
// usage: node scripts/audit-test-hub-coverage.mjs
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { LANE_BY_PATH, SEARCH_ONLY_PATHS } from "../src/data/test-question-lanes.ts";

const PAGES_ROOT = "src/pages/[locale]";

/** 허브에 싣지 않는 것이 맞는 경로와 그 이유. 비워 두면 안 된다. */
const EXEMPT = {
  // 예: "/some/route": "왜 허브에 없는 것이 맞는가",
};

// 릴리스 게이트 뒤의 초안은 색인에서 빠져 있다(Layout 에 noindex 를 넘긴다).
// 색인에 넣지 않기로 한 페이지를 허브에 실으라고 요구하는 것은 틀린 규칙이다.
// 다만 조용히 넘기지 않고 아래에 세어서 보고한다 — **게이트가 열려 noindex 를
// 떼는 순간 이 감사가 다시 걸리고**, 그때 허브에 넣지 않으면 빌드가 막힌다.
const isGatedDraft = (source) => /<Layout[^>]*\snoindex=\{/.test(source);

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (name.endsWith(".astro")) out.push(full);
  }
  return out;
}

const failures = [];
const fail = (m) => failures.push(m);

const hubPaths = new Set([...Object.keys(LANE_BY_PATH), ...Object.keys(SEARCH_ONLY_PATHS)]);

const testPages = [];
const gatedDrafts = [];
for (const file of walk(PAGES_ROOT)) {
  const source = readFileSync(file, "utf8");
  // 검사 컴포넌트를 렌더하는 페이지만. 목록·가이드 페이지는 임포트하지 않는다.
  if (!/from\s+["'][^"']*components\/tests\/[A-Za-z]/.test(source)) continue;
  // 동적 라우트는 한 페이지가 여러 검사를 낳으므로 이 감사의 대상이 아니다.
  if (/\[[^\]]+\]/.test(relative(PAGES_ROOT, file))) continue;
  const raw = relative(PAGES_ROOT, file).split(sep).join("/").replace(/\.astro$/, "");
  const route = raw === "index" ? "/" : `/${raw}`;
  if (isGatedDraft(source)) { gatedDrafts.push(route); continue; }
  testPages.push(route);
}

for (const route of testPages.sort()) {
  if (hubPaths.has(route)) continue;
  if (route in EXEMPT) {
    if (!EXEMPT[route]?.trim()) fail(`허브 제외 사유가 비었다: ${route}`);
    continue;
  }
  fail(`라이브 검사인데 /tests 에서 닿을 수 없다: ${route}`
    + `  → src/data/test-directory-extra.ts 에 제목·설명(6로케일)을 넣고`
    + ` src/data/test-question-lanes.ts 의 LANE_BY_PATH 에 lane 을 매핑한다`);
}

for (const route of Object.keys(EXEMPT)) {
  if (!testPages.includes(route)) fail(`EXEMPT 에 남은 유령 경로: ${route}`);
}

for (const f of failures) console.error(`FAIL ${f}`);
console.log(
  failures.length
    ? `/tests 도달성 감사: ${failures.length}건 실패`
    : `/tests 도달성 감사: PASS — 검사 페이지 ${testPages.length}건 전부 허브에서 도달 가능`
    + (gatedDrafts.length ? ` · 게이트 대기 ${gatedDrafts.length}건(${gatedDrafts.join(", ")})` : "")
    + (Object.keys(EXEMPT).length ? ` · 제외 ${Object.keys(EXEMPT).length}건` : ""),
);
process.exitCode = failures.length ? 1 : 0;
