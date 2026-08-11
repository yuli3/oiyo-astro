#!/usr/bin/env node
/**
 * Questionnaire 이관 코호트 감사.
 *
 * 테스트 컴포넌트를 "질문 단계 UI 를 공용 Questionnaire 로 바꿀 수 있는가" 기준으로
 * 분류한다. 파일을 하나씩 눈으로 보는 대신 **구조 서명**으로 판정한다.
 *
 * 서명을 만드는 방법이 이 스크립트의 핵심이다:
 *
 *   1. 이관이 실제로 교체하는 영역 = 컴포넌트의 **질문 단계 JSX**. 이 코드베이스에는
 *      두 가지 형태가 있다 — 이른 반환(`if (!done) return (...)`)과, 결과를 먼저
 *      반환하고 질문 UI 를 마지막 `return` 에 두는 형태. 선택지 `.map(` 을 포함하는
 *      `return (` 를 찾아 그 영역만 뜬다.
 *   2. 문자열 리터럴을 전부 지운 뒤 해시한다. 그래야 문구·로케일 차이로 코호트가
 *      쪼개지지 않고 **구조가 같은 것끼리** 묶인다.
 *
 * 같은 서명 = 같은 패치가 그대로 먹는다는 뜻이고, 그때만 가드형 일괄 이관을 한다.
 * 서명이 1개짜리로 흩어져 있으면 개별 이관이라는 뜻이며, 그 사실 자체가 판정이다.
 *
 * 2026-08-11 로 step 형은 전부 이관됐다. 남은 후보는 전부 matrix 이며, 이 스크립트는
 * 이제 **회귀 감시용**이다 — 새 테스트가 공용 Questionnaire 를 안 쓰고 들어오면
 * candidates 의 step 이 0 이 아니게 된다.
 *
 * Usage: node scripts/audit-questionnaire-cohorts.mjs [--json] [--cohort <hash>]
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const TESTS_DIR = new URL("../src/components/tests/", import.meta.url).pathname;

// 의료·정신건강 screening 은 응답 편집·되돌리기 의미론이 제품적으로 다르다.
const SCREENING =
  /Screening|Depression|Anxiety|Adhd|Ptsd|Burnout|Codependency|EmotionalEating|DopamineDependency|Loneliness|SocialAnxiety|ToxicRelationship/;
// 시간 측정·정답이 있는 인지 과제는 되돌리기가 결과를 무효화한다.
// Chimp 는 타일을 순서대로 눌러 기억을 재는 과제라 문항이 아예 없다.
const TIMED = /Typing|Reaction|IQTest|EnglishLevel|Memory|Chimp/;

const md5 = (s) => createHash("md5").update(s).digest("hex").slice(0, 8);

/** 문자열·템플릿 리터럴과 공백을 지운다. 문구가 아니라 구조만 남긴다. */
const normalize = (s) =>
  s
    .replace(/`(?:\\.|[^`\\])*`/g, "``")
    .replace(/'(?:\\.|[^'\\])*'/g, "''")
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/\s+/g, " ")
    .trim();

/** open 문자에서 시작해 짝이 맞는 close 까지의 구간을 반환한다. */
function balanced(src, from, open, close) {
  let depth = 0;
  for (let i = from; i < src.length; i += 1) {
    if (src[i] === open) depth += 1;
    else if (src[i] === close) {
      depth -= 1;
      if (depth === 0) return src.slice(from, i + 1);
    }
  }
  return null;
}

/** 선택지 .map( 을 품은 `return (` 영역 = 이관이 교체하는 질문 단계 JSX. */
function questionStepJsx(src) {
  const regions = [];
  const re = /return \(/g;
  let m;
  while ((m = re.exec(src))) {
    const region = balanced(src, m.index + "return ".length, "(", ")");
    if (region) regions.push({ text: region, at: m.index });
  }
  // 선택지를 그리는 map 과 그 선택을 받는 핸들러가 같이 있는 영역을 고른다.
  const hits = regions.filter((r) => /\.map\(/.test(r.text) && /onClick=\{/.test(r.text));
  if (hits.length === 0) return null;
  // 가장 짧은 것 = 결과 화면까지 감싼 바깥 영역이 아니라 질문 단계 자체.
  return hits.sort((a, b) => a.text.length - b.text.length)[0];
}

/**
 * 질문 단계 JSX 가 **다른 map 의 콜백 안에서** 반환되는가.
 *
 * PoliticalCompass 는 `currentKeys.map((key, qi) => { ... return (문항카드) })` 로
 * 한 화면에 여러 문항을 깐다. 문항 카드만 떼어 보면 step 과 구별되지 않아서
 * `questions.map(` 이름 규칙에 걸리지 않았다. 반환 지점 바로 앞을 보면 드러난다.
 */
function returnedInsideMap(src, at) {
  return /\.map\(\s*\(?[\w{}[\],\s]*\)?\s*=>\s*\{[^{}]*$/.test(src.slice(Math.max(0, at - 600), at));
}

/**
 * 선택지 map 을 또 다른 map 이 **같은 영역 안에서** 감싸는가.
 *
 * returnedInsideMap 은 문항 카드를 별도 `return` 으로 빼는 형태를 잡고, 이쪽은
 * BiologicalAge 처럼 `FACTORS.map(f => ... f.options.map(...))` 로 한 페이지에
 * 전 문항을 인라인으로 까는 형태를 잡는다. 둘은 같은 사실(=matrix)의 다른 서식이다.
 */
function nestedOptionMap(jsx) {
  const handler = jsx.indexOf("onClick={");
  if (handler === -1) return false;
  // 첫 onClick 앞에 열린 map 이 둘 이상이면 바깥쪽은 문항 목록이다.
  return (jsx.slice(0, handler).match(/\.map\(/g) ?? []).length >= 2;
}

/**
 * 한 화면에서 여러 항목을 켜고 끄는 체크리스트인가(HolmesRahe).
 *
 * 문항 단위 진행이 아예 없다 — 목록을 훑고 해당하는 것을 모두 고른 뒤 한 번 제출한다.
 * Questionnaire 로 옮기는 것은 UI 교체가 아니라 도구 자체를 바꾸는 일이다.
 */
const isMultiSelect = (jsx) =>
  !!jsx && /\b(checked|selected|picked)\.has\(/.test(jsx.text);

/**
 * 카드를 분류하고 순위를 매기는 도구인가(LifeValues).
 *
 * 문항·선택지가 없다 — 카드를 버킷에 넣고 상위 몇 개를 정렬한다. Questionnaire 로
 * 옮길 대상이 아니라 애초에 다른 도구다.
 */
const isCardSort = (src) =>
  /useState<ValueId\[\]>|setRanked\(|Partial<Record<ValueId, Bucket>>/.test(src);

/**
 * 이관 가능성을 가르는 진짜 축은 응답 자료구조가 아니라 **상호작용 모델**이다.
 *
 *   step   — 한 화면에 한 문항. 공용 Questionnaire 와 같은 모델이라 껍데기만 교체하면 된다.
 *   matrix — 한 페이지에 전 문항을 나열하는 설문지형. Questionnaire 로 옮기는 것은
 *            UI 교체가 아니라 상호작용 재설계이며 완주율·분량·analytics 가 함께 바뀐다.
 *
 * 처음에는 answerShape(record/array)로 갈랐는데 그건 증상이었다 — record 안에도
 * step 형이 있고 array 안에도 matrix 형이 있다.
 */
function flowModel(region, src) {
  if (region && /\bquestions\.map\(/.test(region.text)) return "matrix";
  // 문항 목록 map 의 **이름**으로만 판정하면 놓친다 — returnedInsideMap 참고.
  if (region && returnedInsideMap(src, region.at)) return "matrix";
  if (region && nestedOptionMap(region.text)) return "matrix";
  if (/\bquestions\[(?:current|idx|step|i)\]/.test(src)) return "step";
  return region && /\.map\(/.test(region.text) ? "step" : "unknown";
}

function answerShape(src) {
  if (/useState<(?:number|string)\[\]>|\.\.\.answers/.test(src)) return "array";
  if (/useState<Record</.test(src)) return "record";
  if (/setScore\(|score \+=|prev \+/.test(src)) return "accumulator";
  return "unknown";
}

// 문항별 분류 배지는 한때 제외 사유였다. `subtitle` 에 합치면 정보가 보존된다는 것을
// RiskTolerance·InnerStrength·Hexaco·Tci 에서 확인했으므로 더는 제외하지 않는다.

/** 되돌아가기 UI 가 이미 제품 계약인지. 없으면 이관이 기능을 새로 추가하는 셈이다. */
const hasBackAffordance = (src) =>
  /이전 질문|前の質問|Previous question|function (previous|goBack|back)\b/.test(src);

const rows = [];
for (const name of readdirSync(TESTS_DIR).filter((f) => f.endsWith(".tsx"))) {
  if (name.includes(".test.") || name.includes(".contract.")) continue;
  const src = readFileSync(join(TESTS_DIR, name), "utf8");

  if (src.includes("ui/questionnaire")) {
    rows.push({ name, status: "migrated" });
    continue;
  }

  const jsx = questionStepJsx(src);
  const exclusion = SCREENING.test(name)
    ? "screening"
    : TIMED.test(name)
      ? "timed"
      : isMultiSelect(jsx)
        ? "multi-select"
        : isCardSort(src)
          ? "card-sort"
          : null;
  rows.push({
    name,
    status: exclusion ? "excluded" : "candidate",
    exclusion,
    answerShape: answerShape(src),
    flow: flowModel(jsx, src),
    jsxHash: jsx ? md5(normalize(jsx.text)) : null,
    jsxLines: jsx ? jsx.text.split("\n").length : 0,
    back: hasBackAffordance(src),
  });
}

const migrated = rows.filter((r) => r.status === "migrated");
const excluded = rows.filter((r) => r.status === "excluded");
const candidates = rows.filter((r) => r.status === "candidate");

const cohorts = new Map();
for (const row of candidates) {
  const key = `${row.flow}/${row.answerShape}:${row.jsxHash ?? "unparsed"}`;
  if (!cohorts.has(key)) cohorts.set(key, []);
  cohorts.get(key).push(row);
}
const ranked = [...cohorts.entries()].sort((a, b) => b[1].length - a[1].length);

const cohortArg = process.argv.indexOf("--cohort");
if (cohortArg !== -1) {
  const want = process.argv[cohortArg + 1];
  const hit = ranked.find(([key]) => key.endsWith(want));
  if (!hit) {
    console.error(`no cohort matching ${want}`);
    process.exit(1);
  }
  for (const m of hit[1]) console.log(m.name);
  process.exit(0);
}

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ migrated: migrated.length, excluded, candidates, cohorts: ranked }, null, 2));
  process.exit(0);
}

console.log("questionnaire cohort audit");
console.log(`  migrated   ${migrated.length}`);
console.log(`  excluded   ${excluded.length}  (${[...new Set(excluded.map((r) => r.exclusion))].join(", ")})`);
const byFlow = candidates.reduce((a, r) => ((a[r.flow] = (a[r.flow] ?? 0) + 1), a), {});
console.log(`  candidates ${candidates.length}  ${JSON.stringify(byFlow)}`);
console.log("  matrix = 전 문항 나열형. Questionnaire 이관은 UI 교체가 아니라 상호작용 재설계다.\n");
console.log("후보 코호트 (같은 응답 구조 + 같은 질문 단계 JSX = 일괄 패치 가능):");
for (const [key, members] of ranked) {
  const backs = members.filter((m) => m.back).length;
  const tag = members.length >= 3 ? "BULK" : members.length === 2 ? "pair" : "solo";
  console.log(
    `  ${String(members.length).padStart(3)}  ${tag.padEnd(4)}  ${key.padEnd(20)} 뒤로가기 ${backs}/${members.length}  ~${members[0].jsxLines}줄`,
  );
  if (members.length <= 8) {
    console.log(`        ${members.map((m) => m.name.replace(/Test\.tsx$/, "")).join(", ")}`);
  }
}
