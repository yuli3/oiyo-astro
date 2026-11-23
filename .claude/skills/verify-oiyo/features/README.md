# oiyo.net verification map

The maintained source for verifying what a visitor can do on oiyo.net. Read this index before driving, then use the matching feature file as the recipe. Harness: `.claude/skills/verify-oiyo/scripts/verify-oiyo.mjs` (`$S` below).

## Baseline preconditions

- `node $S launch` reported `READY http://127.0.0.1:4399` and `node $S doctor` printed `doctor OK` with `startedByThisRun: true`.
- Every drive runs in a fresh browser context: empty `localStorage`, Korean locale, 1280×900 viewport.
- Never drive a server this run did not start (another session's `astro dev`, the user's own preview).

## Driving conventions

- Prefer ARIA role + accessible name. Korean names are literal; keep them byte-for-byte.
- Start from the Korean route (`/ko/...`) unless the feature is about another locale.
- Wait for a named element (a progressbar, a status region, a URL), not a fixed sleep.
- Do not write `localStorage` or call component internals to reach a state; click through.

## Proof and skip reporting

- Each step leaves a screenshot and an ARIA snapshot; `result.json` lists every assertion.
- A stored result is proven by a second view (read-back or reopening the shared link), not by the result screen alone.
- An unreachable path is reported with the attempted step and the unmet precondition. A skipped entry point is not "verified" through a different path.

## Feature entry contract

Each feature file has an H1, one paragraph of user-visible behavior, then exactly four H2s in order: `Sub-features`, `How to get to it (user POV)`, `Driving it with verify-oiyo`, `Gotchas`. Keep implementation details out; name only user paths, handles, required state, commands and observable proof.

## Features

- [Big Five test](./big5-test.md) — 20-question questionnaire, result bars, shared result link, saved result. Template for every questionnaire-type test (they share the `Questionnaire` UI).
- [Tests hub](./tests-hub.md) — `/tests/` four question lanes and name search.
- [Locale switch](./locale-switch.md) — header language menu keeps the same page across the six locales.
- [Saju calculator](./saju-calculator.md) — birth-profile dialog, birth-city search, four pillars and five-element result.

Not yet mapped (candidates for the next maintain pass): 나의 지도 `/ontology/`, 우리의 지도 `/circle/`, 오늘 운세 `/fortune/today/`, 읽을거리 `/articles/`, tarot.
