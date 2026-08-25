---
target: oiyo homepage (index.astro + Header.astro)
total_score: 26
max_score: 36
na_heuristics: 10
p0_count: 0
p1_count: 2
timestamp: 2026-08-25T11-11-03Z
slug: src-pages-locale-index-astro
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | "See fortune" gives zero feedback with no birth date saved |
| 2 | Match Between System / Real World | 4 | 문항/분 counts, native test names |
| 3 | User Control and Freedom | 4 | Standard nav/back/locale-switch, nothing forced |
| 4 | Consistency and Standards | 2 | 4 unrelated emoji icon systems; CTA green varies by section |
| 5 | Error Prevention | 2 | "See fortune" clickable and equal-weight next to required action |
| 6 | Recognition Rather Than Recall | 4 | Question count + time on every test |
| 7 | Flexibility and Efficiency | 2 | Returning visitor sees identical generic hero as a stranger |
| 8 | Aesthetic and Minimalist Design | 3 | Card-reduction worked; docked for emoji clutter + gpt-card shadow |
| 9 | Error Recovery | 2 | No recovery path from the dead click |
| 10 | Help and Documentation | n/a | Persuade-mode page |
| **Total** | | **26/36** | **Good (72%)** |

## Design Specificity Verdict
LLM: partially authored for OIYO (born-with/measured/chosen framing, question-count+time labels, ahoxy migration line are specific); undermined by H1 being process-copy and 4 disconnected emoji icon vocabularies.
Deterministic: detect.mjs clean (0 static findings). Live-DOM injection: 11-13 anti-patterns/page across 3 viewports — low-contrast x3 (2.5:1/4.1:1/4.3:1 vs 4.5:1 floor), gpt-thin-border-wide-shadow (map section), nested-cards (1, unlocated), pulsing-dot (hero), undersized-ui-text x2 (10px drawer labels), tiny-text (11px), layout-transition. text-occlusion x2-3 = false positive (off-canvas drawer transform, confirmed via getBoundingClientRect).

## Priority Issues
[P1] Dead "See fortune" button, zero feedback → /impeccable clarify
[P1] 3 measured contrast failures below 4.5:1 → /impeccable audit
[P2] Generic gpt-card shadow on map section → /impeccable polish
[P2] Decorative pulsing dot, no real live status → /impeccable quieter
[P2] 4 unrelated emoji icon vocabularies → /impeccable shape
[P2] MBTI/Attachment duplicated between doors and psych-4 list → /impeccable distill
[P3] Container width zig-zags across 5 max-widths → /impeccable layout
[P3] Undersized drawer labels (10px) → /impeccable typeset
[P3] nested-cards finding unlocated → /impeccable audit

## Persona Red Flags
Jordan: H1 explains the page not the product; hits MBTI link twice in 5s.
Riley: dead "See fortune" click, no diagnosable failure; no signal of dependency between the two CTAs.
Casey: 3-line H1 wrap on mobile en; dead CTA lands in thumb zone, looks more confident than the working one.

## Minor Observations
Language switcher duplicated on mobile; fortune widget's placeholder text breaks olive palette; "내 지도 열기" triplicated across map/more/header nav.
