#!/usr/bin/env python3
"""Audit Quiz JSON-LD coverage on high-intent OIYO test pages.

B5 AIEO target: representative test pages should expose a schema.org Quiz
object in addition to their interactive React test UI. This token-based audit
prevents accidental removal without binding to exact generated JSON.
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

TARGETS = {
    "src/pages/[locale]/mbti/test.astro": [
        "buildQuizJsonLd",
        "'@type': 'FAQPage'",
        "const quizJsonLd",
        "<script type=\"application/ld+json\" set:html={JSON.stringify(quizJsonLd)} />",
        "QUESTIONS as MBTI_QUESTIONS",
        "TYPE_PROFILES",
    ],
    "src/pages/[locale]/iq-test.astro": [
        "buildQuizJsonLd",
        "const quizJsonLd",
        "<script type=\"application/ld+json\" set:html={JSON.stringify(quizJsonLd)} />",
        "QUESTIONS as IQ_QUESTIONS",
        "outcomeNames",
    ],
}

HELPER_TARGETS = {
    "src/lib/seo/quiz-json-ld.ts": [
        '"@type": "Quiz"',
        '"@type": "Question"',
        '"@type": "Answer"',
        "numberOfQuestions",
        "suggestedAnswer",
        "assesses",
    ],
}


def main() -> int:
    errors: list[str] = []
    for relative_path, tokens in {**TARGETS, **HELPER_TARGETS}.items():
        path = ROOT / relative_path
        if not path.exists():
            errors.append(f"{relative_path}: missing file")
            continue
        text = path.read_text(encoding="utf-8")
        for token in tokens:
            if token not in text:
                errors.append(f"{relative_path}: missing token {token!r}")

    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        print(f"test quiz schema audit: {len(errors)} errors")
        return 1

    print(f"test quiz schema audit: {len(TARGETS)} pages, 0 errors")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
