# Tests hub

`/tests/` lets a visitor start from a question ("무엇이 궁금하세요?") instead of a scale name: four lanes (성격·관계·일·지금 마음) list tests, and a search box filters by name or topic.

## Sub-features

- `hub-lanes` in-page navigation `무엇이 궁금하세요?` with links `성격` `관계` `일` `지금 마음` (anchors `#self` `#relationships` `#work` `#mood`).
- `hub-search` searchbox `검사 이름이나 궁금한 주제를 입력하세요.` filters cards as you type.
- `hub-open` a card link opens the test page.
- `hub-more` each lane shows three cards plus a `이 질문의 검사 N개 더 보기` disclosure.

## How to get to it (user POV)

- Header link `검사` on any page.
- Direct URL `/ko/tests/` (each locale has its own).

## Driving it with verify-oiyo

Preconditions:

- Doctor OK.

- **Open.** `node $S drive tests-hub` loads `/ko/tests/`. H1 `무엇이 궁금하세요?` is visible.
- **Lanes.** Navigation `무엇이 궁금하세요?` contains links `성격`, `관계`, `일`, `지금 마음` (exact names).
- **Search.** Fill the searchbox with `빅파이브`. A link whose name starts with `빅파이브 성격 테스트` stays visible.
- **Open card.** Click it. URL ends with `/ko/big5/test/`.
- **Proof.** `01-hub.*`, `02-search-big5.*`, `result.json`.

## Gotchas

- Scope lane assertions to navigation `무엇이 궁금하세요?`; the page H1 has the same name, so an unscoped `getByRole('navigation')` lookup by text is ambiguous.
- Card links' accessible names include the description line (`빅파이브 성격 테스트 5가지 과학적 ...`); match with a prefix regex.
- Fortune/saju/tarot pages are intentionally absent from this hub (2026-09-01 IA change); their absence is not a bug.
