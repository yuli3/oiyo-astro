# Locale switch

The header language menu moves the visitor to the same page in another of the six locales (ko, en, ja, zh, fr, es), with the page language and headings switched.

## Sub-features

- `locale-menu` the header shows the current language; opening it lists six languages.
- `locale-same-page` choosing a language keeps the path (`/ko/big5/test/` → `/en/big5/test/`).
- `locale-html-lang` `<html lang>` matches the chosen locale.

## How to get to it (user POV)

- Header, right side: flag + current language name (e.g. `🇰🇷 한국어 ⌄`); on narrow screens only the flag shows.

## Driving it with verify-oiyo

Preconditions:

- Doctor OK.

- **Open menu.** `node $S drive locale-switch` loads `/ko/big5/test/` and clicks `header #lang-switcher > summary` (summary labelled `한국어`).
- **Pick English.** Click link `English` (exact) inside the header.
- **Same page.** URL ends with `/en/big5/test/`; `<html lang="en">`; an H1 matching `Big Five` is visible.
- **Proof.** `01-menu-open.*`, `02-english.*`, `result.json`.

## Gotchas

- The menu is a `<details>`/`<summary>`, not a button; `getByRole('button')` does not find it. It is the one CSS-selector handle in this map.
- Each language link carries `data-locale` and a page-specific `href` (`/en/big5/test/` on the Big Five page, `/en/` on the home page). Assert on the URL after the click.
