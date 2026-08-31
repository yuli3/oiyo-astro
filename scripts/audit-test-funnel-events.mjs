// 문항형 검사의 퍼널 계측 짝(pair) 감사.
//
// 왜 있나: 2026-08-31 GA4 실측에서 test_completed 204건 / test_started 14건이 나왔다.
// 시작 이벤트가 컴포넌트 11개 중 4개에만 있어 완주율(시작→완료)의 분모가 없었고,
// 그 사실을 아무 검사도 잡아내지 못했다. 이 감사는 그 재발을 막는다.
//
// 규칙: src/components/tests 의 컴포넌트가 test_completed 를 발화하면 test_started 도 발화해야 한다.
// 계산기(src/components/tools)는 대상이 아니다 — 계약상 test_started 의미가 "첫 문항 응답"이라
// 입력→계산 화면에는 대응하는 순간이 없다. 섞으면 지표 의미가 무너진다.
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const dir = resolve(import.meta.dirname, "..", "src/components/tests");
const files = readdirSync(dir).filter((f) => f.endsWith(".tsx") && !f.includes(".test."));
const errors = [];
let paired = 0;

for (const file of files) {
  const src = readFileSync(resolve(dir, file), "utf8");
  const completed = /gaEvent\(\s*['"]test_completed['"]/.test(src);
  const started = /gaEvent\(\s*['"]test_started['"]/.test(src);
  if (!completed) continue;
  if (!started) errors.push(`${file}: test_completed 를 발화하지만 test_started 가 없다 — 완주율의 분모가 사라진다`);
  else paired += 1;
}

if (errors.length) {
  console.error(`test funnel event audit: ${errors.length} error(s)`);
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}
console.log(`test funnel event audit: ${paired} questionnaire component(s) with a complete started→completed pair`);
