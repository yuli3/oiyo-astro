#!/usr/bin/env node
// 모션 계약 감사 — 2026-09-01.
//
// `prefers-reduced-motion` 을 컴포넌트마다 각자 처리하면, 새 애니메이션이
// 들어올 때마다 누락될 자리가 하나씩 늘어난다. 실제로 이 감사를 만들기 전
// RoleVisualSystemPrototype 은 전역 담요 규칙과 **글자 그대로 같은 블록**을
// 자기 컴포넌트에만 스코프해 갖고 있었다 — 규칙은 이미 발견됐는데 공유되지
// 않았다는 뜻이다.
//
// 계약은 두 겹이다.
//   CSS  — src/styles/global.css 의 전역 블록이 animation/transition 을 덮는다.
//   JS   — canvas/WebGL/rAF 는 CSS 가 못 닿는다. useReducedMotion() /
//          prefersReducedMotion() 으로 각자 처리해야 한다.
//
// usage: node scripts/audit-motion-contract.mjs
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const GLOBAL_CSS = "src/styles/global.css";
// 상태를 전달하는 모션만 담요에서 빠진다. 이 한도를 올리기 전에, 그 모션이
// 정말 정보를 나르는지 — 멈추면 화면이 고장 난 것과 구분되지 않는지 — 를 묻는다.
const ESSENTIAL_BUDGET = 6;

const failures = [];

function walk(dir, exts) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name === "node_modules") continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p, exts));
    else if (exts.test(name)) out.push(p);
  }
  return out;
}

// ── 1. 전역 계약이 실제로 있는가 ────────────────────────────────────────────
const css = readFileSync(GLOBAL_CSS, "utf8");
if (!/@media \(prefers-reduced-motion: reduce\)/.test(css)) {
  failures.push(`${GLOBAL_CSS}: 전역 reduced-motion 블록이 없다. 계약의 CSS 절반이 사라졌다.`);
}
if (!/animation-duration:\s*0\.01ms\s*!important/.test(css)) {
  failures.push(`${GLOBAL_CSS}: 담요 규칙에 animation-duration 재정의가 없다.`);
}
if (!/transition-duration:\s*0\.01ms\s*!important/.test(css)) {
  failures.push(`${GLOBAL_CSS}: 담요 규칙에 transition-duration 재정의가 없다.`);
}
// `none` 이 아니라 0.01ms 여야 animationend/transitionend 가 계속 발화한다.
if (/(animation|transition)-duration:\s*none/.test(css)) {
  failures.push(`${GLOBAL_CSS}: duration 을 none 으로 두면 animationend/transitionend 가 발화하지 않아 그 이벤트를 기다리는 코드가 멈춘다. 0.01ms 를 쓴다.`);
}

// ── 2. scroll-behavior: smooth 는 선호가 없을 때만 ──────────────────────────
for (const file of walk("src", /\.(css|astro|tsx|ts)$/)) {
  const src = readFileSync(file, "utf8");
  if (!/scroll-behavior:\s*smooth/.test(src)) continue;
  if (!/prefers-reduced-motion:\s*no-preference/.test(src)) {
    failures.push(`${file}: scroll-behavior: smooth 가 @media (prefers-reduced-motion: no-preference) 밖에 있다. 스스로 스크롤하는 페이지는 감축 요청과 정면으로 충돌한다.`);
  }
}

// ── 3. 담요 규칙을 로컬에 복사하지 않는다 ───────────────────────────────────
for (const file of walk("src", /\.(tsx|astro|css)$/)) {
  // 테스트는 "이 문자열이 없어야 한다"를 주장하려고 문자열을 적는다.
  if (file === GLOBAL_CSS || /\.test\.tsx?$/.test(file)) continue;
  const src = readFileSync(file, "utf8");
  if (/animation-duration:\s*0\.01ms/.test(src)) {
    failures.push(`${file}: 전역 담요 규칙을 로컬에 복사했다. 전역 계약(${GLOBAL_CSS})이 이미 덮으므로 지운다 — 사본은 갱신될 때 갈라진다.`);
  }
}

// ── 4. JS 구동 모션은 CSS 가 못 닿는다 ──────────────────────────────────────
for (const file of walk("src", /\.tsx?$/)) {
  const src = readFileSync(file, "utf8");
  const aware = /reducedMotion|useReducedMotion|prefersReducedMotion/.test(src);

  if (/\buseFrame\s*\(/.test(src) && !aware) {
    failures.push(`${file}: r3f useFrame 은 매 프레임 도는데 감축 선호를 읽지 않는다. CSS 담요는 canvas 안으로 들어가지 못한다.`);
  }
  if (/behavior:\s*["']smooth["']/.test(src) && !aware) {
    failures.push(`${file}: behavior: "smooth" 스크롤이 감축 선호를 읽지 않는다. prefersReducedMotion() 으로 "auto" 와 갈라 준다.`);
  }
}

// ── 5. 감축 선호를 읽는 곳은 공유 훅 하나뿐 ────────────────────────────────
// 이 감사를 만들 때 같은 훅이 **바이트 단위로 똑같이 8벌** 복사돼 있었고, 그중
// 하나(CosmicIntroExperience)는 선호가 바뀌어도 구독하지 않는 축약본이었다.
// 사본은 갈라진다. 읽는 곳을 하나로 두면 갈라질 자리가 없다.
const HOOK = "src/hooks/useMotion.ts";
for (const file of walk("src", /\.tsx?$/)) {
  if (file === HOOK) continue;
  const src = readFileSync(file, "utf8");
  if (/matchMedia\(\s*["'`]\(prefers-reduced-motion/.test(src)) {
    failures.push(`${file}: matchMedia 로 감축 선호를 직접 읽는다. ${HOOK} 의 useReducedMotion() / prefersReducedMotion() 을 쓴다.`);
  }
  if (/function useReducedMotion|const useReducedMotion\s*=/.test(src)) {
    failures.push(`${file}: useReducedMotion 을 지역에 다시 정의했다. ${HOOK} 에서 import 한다.`);
  }
}

// ── 6. framer-motion — 아직 닫히지 않은 구멍 ───────────────────────────────
// framer 는 transform 을 rAF 로 굴리므로 CSS 담요가 닿지 않는다. 그리고
// framer 의 기본값은 사용자 선호를 **무시한다** — MotionConfigContext 의
// 기본 `reducedMotion` 이 "never" 다. 지키게 하려면 각 React 섬 루트를
// `<MotionConfig reducedMotion="user">` 로 감싸야 한다("user" 는 transform 은
// 끄고 opacity 는 남기는데, 이게 정확히 맞는 의미다).
//
// 2026-09-01 실측: framer 사용 31개 중 30개가 선호를 전혀 읽지 않는다.
// 그중 transform 계열(y·scale·rotate·x) 26건이 전정기관 위험에 해당한다.
// 감싸야 할 섬 루트는 25곳이고, 그중 다수는 살아 있는지부터 확인해야 한다.
// 기계적 변환이 아니라 판단이 드는 일이라 별건으로 남긴다.
//
// 그때까지 **자라지는 못하게** 잠근다. 이 숫자가 늘면 실패한다.
const FRAMER_UNGUARDED_BUDGET = 30;
const framerFiles = walk("src", /\.tsx?$/).filter((f) => {
  const src = readFileSync(f, "utf8");
  return /from ["']framer-motion["']/.test(src) && !/[rR]educedMotion|MotionConfig/.test(src);
});
if (framerFiles.length > FRAMER_UNGUARDED_BUDGET) {
  const added = framerFiles.length - FRAMER_UNGUARDED_BUDGET;
  failures.push(
    `framer-motion 을 쓰면서 감축 선호를 읽지 않는 파일이 ${framerFiles.length}개다(기록된 ${FRAMER_UNGUARDED_BUDGET}개보다 ${added}개 늘었다).\n` +
      `    framer 의 기본값은 선호를 무시한다. 새 컴포넌트는 섬 루트를 <MotionConfig reducedMotion="user"> 로 감싼다.\n` +
      `    기존 구멍을 닫았다면 이 숫자를 줄여서 잠근다 — 늘리지 않는다.`,
  );
}

// ── 7. 탈출구는 좁게 유지한다 ───────────────────────────────────────────────
const essential = walk("src", /\.(tsx|astro)$/).filter((f) =>
  /data-motion=["']essential["']/.test(readFileSync(f, "utf8")),
);
if (essential.length > ESSENTIAL_BUDGET) {
  failures.push(
    `data-motion="essential" 이 ${essential.length}개 파일에 있다(한도 ${ESSENTIAL_BUDGET}). 탈출구가 기본값이 되면 계약이 사라진다:\n    ${essential.join("\n    ")}`,
  );
}

if (failures.length) {
  console.error("모션 계약 감사 FAIL\n");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `모션 계약 감사 PASS — 전역 담요 있음, smooth 스크롤 가드됨, 로컬 사본 0건, ` +
    `useFrame·스크롤은 선호 인지, 선호를 읽는 곳은 공유 훅 하나, ` +
    `탈출구 ${essential.length}/${ESSENTIAL_BUDGET}개, framer 미가드 ${framerFiles.length}/${FRAMER_UNGUARDED_BUDGET}개(미해결·잠금).`,
);
