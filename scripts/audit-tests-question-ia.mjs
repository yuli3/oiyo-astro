#!/usr/bin/env node
// /tests 질문 중심 IA 계약 감사 — 2026-09-01.
//
// 이 페이지는 여섯 분류(척도 중심)에서 네 질문 분류로 재편했다. 재편은 한 번
// 하면 끝나는 일이 아니라 계속 미끄러진다: 새 검사를 추가하면서 lane 매핑을
// 빠뜨리면 그 검사는 허브에서 사라지고(빌드는 통과한다), 운세 실행면을 다시
// 넣으면 허브 역할 분리가 조용히 되돌아간다. 그 둘을 여기서 막는다.
//
// usage: node scripts/audit-tests-question-ia.mjs
import { readFileSync } from "node:fs";
import { TEST_DIRECTORY_EXTRA } from "../src/data/test-directory-extra.ts";
import { SEARCH_ONLY_PATHS } from "../src/data/test-question-lanes.ts";

const PAGE = "src/pages/[locale]/tests/index.astro";
const LANES = "src/data/test-question-lanes.ts";
const page = readFileSync(PAGE, "utf8");
const lanes = readFileSync(LANES, "utf8");

const failures = [];
const fail = (m) => failures.push(m);

// 1) lane 은 정확히 넷이고 각 lane 은 6 로케일 질문을 가진다.
const laneIds = [...lanes.matchAll(/^\s{4}id: "([a-z]+)",$/gm)].map((m) => m[1]);
const EXPECTED = ["self", "relationships", "work", "mood"];
if (laneIds.join(",") !== EXPECTED.join(",")) fail(`lane 이 ${EXPECTED.join("·")} 넷이 아니다: ${laneIds.join(",") || "(없음)"}`);

const LOCALES = ["ko", "en", "ja", "zh", "fr", "es"];
for (const block of lanes.split(/\n  \{\n/).slice(1)) {
  const id = (block.match(/id: "([a-z]+)"/) || [])[1];
  if (!id) continue;
  for (const field of ["question", "label"]) {
    // 한 줄 객체(label)와 여러 줄 객체(question) 둘 다 받는다. 처음 쓴 정규식이
    // 여러 줄만 가정해서 멀쩡한 label 6개를 전부 "비었다"고 보고했다.
    const section = (block.match(new RegExp(`${field}: \\{([^}]*)\\}`)) || [])[1] ?? "";
    for (const locale of LOCALES) {
      // fallback key 로 때우지 않았는지 — 값이 비면 화면에 빈 칸이 남는다.
      const value = (section.match(new RegExp(`${locale}: "([^"]*)"`)) || [])[1];
      if (!value?.trim()) fail(`lane '${id}' 의 ${field}.${locale} 가 비었다`);
    }
  }
}

// 2) 매핑된 모든 경로는 lane 넷 중 하나에 속하고, 빈 lane 이 없다.
const mapped = [...lanes.matchAll(/^\s{2}"(\/[^"]+)": "([a-z]+)",$/gm)].map((m) => ({ path: m[1], lane: m[2] }));
if (!mapped.length) fail("LANE_BY_PATH 가 비었다");
for (const { path, lane } of mapped) if (!EXPECTED.includes(lane)) fail(`${path} 가 알 수 없는 lane '${lane}' 을 가리킨다`);
for (const id of EXPECTED) {
  if (!mapped.some((m) => m.lane === id)) fail(`lane '${id}' 이 비었다 — 빈 분류는 렌더되지 않아 조용히 사라진다`);
}

// 3) 운세·전통 실행면이 다시 들어오지 않았다. 삭제가 아니라 허브 역할 분리이며
//    canonical route 는 살아 있다. 여기 다시 넣으면 그 결정이 되돌아간다.
const FORTUNE = ["/saju/", "/natal/", "/numerology/", "/zodiac/", "/chinese-zodiac", "/blood-type",
  "/face-reading", "/palmistry/", "/elemental-remedy", "/tarot"];
for (const { path } of mapped) {
  const hit = FORTUNE.find((f) => path.startsWith(f));
  if (hit) fail(`운세 실행면이 /tests 에 다시 들어왔다: ${path} (${hit})`);
}

// 4) 카드 첫 화면에 척도 약어를 다시 노출하지 않는다. BWAS·GSE·PHQ-9 같은 이름은
//    방문자가 고르는 근거가 아니라 검사 내부의 출처다.
if (/\{test\.badge\}/.test(page)) fail("카드 첫 화면에 test.badge(척도 약어)가 다시 노출된다");

// 5) 페이지가 실제로 질문 분류를 렌더한다(분류 라벨이 아니라).
if (!/lane\.question\[locale\]/.test(page)) fail("카드 묶음 헤딩이 lane.question 이 아니다");
if (!/visibleLanes\.map/.test(page)) fail("visibleLanes 를 렌더하지 않는다");
// 6) "지금 마음"은 YMYL 이라 묶음 단위 비진단 경계를 유지한다.
if (!/MOOD_BOUNDARY\[locale\]/.test(page)) fail("'지금 마음' 묶음의 비진단 경계 문구가 없다");

// 추가 항목이 분류나 검색 양쪽에서 빠지는 조용한 손실을 막는다.
const mappedPaths = new Set(mapped.map(({ path }) => path));
if (mappedPaths.size !== mapped.length) fail("중복 lane 경로가 있다");
const corePaths = new Set([...page.matchAll(/href: localePath\(locale, '([^']+)'\)/g)].map((m) => m[1]));
const extraPaths = new Set(TEST_DIRECTORY_EXTRA.map((entry) => `/${entry.slug}`));
for (const path of corePaths) {
  if (!FORTUNE.some((prefix) => path.startsWith(prefix)) && !mappedPaths.has(path)) fail(`대표 목록의 분류 누락: ${path}`);
}
if (extraPaths.size !== TEST_DIRECTORY_EXTRA.length) fail("추가 디렉터리에 중복 경로가 있다");
for (const path of mappedPaths) {
  if (!corePaths.has(path) && !extraPaths.has(path)) fail(`매핑의 실제 검사 데이터가 없다: ${path}`);
  if (path in SEARCH_ONLY_PATHS) fail(`분류와 검색 전용에 중복 등록됐다: ${path}`);
}
for (const path of extraPaths) {
  if (!mappedPaths.has(path) && !(path in SEARCH_ONLY_PATHS)) fail(`분류·검색에서 누락: ${path}`);
}
for (const [path, reason] of Object.entries(SEARCH_ONLY_PATHS)) {
  if (!extraPaths.has(path) || !reason.trim()) fail(`검색 전용 경로의 데이터·제외 사유 부재: ${path}`);
}
if (/TEST_DIRECTORY_EXTRA\.map\(\(entry\) => \(/.test(page)) fail("추가 목록이 별도 덤프로 다시 렌더된다");
if (!page.includes('lane.tests.slice(0, 3)') || !page.includes('lane.tests.slice(3)') || !page.includes('<details')) fail("대표 3개·나머지 펼침 구조가 없다");
if (!page.includes('Object.keys(SEARCH_ONLY_PATHS)') || !page.includes('data-search-results')) fail("검색 전용 도구의 탐색 경로가 없다");

for (const f of failures) console.error(`FAIL ${f}`);
console.log(failures.length
  ? `/tests 질문 IA 감사: ${failures.length}건 실패`
  : `/tests 질문 IA 감사: PASS — lane 4 · 매핑 ${mapped.length}건 · 운세 재진입 0 · 약어 노출 0 · 추가 ${extraPaths.size}건 분류/검색 보존`);
process.exitCode = failures.length ? 1 : 0;
