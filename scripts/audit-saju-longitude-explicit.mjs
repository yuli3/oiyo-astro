#!/usr/bin/env node
// 사주 경도 인자 명시 감사 — 2026-09-01.
//
// `calculateSaju(birthDate, isLunar, gender, longitude = 135.0)` 은 기본값을 갖는다.
// 인자를 생략한 호출부가 있으면 나중에 정책이 바뀔 때(예: 진태양시를 기본으로
// 전환) **어디가 영향받는지 알 수 없다.** 실제로 2026-09-01 이전에는
// NameEnergyReading 과 ProclaimersDesk 가 생략하고 있어서, 같은 생년월일시가
// 진입 경로에 따라 다른 시주를 냈다(실측 시주 25.5%).
//
// 표준시를 쓰겠다는 뜻이면 STANDARD_MERIDIAN_KST 를 명시한다. 값이 같아도
// 이름이 있으면 의도가 드러난다.
//
// usage: node scripts/audit-saju-longitude-explicit.mjs
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "src";
const failures = [];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

for (const file of walk(ROOT)) {
  // 정의부와 테스트는 대상이 아니다. 테스트는 경계값을 일부러 다양하게 넣는다.
  if (file.endsWith("saju/logic.ts") || /\.test\.tsx?$/.test(file)) continue;
  // 주석과 문자열은 제외한다. city-search.ts 는 파이프라인 설명 주석에
  // `calculateSaju(..., longitude)` 를 적어 두었는데 그것을 호출로 셌다.
  const text = readFileSync(file, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m) => m.replace(/[^\n]/g, " "));
  if (!text.includes("calculateSaju(")) continue;

  // 호출 하나를 괄호 균형으로 떼어 낸다. 여러 줄 호출이 많다.
  let idx = 0;
  while ((idx = text.indexOf("calculateSaju(", idx)) !== -1) {
    const start = idx + "calculateSaju".length;
    let depth = 0, end = start;
    for (; end < text.length; end++) {
      if (text[end] === "(") depth++;
      else if (text[end] === ")") { depth--; if (depth === 0) { end++; break; } }
    }
    const call = text.slice(start, end);
    idx = end;

    // 최상위 콤마로 인자를 센다.
    let d = 0, args = 1;
    for (const ch of call.slice(1, -1)) {
      if ("([{".includes(ch)) d++;
      else if (")]}".includes(ch)) d--;
      else if (ch === "," && d === 0) args++;
    }
    const line = text.slice(0, start).split("\n").length;
    if (args < 4) {
      failures.push(`${file}:${line} — 경도 인자를 생략했다(인자 ${args}개). 표준시면 STANDARD_MERIDIAN_KST 를 명시한다`);
    } else if (/,\s*135(\.0+)?\s*\)/.test(call)) {
      failures.push(`${file}:${line} — 경도에 매직 넘버 135 를 썼다. STANDARD_MERIDIAN_KST 로 바꾼다`);
    }
  }
}

for (const f of failures) console.error(`FAIL ${f}`);
console.log(failures.length
  ? `사주 경도 명시 감사: ${failures.length}건 실패`
  : `사주 경도 명시 감사: PASS — 생산 호출부가 모두 경도를 명시한다`);
process.exitCode = failures.length ? 1 : 0;
