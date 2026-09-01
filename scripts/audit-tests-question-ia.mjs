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

for (const f of failures) console.error(`FAIL ${f}`);
console.log(failures.length
  ? `/tests 질문 IA 감사: ${failures.length}건 실패`
  : `/tests 질문 IA 감사: PASS — lane 4 · 매핑 ${mapped.length}건 · 운세 재진입 0 · 약어 노출 0`);
process.exitCode = failures.length ? 1 : 0;
