# Saju calculator

`/saju/calculator/` turns a birth date, time and city into four pillars (연·월·일·시주), a day master and a five-element distribution. The birth data is entered once in a `내 정보` dialog and saved to the visitor's browser (shared with 나의 지도).

## Sub-features

- `saju-empty` without a profile the page shows `생년월일이 아직 없어요` and `내 정보 입력` buttons.
- `saju-profile` dialog `내 정보` takes 생년월일, 태어난 시각, 이름, 출생지, 성별, 혈액형; `저장` is disabled until a birth date is set.
- `saju-city` combobox `출생지` searches ~34,000 cities; choosing one shows coordinates and time zone.
- `saju-result` `사주 보기` shows a status region `내 오행 한눈에 보기`, the four pillars and element counts.

## How to get to it (user POV)

- `/ko/saju/calculator/` directly, or from saju articles and `사주 오늘·이번주 운세` related links.
- `나의 지도에서 입력` link → `/ko/ontology/` fills the same profile.

## Driving it with verify-oiyo

Preconditions:

- Doctor OK; fresh context (no saved profile).

- **Empty state.** `node $S drive saju` loads `/ko/saju/calculator/`; text `생년월일이 아직 없어요` is visible.
- **Profile.** Click the first `내 정보 입력`. In dialog `내 정보`: fill textbox `생년월일` with `1990-05-15`, textbox `태어난 시각 · 모르면 비워두세요` with `14:30`, click `여성`. Button `저장` is enabled; click it; the dialog closes.
- **City.** Fill combobox `출생지` with `서울`; click the first option matching `서울`/`Seoul`. Coordinates `37.57°, 126.98°` and `Asia/Seoul` appear.
- **Result.** Click `사주 보기`. Status region contains `내 오행 한눈에 보기`; the 년주(年柱) block reads `庚 경 午`; text `일간: 경(金)` is present.
- **Proof.** `01-profile-dialog.*`, `02-pillars.*`, `result.json`.

## Gotchas

- With a birth time and no city, `사주 보기` does nothing visible except an alert `태어난 시각이 있다면 정확한 절기 계산을 위해 출생 도시도 선택해 주세요.` Pick a city before asserting a result.
- Pillars render as separate glyph tokens (`庚 경 午 🐎 말`), not `경오`; assert on the token sequence.
- Since 2026-09 the year and month pillars follow solar terms (입춘/절기). Dates near early February or a 절 boundary can flip pillars; choose mid-month dates for stable assertions.
- Saving the profile triggers a toast `출생 정보를 나의 지도에 저장했어요` that can cover the bottom of screenshots.
