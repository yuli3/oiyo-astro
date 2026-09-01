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
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const GLOBAL_CSS = "src/styles/global.css";
// 상태를 전달하는 모션만 담요에서 빠진다. 이 한도를 올리기 전에, 그 모션이
// 정말 정보를 나르는지 — 멈추면 화면이 고장 난 것과 구분되지 않는지 — 를 묻는다.
const ESSENTIAL_BUDGET = 6;

const failures = [];
let framerSummary = "";
let viewTransitionSummary = "";

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

// ── 6. view transition 은 담요 밖에 있다 ──────────────────────────────────
// `::view-transition-old/new/group` 은 문서 루트의 의사 요소라 `*` 담요가
// 잡지 못한다. 감축을 요청한 사람에게 전체 화면 크로스페이드가 그대로 간다.
// UA 애니메이션을 특이도로 이기려 하지 말고 navigation 자체를 끈다.
if (/@view-transition/.test(css)) {
  const reduceBlock = css.slice(css.search(/@media \(prefers-reduced-motion: reduce\)/));
  if (!/@view-transition\s*\{[^}]*navigation:\s*none/.test(reduceBlock)) {
    failures.push(
      `${GLOBAL_CSS}: @view-transition 을 켰는데 감축 선호일 때 끄지 않는다. ` +
        `::view-transition-* 는 담요가 못 잡으므로 @media (prefers-reduced-motion: reduce) 안에 ` +
        `@view-transition { navigation: none; } 를 둔다.`,
    );
  }
}

// ── 7. view-transition-name 은 문서 안에서 유일해야 한다 ──────────────────
// 한 문서에 같은 이름이 둘 있으면 브라우저는 그 전환을 **통째로 건너뛴다**.
// 조용히 아무 일도 일어나지 않으므로 눈으로는 "지원 안 되나 보다"와 구분되지
// 않는다. 그래서 소스가 아니라 **빌드 산출물**에서 센다.
if (existsSync("dist")) {
  const pages = [];
  const collect = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) collect(p);
      else if (name.endsWith(".html")) pages.push(p);
    }
  };
  collect("dist");
  let checked = 0;
  for (const page of pages) {
    const html = readFileSync(page, "utf8");
    const names = [...html.matchAll(/view-transition-name:\s*([a-zA-Z][\w-]*)/g)].map((m) => m[1]);
    if (!names.length) continue;
    checked++;
    const seen = new Map();
    for (const n of names) seen.set(n, (seen.get(n) ?? 0) + 1);
    // `route-*` 는 CSS 규칙 한 줄로 두 선택자에 걸리므로 문서에 한 번만 나온다.
    // 인라인 스타일로 같은 이름이 여러 요소에 붙으면 그때가 충돌이다.
    const dupes = [...seen].filter(([, n]) => n > 1).map(([k]) => k);
    if (dupes.length) {
      failures.push(`${page}: view-transition-name 이 중복이다(${dupes.join(", ")}). 이름이 겹치면 브라우저는 전환 전체를 건너뛴다.`);
    }
  }
  viewTransitionSummary = `이름 있는 페이지 ${checked}곳 중복 0`;
} else {
  viewTransitionSummary = "이름 중복 미검사(dist 없음 — npm run build 후 다시 돌린다)";
}

// ── 8. framer-motion — 하이드레이트되는 섬만이 문제다 ─────────────────────
// framer 는 transform 을 rAF 로 굴려 CSS 담요가 닿지 않고, 기본값
// (`MotionConfigContext` 의 "never")이 사용자 선호를 **무시한다**.
//
// 2026-09-01 첫 시도에서 "framer 를 import 하는 파일 수"를 예산으로 잡았다.
// 그건 노출이 아니었다. 실제로 세어 보니 30개 중 브라우저에서 하이드레이트되는
// 것은 **하나뿐**이었고(빌드 294개 청크 중 framer 런타임을 담은 청크가 하나),
// 나머지 29개는 아무 데서도 import 되지 않는 죽은 코드였다.
//
// 그래서 세는 대상을 바꾼다. import 수가 아니라 **섬 루트에서의 도달성**이다.
// `.astro` 에서 `client:*` 로 하이드레이트되는 컴포넌트가 framer 에 닿으면,
// 그 섬 루트는 <MotionConfig reducedMotion="user"> 로 감싸야 한다.
{
  const files = [...walk("src", /\.(tsx?|astro)$/)];
  const text = new Map(files.map((f) => [f, readFileSync(f, "utf8")]));

  const resolveImport = (from, spec) => {
    let base;
    if (spec.startsWith("@/")) base = join("src", spec.slice(2));
    else if (spec.startsWith(".")) base = relative(process.cwd(), resolve(dirname(from), spec));
    else return null;
    for (const ext of ["", ".tsx", ".ts", ".astro", "/index.tsx", "/index.ts"]) {
      if (text.has(base + ext)) return base + ext;
    }
    return null;
  };

  const deps = new Map();
  for (const [f, s] of text) {
    const set = new Set();
    for (const m of s.matchAll(/from\s+["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g)) {
      const t = resolveImport(f, m[1] || m[2]);
      if (t) set.add(t);
    }
    deps.set(f, set);
  }

  // 섬 루트: .astro 안에서 client:* 지시자와 함께 쓰인 컴포넌트
  const islandRoots = new Set();
  for (const [f, s] of text) {
    if (!f.endsWith(".astro")) continue;
    const local = new Map();
    for (const m of s.matchAll(/import\s+(?:(\w+)|{([^}]+)})\s+from\s+["']([^"']+)["']/g)) {
      const t = resolveImport(f, m[3]);
      if (!t) continue;
      if (m[1]) local.set(m[1], t);
      if (m[2]) for (const part of m[2].split(",")) {
        const name = part.trim().split(/\s+as\s+/).pop().trim();
        if (name) local.set(name, t);
      }
    }
    for (const m of s.matchAll(/<([A-Z][\w.]*)((?:[^>]|\n)*?)\/?>/g)) {
      if (!/client:(load|visible|idle|only|media)/.test(m[2])) continue;
      const t = local.get(m[1].split(".")[0]);
      if (t && /\.tsx?$/.test(t)) islandRoots.add(t);
    }
  }

  const usesFramer = (f) => /from ["']framer-motion["']/.test(text.get(f) ?? "");
  const reachable = (root) => {
    const seen = new Set();
    const stack = [root];
    while (stack.length) {
      const cur = stack.pop();
      if (seen.has(cur)) continue;
      seen.add(cur);
      for (const d of deps.get(cur) ?? []) stack.push(d);
    }
    return seen;
  };

  const live = [];
  for (const root of islandRoots) {
    const seen = reachable(root);
    if (![...seen].some(usesFramer)) continue;
    live.push(root);
    // import 줄에도 `MotionConfig` 라는 글자는 있다. 실제로 **렌더하는지**를 본다.
    if (!/<MotionConfig[^>]*reducedMotion=["']user["']/.test(text.get(root))) {
      failures.push(
        `${root}: 하이드레이트되는 섬이면서 framer-motion 에 닿는데 ` +
          `<MotionConfig reducedMotion="user"> 로 감싸지 않았다. ` +
          `framer 의 기본값(MotionConfigContext 의 "never")은 사용자 선호를 무시한다.`,
      );
    }
  }

  // 어느 섬에서도 닿지 않는 framer 파일은 접근성 문제가 아니라 죽은 코드다.
  // 실패시키지는 않되 세어 둔다 — 늘어나면 정리 대상이 늘었다는 뜻이다.
  const covered = new Set(live.flatMap((r) => [...reachable(r)]));
  const unreachable = files.filter((f) => usesFramer(f) && !covered.has(f));
  const UNREACHABLE_BUDGET = 29;
  if (unreachable.length > UNREACHABLE_BUDGET) {
    failures.push(
      `어느 섬에서도 도달하지 않는 framer 파일이 ${unreachable.length}개다(기록된 ${UNREACHABLE_BUDGET}개보다 늘었다).\n` +
        `    브라우저에서 돌지 않으므로 접근성 문제는 아니지만, 죽은 채로 계약 밖에 있는 코드다. 늘리지 않는다.`,
    );
  }
  framerSummary = `framer 섬 ${live.length}곳 전부 MotionConfig, 미도달 ${unreachable.length}/${UNREACHABLE_BUDGET}개`;
}

// ── 9. 탈출구는 좁게 유지한다 ───────────────────────────────────────────────
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
    `탈출구 ${essential.length}/${ESSENTIAL_BUDGET}개, ${framerSummary}, ${viewTransitionSummary}.`,
);
