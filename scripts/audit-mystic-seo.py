#!/usr/bin/env python3
"""Audit SEO enrichment blocks on OIYO mystic execution pages.

This covers the pages listed in docs/SEO_ENRICH_MYSTIC_CODEX_SPEC.md plus the
three gold-standard pages. It is intentionally token-based: the goal is to
catch accidental removal of the FAQPage JSON-LD, localized content object, and
visible SEO sections without making the page implementation brittle.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

TARGETS = [
    "src/pages/[locale]/saju/calculator.astro",
    "src/pages/[locale]/natal/chart.astro",
    "src/pages/[locale]/zodiac/personality.astro",
    "src/pages/[locale]/tarot/reading.astro",
    "src/pages/[locale]/saju/compatibility.astro",
    "src/pages/[locale]/saju/fortune.astro",
    "src/pages/[locale]/zodiac/compatibility.astro",
    "src/pages/[locale]/zodiac/fortune.astro",
    "src/pages/[locale]/palmistry/explore.astro",
    "src/pages/[locale]/chinese-zodiac/index.astro",
    "src/pages/[locale]/chinese-zodiac/compatibility.astro",
    "src/pages/[locale]/blood-type/index.astro",
    "src/pages/[locale]/blood-type/compatibility.astro",
    "src/pages/[locale]/blood-type/fortune.astro",
    "src/pages/[locale]/today.astro",
]

REQUIRED_TOKENS = [
    "const content: Record<Locale",
    "introTitle",
    "conceptTitle",
    "useTitle",
    "faqTitle",
    "readingTitle",
    "const faqJsonLd",
    "'@type': 'FAQPage'",
    '<script type="application/ld+json"',
    "c.concepts.map",
    "c.useCases.map",
    "c.faqs.map",
]

DISCLAIMER_MARKERS = ("disclaimer", "<InterpretationDisclaimer")

REQUIRED_LOCALES = ["ko", "en", "ja", "zh", "fr", "es"]


def main() -> int:
    errors: list[str] = []

    for target in TARGETS:
        path = ROOT / target
        if not path.exists():
            errors.append(f"{target}: missing file")
            continue

        text = path.read_text(encoding="utf-8")
        for token in REQUIRED_TOKENS:
            if token not in text:
                errors.append(f"{target}: missing token {token!r}")
        if not any(marker in text for marker in DISCLAIMER_MARKERS):
            errors.append(
                f"{target}: missing rendered disclaimer "
                f"(expected one of {DISCLAIMER_MARKERS!r})"
            )
        for locale in REQUIRED_LOCALES:
            if not re.search(rf"(^|\n)\s*['\"]?{locale}['\"]?\s*:", text):
                errors.append(f"{target}: missing localized content key {locale}")

        if "target=\"_blank\"" in text and "rel=\"noopener noreferrer\"" not in text:
            errors.append(f"{target}: external links with target=_blank must use rel=\"noopener noreferrer\"")

    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        print(f"mystic seo audit: {len(TARGETS)} pages, {len(errors)} errors")
        return 1

    print(f"mystic seo audit: {len(TARGETS)} pages, 0 errors")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
