// #66 Wave 0 게이트: 유형별 조언 데이터셋이 abuse 회피·인식론 레인 계약 안에 있는지.
//
// 이 감사가 지키는 것(설계: brain design/type-advice-dataset-2026-07-17):
// 1) 조언은 데이터다 — 신규 indexable URL 0. 페이지를 만들면 여기서 FAIL.
// 2) 곱집합 금지 — 유형 조합 id가 아니라 construct 조건 매칭만.
// 3) 인식론 레인 — tier가 표현 강도를 결정, 출처 필수 tier는 출처 없이 불가.
// 4) Wave 0 상한 12개 — "12개를 잘 쓰는 게 1,920개를 찍는 것보다 낫다"(2026-07-14 교훈).
import { readFile, readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const catalog = JSON.parse(await readFile(new URL("config/type-advice-v1.json", root), "utf8"));
const source = await readFile(new URL("src/assessments/advice/type-advice.ts", root), "utf8");
const errors = [];

// --- 1) 카탈로그 계약 ---
if (catalog.schema !== "oiyo.type-advice-catalog" || catalog.schemaVersion !== 1) errors.push("catalog schema/version 불일치");
if (!Array.isArray(catalog.advices)) errors.push("advices 배열 없음");
if (catalog.advices.length > 12) errors.push(`Wave 0 상한 초과: ${catalog.advices.length} > 12 — 확대는 GA4 측정 후(Wave 1)`);
if (!catalog.reviewNote?.includes("사람 게이트")) errors.push("공개 전 사람 문구 검수 게이트 표기 누락");

const ids = catalog.advices.map((a) => a.id);
if (new Set(ids).size !== ids.length) errors.push("advice id 중복");

// --- 2) 곱집합 금지: 유형 조합을 id나 construct로 만들지 않았는지 ---
const COMBO_ID = /(mbti|istj|enfp|intp|entj)[-_]?(taurus|aries|virgo|zodiac|saju)/i;
const COMBO_CONSTRUCT = /\bcombo\.|\bcombined\.|×|x-cross/i;
for (const advice of catalog.advices) {
  if (COMBO_ID.test(advice.id)) errors.push(`${advice.id}: 유형 곱집합 id 금지 — construct 조건으로 표현할 것`);
  for (const c of [...(advice.match?.any ?? []), ...(advice.match?.none ?? [])]) {
    if (COMBO_CONSTRUCT.test(c.constructId ?? "")) errors.push(`${advice.id}: 조합 construct 금지(${c.constructId})`);
  }
}

// --- 3) 인식론 레인: symbolic-tradition에 실행 지시가 붙지 않았는지 ---
const ACTION_VERBS = /해\s*보세요|하세요|적어\s*보세요|골라\s*보세요|정해\s*두세요|잡아\s*두세요|바꿔/;
for (const advice of catalog.advices) {
  if (advice.evidenceTier === "symbolic-tradition") {
    const ko = `${advice.copy?.ko?.title ?? ""} ${advice.copy?.ko?.body ?? ""}`;
    if (ACTION_VERBS.test(ko)) errors.push(`${advice.id}: symbolic-tradition은 실행 지시 불가 — 정보 제시까지만`);
    if (!/전통적으로|재미로|관점/.test(ko)) errors.push(`${advice.id}: symbolic-tradition은 전통·재미 프레이밍 필수`);
  }
  if (["validated-scale", "research-inspired"].includes(advice.evidenceTier) && !advice.sources?.length) {
    errors.push(`${advice.id}: ${advice.evidenceTier}는 출처 필수`);
  }
}

// --- 4) 구현 토큰 ---
for (const token of [
  "CRISIS_CONSTRUCTS",
  "ADVICE_FORBIDDEN_PATTERNS",
  "TIER_EXPRESSION",
  "needsCrisisRouting",
  "isEligibleAdviceSignal",
  "confidenceBand",
  "freshness",
  "CONSTRUCT_ASSESSMENT_BINDINGS",
  "state !== \"clear\"",
]) {
  if (!source.includes(token)) errors.push(`구현 토큰 누락: ${token}`);
}
if (/\bfetch\s*\(|localStorage|sessionStorage/.test(source)) errors.push("매칭 엔진은 네트워크·저장소를 쓰지 않는다");

// --- 5) 신규 indexable URL 0 (핵심 abuse 회피) ---
const pages = await readdir(new URL("src/pages/", root), { recursive: true });
const advicePages = pages.filter((p) => /advice/i.test(String(p)) && /\.(astro|md|mdx)$/.test(String(p)));
if (advicePages.length) {
  errors.push(`조언 전용 페이지 발견(${advicePages.join(", ")}) — 조언은 기존 결과 화면에서만 소비, 신규 URL은 Wave 2 게이트`);
}

// --- 6) 행동 게이트: vitest가 실제로 통과해야 한다 ---
const vitest = fileURLToPath(new URL("node_modules/vitest/vitest.mjs", root));
const run = spawnSync(process.execPath, [vitest, "run", "src/assessments/advice/type-advice.test.ts"], {
  cwd: fileURLToPath(root), encoding: "utf8",
});
if (run.status !== 0) errors.push(`vitest 실패:\n${(run.stdout || "") + (run.stderr || "")}`);

if (errors.length) {
  console.error("type-advice audit: FAIL");
  for (const e of errors) console.error(" -", e);
  process.exit(1);
}
console.log(`type-advice audit: PASS (${catalog.advices.length}/12 advices · 곱집합 0 · 신규 URL 0 · 인식론 레인 준수 · vitest green)`);
