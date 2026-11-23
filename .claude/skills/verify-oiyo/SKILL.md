---
name: verify-oiyo
description: "Drive oiyo.net (this Astro site) the way a user does — local dev server, headless Chromium, ARIA handles — and capture evidence. Use to prove a change to a test (questionnaire), the /tests hub, the saju calculator or locale switching actually works in the browser, not just that the build passed."
---

# verify-oiyo

Proves user-facing behavior of oiyo.net on a local dev server. Generated 2026-11-24 with `/create-verification-skill` (adapted from pstack by Lauren Tan, MIT). Keep it honest with `/maintain-verification-skill`.

- **Surface:** static Astro site with React islands, six locales (`/ko/ /en/ /ja/ /zh/ /fr/ /es/`). Primary surface is the browser. There is no server-side user data: results and the birth profile live in the visitor's `localStorage`.
- **Harness:** `scripts/verify-oiyo.mjs` (Node, playwright-core). Not a repo dependency: `launch` installs `playwright-core@1.57.0` once into `~/.cache/oiyo-verify-pw` and uses the Chromium already in the ms-playwright cache.
- **Isolation:** each drive opens a fresh browser context, so `localStorage` starts empty. Two checkouts can run side by side with different `OIYO_VERIFY_PORT` values. The script refuses to drive a port it did not start.

Run every command from the repo root (in OIYO, a worktree under `coding/.worktrees/`, never the shared main checkout). `S=.claude/skills/verify-oiyo/scripts/verify-oiyo.mjs` below.

## Launch

```bash
npm ci                     # once per checkout; the script refuses to start without node_modules/astro
node $S launch             # astro dev on 127.0.0.1:4399 (OIYO_VERIFY_PORT to change)
```

Astro 7 `astro dev` detaches into a background server and prints its pid. Ready means `/ko/` returns 200 with a `<title>` containing `OIYO` (first hit compiles the route on demand, ~5-10 s), and `launch` prints `READY http://127.0.0.1:4399 pid=<n>`. State (pid, repo, port) goes to `$TMPDIR/oiyo-verify-<port>/state.json`. No seed data or migrations are needed.

## Doctor

```bash
node $S doctor
```

Read-only. Prints repo, git revision, listener pid and its cwd, `/ko/` status and title, playwright-core and Chromium paths, then `doctor OK` or exits 1. Requires `startedByThisRun: true`: a server on the port that this run did not launch fails doctor. Run it before the first drive and again after any failed drive.

## Drive

```bash
node $S journeys           # list journeys
node $S drive big5         # features/big5-test.md
node $S drive tests-hub    # features/tests-hub.md
node $S drive locale-switch  # features/locale-switch.md
node $S drive saju         # features/saju-calculator.md
```

Each journey uses ARIA roles and accessible names only (for example `getByRole('region', { name: '빅파이브 성격 테스트 (OCEAN)' })`, `getByRole('progressbar', { name: '3 / 20' })`). The one exception is the language menu `#lang-switcher > summary`, a `<details>` whose summary has no button role. Exit 0 = every assertion passed, 2 = an assertion failed. To add a journey, add a function to `journeys` in the script and a feature file under `features/`, and make both name the same handles.

For an ad hoc look at a page, the in-app browser (or any Playwright session) on `http://127.0.0.1:4399/<locale>/...` works too; the feature files list the handles.

## Evidence

Each drive writes to `~/coding/.verify-evidence/oiyo/<UTC timestamp>-<journey>/` (override with `OIYO_VERIFY_EVIDENCE`), outside the repo so worktree cleanup cannot eat it:

- `NN-<step>.png` and `NN-<step>.aria.txt`: the action and the resulting state, per step.
- `result.json`: journey, URL, full git revision, every assertion with pass/fail and detail, page errors.

Proof standards: drive the real user path (click the answer buttons, type into the dialog), never call internal setters or write `localStorage` directly. Prove side effects with a second view: the big5 journey reads back `oiyo:test-results:v1` and reopens the shared result link in a new tab. Nothing is mocked; the site has no backend in these paths.

## Cleanup

```bash
node $S cleanup
```

Stops only the server this run started (`astro dev stop` in this repo, then SIGTERM to the recorded pid if it still listens), removes the state dir, and leaves evidence in place. A port held by a process this run did not start is reported and left alone. Run cleanup after every failed iteration as well.

Deleting the worktree's `node_modules` (~760 MB) and `~/.cache/oiyo-verify-pw` (~10 MB) is separate and optional; the Mac disk is tight, so do it when the verification batch is over.

## Helpers

- `scripts/verify-oiyo.mjs` — executable (`chmod +x`), subcommands `launch | doctor | drive <journey> | journeys | cleanup`. Env: `OIYO_VERIFY_PORT` (4399), `OIYO_VERIFY_EVIDENCE`, `OIYO_VERIFY_PW` (playwright-core dir), `OIYO_VERIFY_CHROME` (Chromium binary).

## Feature map

Start at [`features/README.md`](features/README.md).
