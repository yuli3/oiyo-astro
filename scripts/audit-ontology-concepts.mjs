#!/usr/bin/env node
// 온톨로지 개념 절 계약 감사 — 2026-09-01.
//
// 아카식 PRD 의 수용 기준을 코드로 내린다. 이 절이 미끄러지는 방향은 정해져 있다:
// 세 해석 층 중 하나가 빠지면 남은 층이 사실처럼 읽히고, 개념이 프로필 입력을
// 요구하기 시작하면 좌표가 되며, 단정형 문구가 들어오면 점술 주장이 된다.
//
// usage: node scripts/audit-ontology-concepts.mjs
import { readFileSync } from "node:fs";

const DATA = "src/data/ontology-concepts.ts";
const PAGE = "src/pages/[locale]/ontology/index.astro";
const BRIDGES = "src/data/ontology-wiki-bridges.ts";
const data = readFileSync(DATA, "utf8");
const page = readFileSync(PAGE, "utf8");
const bridges = readFileSync(BRIDGES, "utf8");

const LOCALES = ["ko", "en", "ja", "zh", "fr", "es"];
const LAYERS = ["historical", "faith", "modern"];
const failures = [];
const fail = (m) => failures.push(m);

// 개념 블록을 하나씩 떼어 본다.
const blocks = data.split(/\n  \{\n/).slice(1);
if (!blocks.length) fail("ONTOLOGY_CONCEPTS 가 비었다");

for (const block of blocks) {
  const id = (block.match(/id: '([a-z-]+)'/) || [])[1];
  if (!id) continue;

  // 1) wikiSlug 는 브리지에 등재돼 있어야 한다. 없으면 정의 링크가 안 뜬다.
  const slug = (block.match(/wikiSlug: '([^']+)'/) || [])[1];
  if (!slug) fail(`${id}: wikiSlug 없음`);
  else if (!bridges.includes(`'${slug}'`)) fail(`${id}: '${slug}' 가 WIKI_DEF_LOCALES 에 없다 — 정의 링크가 렌더되지 않는다`);

  // 2) name·summary 6 로케일, 세 층 각각 6 로케일. fallback 으로 때우지 않는다.
  for (const field of ["name", "summary"]) {
    const section = (block.match(new RegExp(`${field}: \\{([\\s\\S]*?)\\n    \\},`)) || [])[1] ?? "";
    for (const l of LOCALES) {
      if (!new RegExp(`\\b${l}: ['"]`).test(section)) fail(`${id}: ${field}.${l} 누락`);
    }
  }
  for (const layer of LAYERS) {
    const section = (block.match(new RegExp(`${layer}: \\{([\\s\\S]*?)\\n      \\},`)) || [])[1] ?? "";
    if (!section.trim()) { fail(`${id}: layers.${layer} 가 없다 — 세 층은 반드시 함께 보인다`); continue; }
    for (const l of LOCALES) {
      if (!new RegExp(`\\b${l}: ['"]`).test(section)) fail(`${id}: layers.${layer}.${l} 누락`);
    }
  }

  // 3) 단정형·진단형 문구 금지. 개념 설명이 점술 주장이나 건강 판정으로
  //    미끄러지는 것을 막는다. 부정문("아니다", "not a")은 경계 문구이므로 통과.
  const claims = /당신의 전생|전생을 알려|운명을 알려|반드시 일어난|틀림없이|will happen|reveals your past life|your destiny is|diagnos/i;
  if (claims.test(block)) fail(`${id}: 단정형·진단형 문구가 있다`);
}

// 4) 페이지가 세 층을 실제로 렌더하고, 정의 링크와 면책을 함께 둔다.
if (!/LAYER_LABELS\[layer\]\[locale\]/.test(page)) fail("페이지가 세 해석 층 라벨을 렌더하지 않는다");
if (!/\['historical', 'faith', 'modern'\]/.test(page)) fail("페이지가 세 층을 모두 순회하지 않는다");
if (!/<WikiDefinitionLink/.test(page)) fail("개념에 wiki 정의 링크가 없다 — canonical 역추적이 끊긴다");
if (!/DISCLAIMERS\['symbolic-interpretation'\]\[locale\]/.test(page)) fail("중앙 면책 문구가 붙어 있지 않다");

// 5) 개념 절은 프로필 입력을 요구하지 않는다. 좌표 lane 의 상태 속성이 섞이면
//    입력해야 보이는 것으로 오해된다.
const section = (page.match(/개념 절 — 좌표가 아닌 것[\s\S]*?<\/section>/) || [])[0] ?? "";
if (!section) fail("개념 절을 찾을 수 없다");
else for (const attr of ["data-req", "data-locked", "client:load", "client:visible"]) {
  if (section.includes(attr)) fail(`개념 절에 '${attr}' 가 있다 — 개념은 입력·상태 없이 정적으로 읽혀야 한다`);
}

for (const f of failures) console.error(`FAIL ${f}`);
console.log(failures.length
  ? `온톨로지 개념 감사: ${failures.length}건 실패`
  : `온톨로지 개념 감사: PASS — 개념 ${blocks.length}건 · 6로케일 × 3층 · 정의 링크·면책 연결`);
process.exitCode = failures.length ? 1 : 0;
