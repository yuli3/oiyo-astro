#!/usr/bin/env node
// verify-oiyo — launch, doctor, drive and clean up a local oiyo.net dev server
// the way a user would. Read ../SKILL.md first; every subcommand is shown there.
//
// Why a self-contained script: the repo has no Playwright dependency and we do
// not add one to package.json just for verification (2026-11-24). playwright-core
// is installed once into a cache dir OUTSIDE the repo, and Chromium comes from
// the shared ms-playwright browser cache, so nothing here touches node_modules.
import { execFileSync, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '../../../..');
const PORT = Number(process.env.OIYO_VERIFY_PORT || 4399);
const BASE = `http://127.0.0.1:${PORT}`;
const PW_VERSION = '1.57.0';
const PW_DIR = process.env.OIYO_VERIFY_PW || join(homedir(), '.cache', 'oiyo-verify-pw');
const STATE_DIR = join(tmpdir(), `oiyo-verify-${PORT}`);
const STATE = join(STATE_DIR, 'state.json');
const EVIDENCE_ROOT = process.env.OIYO_VERIFY_EVIDENCE || join(homedir(), 'coding', '.verify-evidence', 'oiyo');

const log = (...a) => console.log('[verify-oiyo]', ...a);
const die = (msg, code = 1) => { console.error('[verify-oiyo] FAIL:', msg); process.exit(code); };
const readState = () => (existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')) : null);

function listenerPid() {
  const r = spawnSync('lsof', ['-nP', `-iTCP:${PORT}`, '-sTCP:LISTEN', '-t'], { encoding: 'utf8' });
  const pid = r.stdout.trim().split('\n').filter(Boolean)[0];
  return pid ? Number(pid) : null;
}

function pidCwd(pid) {
  const r = spawnSync('lsof', ['-a', '-p', String(pid), '-d', 'cwd', '-Fn'], { encoding: 'utf8' });
  const line = r.stdout.split('\n').find((l) => l.startsWith('n'));
  return line ? line.slice(1) : null;
}

async function httpCheck(path = '/ko/') {
  try {
    const res = await fetch(BASE + path);
    const body = await res.text();
    const title = (body.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
    return { status: res.status, title };
  } catch (e) {
    return { status: 0, title: '', error: e.message };
  }
}

function findChrome() {
  if (process.env.OIYO_VERIFY_CHROME) return process.env.OIYO_VERIFY_CHROME;
  const candidates = [];
  for (const root of [join(homedir(), 'Library', 'Caches', 'ms-playwright'), join(homedir(), '.cache', 'ms-playwright')]) {
    if (!existsSync(root)) continue;
    for (const d of readdirSync(root).filter((n) => /^chromium-\d+$/.test(n)).sort((a, b) => b.split('-')[1] - a.split('-')[1])) {
      candidates.push(
        join(root, d, 'chrome-mac-arm64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'),
        join(root, d, 'chrome-mac', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'),
        join(root, d, 'chrome-linux', 'chrome'),
      );
    }
  }
  candidates.push('/opt/pw-browsers/chromium');
  return candidates.find((c) => existsSync(c)) || null;
}

function loadPlaywright({ install = false } = {}) {
  const pkg = join(PW_DIR, 'node_modules', 'playwright-core', 'package.json');
  if (!existsSync(pkg)) {
    if (!install) die(`playwright-core missing at ${PW_DIR}; run \`verify-oiyo.mjs launch\` once`);
    mkdirSync(PW_DIR, { recursive: true });
    log(`installing playwright-core@${PW_VERSION} into ${PW_DIR} (outside the repo)`);
    execFileSync('npm', ['i', '--no-audit', '--no-fund', '--prefix', PW_DIR, `playwright-core@${PW_VERSION}`], { stdio: 'inherit' });
  }
  return createRequire(join(PW_DIR, 'node_modules') + '/')('playwright-core');
}

async function launch() {
  loadPlaywright({ install: true });
  if (!findChrome()) die('no Chromium found in the ms-playwright cache; set OIYO_VERIFY_CHROME');
  if (!existsSync(join(REPO, 'node_modules', 'astro'))) die(`node_modules missing in ${REPO}; run \`npm ci\` there first`);
  const busy = listenerPid();
  if (busy) {
    const st = readState();
    if (st && st.pid === busy && st.repo === REPO) { log(`already running (pid ${busy}) at ${BASE}`); return; }
    die(`port ${PORT} is held by pid ${busy} (cwd ${pidCwd(busy)}), not by this run. Pick OIYO_VERIFY_PORT=<free port>; do not drive someone else's server.`);
  }
  // Astro 7 `astro dev` detaches into a background server and prints its pid.
  const out = execFileSync('npx', ['astro', 'dev', '--host', '127.0.0.1', '--port', String(PORT)], { cwd: REPO, encoding: 'utf8' });
  process.stdout.write(out);
  // Ready = the Korean home page renders with the OIYO title, not merely "port open".
  // The first request compiles the route on demand and can take ~10s.
  let check = { status: 0 };
  for (let i = 0; i < 90 && !(check.status === 200 && check.title.includes('OIYO')); i++) {
    await new Promise((r) => setTimeout(r, 1000));
    check = await httpCheck('/ko/');
  }
  if (!(check.status === 200 && check.title.includes('OIYO'))) die(`not ready after 90s: ${JSON.stringify(check)}`);
  const pid = listenerPid();
  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(STATE, JSON.stringify({ pid, repo: REPO, port: PORT, startedAt: new Date().toISOString() }, null, 2));
  log(`READY ${BASE} pid=${pid} title="${check.title}"`);
}

async function doctor() {
  const st = readState();
  const pid = listenerPid();
  const rev = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: REPO, encoding: 'utf8' }).trim();
  const check = await httpCheck('/ko/');
  const rows = {
    repo: REPO,
    revision: rev,
    url: BASE,
    listenerPid: pid,
    startedByThisRun: Boolean(st && pid && st.pid === pid && st.repo === REPO),
    listenerCwd: pid ? pidCwd(pid) : null,
    http: check,
    playwrightCore: existsSync(join(PW_DIR, 'node_modules', 'playwright-core')),
    chromium: findChrome(),
  };
  console.log(JSON.stringify(rows, null, 2));
  const ok = rows.startedByThisRun && check.status === 200 && check.title.includes('OIYO') && rows.playwrightCore && rows.chromium;
  if (!ok) die('doctor: instance is not worth driving (see fields above)');
  log('doctor OK');
}

// ---------- journeys ----------
// Each journey: fresh browser context (empty localStorage), user-visible handles
// only (ARIA role + accessible name), evidence = aria snapshot + screenshot per
// step + a JSON transcript of assertions.

async function withBrowser(journey, fn) {
  const st = readState();
  if (!st || listenerPid() !== st.pid) die('no instance started by this run; run launch + doctor first');
  const { chromium } = loadPlaywright();
  const runId = new Date().toISOString().replace(/[:.]/g, '-');
  const dir = join(EVIDENCE_ROOT, `${runId}-${journey}`);
  mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch({ executablePath: findChrome(), headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'ko-KR', deviceScaleFactor: 1 });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push(String(e)));
  const steps = [];
  let n = 0;
  const shot = async (label, locator = page.locator('main').first()) => {
    n += 1;
    const base = join(dir, `${String(n).padStart(2, '0')}-${label}`);
    await page.screenshot({ path: `${base}.png`, fullPage: false });
    writeFileSync(`${base}.aria.txt`, await locator.ariaSnapshot());
  };
  const expect = (name, cond, detail = '') => {
    steps.push({ name, pass: Boolean(cond), detail });
    log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  };
  let error = null;
  try {
    await fn({ page, shot, expect });
  } catch (e) {
    error = String(e && e.stack ? e.stack : e);
    await shot('error').catch(() => {});
  }
  const pass = !error && steps.length > 0 && steps.every((s) => s.pass);
  writeFileSync(join(dir, 'result.json'), JSON.stringify({ journey, url: BASE, revision: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: REPO, encoding: 'utf8' }).trim(), pass, steps, error, pageErrors: consoleErrors }, null, 2));
  await browser.close();
  log(`${pass ? 'JOURNEY PASS' : 'JOURNEY FAIL'} ${journey} → evidence ${dir}`);
  if (!pass) process.exit(2);
}

const journeys = {
  // features/big5-test.md
  async big5({ page, shot, expect }) {
    await page.goto(`${BASE}/ko/big5/test/`, { waitUntil: 'networkidle' });
    const quiz = page.getByRole('region', { name: '빅파이브 성격 테스트 (OCEAN)' });
    await expect('first question visible', await quiz.getByRole('progressbar', { name: '1 / 20' }).isVisible());
    await shot('question-1', quiz);
    for (let i = 1; i <= 20; i++) {
      await quiz.getByRole('progressbar', { name: `${i} / 20` }).waitFor();
      await quiz.getByRole('button', { name: '그런 편이다' }).click();
    }
    await page.waitForURL(/[?&]b=/);
    const url = new URL(page.url());
    expect('result code in URL', url.searchParams.get('b') === '75-75-75-75-75', page.url());
    const main = page.locator('main').first();
    await main.getByRole('progressbar', { name: '개방성 75%' }).waitFor();
    for (const dim of ['개방성', '성실성', '외향성', '친화성', '신경성']) {
      expect(`${dim} bar 75%`, await main.getByRole('progressbar', { name: `${dim} 75%` }).isVisible());
    }
    expect('retake button', await main.getByRole('button', { name: '다시 하기' }).isVisible());
    await shot('result');
    const stored = await page.evaluate(() => localStorage.getItem('oiyo:test-results:v1') || '');
    expect('result saved to this browser (oiyo:test-results:v1)', stored.includes('big5'), stored.slice(0, 160));
    // Second view: a fresh tab opening the shared link must show the same result.
    const fresh = await page.context().browser().newPage();
    await fresh.goto(page.url(), { waitUntil: 'networkidle' });
    expect('shared link reproduces result', await fresh.locator('main').first().getByRole('progressbar', { name: '개방성 75%' }).isVisible());
    await fresh.close();
  },

  // features/tests-hub.md
  async 'tests-hub'({ page, shot, expect }) {
    await page.goto(`${BASE}/ko/tests/`, { waitUntil: 'networkidle' });
    const main = page.locator('main').first();
    expect('hub heading', await main.getByRole('heading', { level: 1, name: '무엇이 궁금하세요?' }).isVisible());
    const lanes = main.getByRole('navigation', { name: '무엇이 궁금하세요?' });
    for (const lane of ['성격', '관계', '일', '지금 마음']) expect(`lane link ${lane}`, await lanes.getByRole('link', { name: lane, exact: true }).isVisible());
    await shot('hub');
    await main.getByRole('searchbox').fill('빅파이브');
    await page.waitForTimeout(400);
    await shot('search-big5');
    const link = main.getByRole('link', { name: /빅파이브 성격 테스트/ }).first();
    expect('search keeps the Big Five card', await link.isVisible());
    await link.click();
    await page.waitForURL('**/ko/big5/test/');
    expect('card opens the test', page.url().endsWith('/ko/big5/test/'), page.url());
  },

  // features/locale-switch.md
  async 'locale-switch'({ page, shot, expect }) {
    await page.goto(`${BASE}/ko/big5/test/`, { waitUntil: 'networkidle' });
    const header = page.locator('header').first();
    await header.locator('#lang-switcher > summary').click();
    await shot('menu-open', header);
    await header.getByRole('link', { name: 'English', exact: true }).click();
    await page.waitForURL('**/en/**');
    expect('same page in English', page.url().endsWith('/en/big5/test/'), page.url());
    expect('html lang=en', (await page.locator('html').getAttribute('lang')) === 'en');
    expect('English H1', await page.getByRole('heading', { level: 1, name: /Big Five/ }).first().isVisible());
    await shot('english');
  },

  // features/saju-calculator.md
  async saju({ page, shot, expect }) {
    await page.goto(`${BASE}/ko/saju/calculator/`, { waitUntil: 'networkidle' });
    const main = page.locator('main').first();
    expect('empty-profile prompt', await main.getByText('생년월일이 아직 없어요').isVisible());
    await main.getByRole('button', { name: '내 정보 입력' }).first().click();
    const dlg = page.getByRole('dialog', { name: '내 정보' });
    await dlg.waitFor();
    await dlg.getByRole('textbox', { name: '생년월일' }).fill('1990-05-15');
    await dlg.getByRole('textbox', { name: /태어난 시각/ }).fill('14:30');
    await dlg.getByRole('button', { name: '여성' }).click();
    await shot('profile-dialog', dlg);
    const save = dlg.getByRole('button', { name: '저장' });
    expect('save enabled after birth date', await save.isEnabled());
    await save.click();
    await dlg.waitFor({ state: 'hidden' });
    // With a birth time set, the calculator refuses to compute until a birth city
    // is chosen (alert "출생 도시도 선택해 주세요") — the city fixes the solar-term boundary.
    const city = main.getByRole('combobox', { name: '출생지' });
    await city.fill('서울');
    const option = page.getByRole('option', { name: /서울|Seoul/ }).first();
    await option.waitFor({ timeout: 15000 });
    expect('city search offers Seoul', await option.isVisible(), await option.innerText());
    await option.click();
    await main.getByRole('button', { name: '사주 보기' }).click();
    await page.waitForTimeout(800);
    await shot('pillars');
    const snap = await main.ariaSnapshot();
    // 1990-05-15 falls after 입춘 1990, so the year pillar is 庚午. The page renders
    // each pillar as separate glyph tokens ("庚 경 午 🐎 말"), not as "경오".
    expect('result status region', await main.getByRole('status').filter({ hasText: '내 오행 한눈에 보기' }).isVisible());
    expect('year pillar 庚午 rendered', /년주\(年柱\)[\s\S]{0,80}庚 경 午/.test(snap));
    expect('day master 경(金) shown', snap.includes('일간: 경(金)'));
  },
};

async function drive(name) {
  const fn = journeys[name];
  if (!fn) die(`unknown journey "${name}". Known: ${Object.keys(journeys).join(', ')}`);
  await withBrowser(name, fn);
}

function cleanup() {
  const st = readState();
  const pid = listenerPid();
  if (st && pid && st.pid === pid && st.repo === REPO) {
    // `astro dev stop` stops this project's background server only.
    spawnSync('npx', ['astro', 'dev', 'stop'], { cwd: REPO, stdio: 'inherit' });
    if (listenerPid() === pid) { process.kill(pid, 'SIGTERM'); log(`sent SIGTERM to our pid ${pid}`); }
  } else if (pid) {
    log(`port ${PORT} held by pid ${pid} that this run did not start — leaving it alone`);
  }
  rmSync(STATE_DIR, { recursive: true, force: true });
  log(`cleanup done; evidence kept under ${EVIDENCE_ROOT}`);
}

const [cmd, arg] = process.argv.slice(2);
const table = { launch, doctor, drive: () => drive(arg), cleanup, journeys: () => console.log(Object.keys(journeys).join('\n')) };
if (!table[cmd]) die('usage: verify-oiyo.mjs launch | doctor | drive <journey> | journeys | cleanup');
await table[cmd]();
