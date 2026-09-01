#!/usr/bin/env node
// 세계수 셸 감사 — 2026-09-02.
//
// 셸은 새 시각화가 아니라 **페이지의 구조에 준 이름과 표식**이다
// (결정: company-brain AI-Sessions/wiki/decisions/world-tree-shell-replaces-nothing).
// 그래서 깨지는 방식도 그림이 아니라 카피 쪽이다 — 한 층만 이름을 잃어도
// 나머지 두 단어가 서로 무관해 보이고, 그 순간 셸이 아니라 장식이 된다.
//
// usage: node scripts/audit-world-tree-shell.mjs
import { readFileSync } from "node:fs";

const LOCALES = ["ko", "en", "ja", "zh", "fr", "es"];
const PARTS = ["root", "trunk", "leaf"];
const REGISTRY = "src/lib/ontology/registry/ontology-systems.ts";
const PAGE = "src/pages/[locale]/ontology/index.astro";
const MARK = "src/components/ontology/OntologyLayerMark.astro";

const failures = [];
const registry = readFileSync(REGISTRY, "utf8");
const page = readFileSync(PAGE, "utf8");
const mark = readFileSync(MARK, "utf8");

// ── 1. 세 lane 모두 층 이름과 표식을 갖는다 ─────────────────────────────────
for (const [lane, part] of [["innate", "root"], ["test", "trunk"], ["chosen", "leaf"]]) {
  const line = registry.split("\n").find((l) => l.trimStart().startsWith(`${lane}: {`));
  if (!line) { failures.push(`${REGISTRY}: LANE_META 에 ${lane} 이 없다.`); continue; }
  if (!line.includes(`mark: '${part}'`)) {
    failures.push(`${REGISTRY}: ${lane} 의 mark 가 '${part}' 가 아니다. 세 층의 순서(뿌리→줄기→잎)가 곧 페이지의 순서다.`);
  }
  if (!/part: L\(/.test(line)) {
    failures.push(`${REGISTRY}: ${lane} 에 층 이름(part)이 없다. 표식만 있으면 세 단어가 서로 무관해 보인다.`);
  }
}

// ── 2. 표식은 세 종류를 모두 그린다 ────────────────────────────────────────
for (const part of PARTS) {
  if (!mark.includes(`mark === '${part}'`)) {
    failures.push(`${MARK}: '${part}' 표식이 없다.`);
  }
}
// 지표선이 없으면 뿌리와 줄기가 같은 모양으로 읽힌다.
if ((mark.match(/<line/g) ?? []).length < 2) {
  failures.push(`${MARK}: 지표선이 둘 미만이다. 뿌리와 줄기를 가르는 것이 그 선이다.`);
}

// ── 3. 셸 한 줄이 6로케일 전부에 있다 ──────────────────────────────────────
for (const locale of LOCALES) {
  const line = page.split("\n").find((l) => l.trimStart().startsWith(`${locale}: { eyebrow:`));
  if (!line) { failures.push(`${PAGE}: UI 카피에 ${locale} 이 없다.`); continue; }
  if (!/layers: '[^']{20,}'/.test(line)) {
    failures.push(`${PAGE}: ${locale} 의 layers 카피가 없거나 너무 짧다. 세 층이 한 그루라는 사실은 글로 한 번 말해야 한다.`);
  }
}
if (!page.includes("{u.layers}")) {
  failures.push(`${PAGE}: layers 카피가 정의만 되고 렌더되지 않는다.`);
}

// ── 4. 신화 고유명사는 화면에 쓰지 않는다 ──────────────────────────────────
// 이그드라실은 컨셉이지 라벨이 아니다. 화면에는 보통명사만 나온다.
const FORBIDDEN = ["이그드라실", "Yggdrasil", "위그드라실", "세계수", "신목", "World Tree"];
for (const word of FORBIDDEN) {
  for (const [file, src] of [[PAGE, page], [REGISTRY, registry], [MARK, mark]]) {
    // 주석은 컨셉을 설명해도 된다 — 화면에 나오는 문자열만 본다.
    const inCopy = src
      .split("\n")
      .filter((l) => !l.trimStart().startsWith("//") && !l.trimStart().startsWith("*"))
      .some((l) => l.includes(word));
    if (inCopy) {
      failures.push(`${file}: 화면 문자열에 '${word}' 가 있다. 신화 고유명사는 컨셉이지 UI 라벨이 아니다 — 보통명사(뿌리·줄기·잎)만 쓴다.`);
    }
  }
}

if (failures.length) {
  console.error("세계수 셸 감사 FAIL\n");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `세계수 셸 감사 PASS — 세 층 전부 이름·표식 보유, 표식 3종, ` +
    `셸 카피 ${LOCALES.length}로케일 렌더, 화면에 신화 고유명사 0건.`,
);
