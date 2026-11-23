# Big Five test

A visitor answers 20 statements on a five-point scale and gets a profile of five traits (개방성·성실성·외향성·친화성·신경성) as percentage bars, a link that reproduces the same result, and a copy of the result saved in their own browser.

## Sub-features

- `big5-answer` one click per question advances the progress bar `n / 20`.
- `big5-result` after question 20 the page shows a summary, top two traits, and five progressbars named `<trait> <n>%`.
- `big5-link` the URL gains `?b=<O>-<C>-<E>-<A>-<N>`; opening that URL shows the same result without answering.
- `big5-saved` the result is appended to `localStorage["oiyo:test-results:v1"]` with `testId: "big5"`.
- `big5-retake` `다시 하기` starts over.

## How to get to it (user POV)

- Header `검사` → `/ko/tests/` → card `빅파이브 성격 테스트` (first lane, 성격).
- Direct URL `/ko/big5/test/` (and `/en/`, `/ja/`, `/zh/`, `/fr/`, `/es/`).
- A shared result link `/ko/big5/test/?b=...`.

## Driving it with verify-oiyo

Preconditions:

- Doctor OK; fresh context (no prior big5 result in `localStorage`).

- **Open.** `node $S drive big5` loads `/ko/big5/test/`. Region `빅파이브 성격 테스트 (OCEAN)` shows progressbar `1 / 20` and a group named after the statement with buttons `전혀 아니다` `아닌 편이다` `보통이다` `그런 편이다` `매우 그렇다`.
- **Answer.** For n = 1..20: wait for progressbar `n / 20`, click `그런 편이다`. No submit button; the last click shows the result.
- **Result.** URL becomes `/ko/big5/test/?b=75-75-75-75-75`; progressbars `개방성 75%`, `성실성 75%`, `외향성 75%`, `친화성 75%`, `신경성 75%` are visible; button `다시 하기` is visible.
- **Saved.** `localStorage["oiyo:test-results:v1"]` contains an entry with `"testId":"big5"`.
- **Shared link.** A new tab on the result URL shows progressbar `개방성 75%` without answering.
- **Proof.** `01-question-1.*`, `02-result.*`, `result.json` in the evidence dir.

## Gotchas

- Answering every item with the same option gives 75 on all five traits (reverse-keyed items balance out); use mixed answers when a test needs distinct traits.
- The quiz region's accessible name disappears on the result screen; scope result assertions to `main`, not the region.
- The result page numbers render as split digits (`7 5 %` in the ARIA text); assert on progressbar names, not paragraph text.
- Other questionnaire tests (`/mbti/test/`, `/enneagram/test/`, ...) reuse the same `Questionnaire` UI but have different item counts and result URLs; copy this recipe, don't assume 20 items.
