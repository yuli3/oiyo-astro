# AGENTS.md — oiyo

This is the project harness for `oiyo.net`, the execution layer of the OIYO ecosystem.

Read `/Users/seuncho/coding/AGENTS.md` first, then this file.

## Role

`oiyo` owns:

- tests
- calculators
- result experiences
- sharing
- return loops
- interactive mystic and psychology tools

It must not become a long-form blog or a wiki.

## Source Of Truth

1. `/Users/seuncho/coding/AGENTS.md`
2. `/Users/seuncho/coding/company-brain/goals.json` and `NOW.md` (roadmap direction — supersedes the retired `docs/UNIFIED_ROADMAP_2026-06-14.md`, archived at `company-brain/AI-Sessions/raw/project-docs/root/docs/UNIFIED_ROADMAP_2026-06-14.md`)
3. `/Users/seuncho/coding/company-brain/projects/oiyo-ecosystem/low-quality-content-full-audit-2026-08-26.md` (current bare-page status — supersedes the retired `docs/SEO_BARE_PAGES_INVENTORY_2026-06-14.md`, archived at `company-brain/AI-Sessions/raw/project-docs/root/docs/SEO_BARE_PAGES_INVENTORY_2026-06-14.md`)
4. `/Users/seuncho/coding/company-brain/projects/oiyo-ecosystem/contracts/route-ownership.json`
5. `/Users/seuncho/coding/company-brain/projects/oiyo-ecosystem/contracts/knowledge/topics.json`
6. `/Users/seuncho/coding/company-brain/AI-Sessions/raw/project-docs/oiyo/docs/oiyo-three-domain-content-architecture.md`

## Working Rules

- Keep execution pages action-first.
- Add visible prose, FAQ, JSON-LD, and related links to tool/test pages.
- Use `RelatedTools` and cross-domain links to connect wiki/blog/oiyo.
- Preserve locale coverage for active locales: `ko`, `en`, `ja`, `zh`, `fr`, `es`.
- Do not reintroduce `cn`.
- Do not touch dormant `/Users/seuncho/coding/oiyo-legacy` Next.js unless the user explicitly asks.
- Do not deploy, commit, or push without user approval.
- **Questionnaire work**: before creating, migrating, reviewing, or releasing any test question UI, read `/Users/seuncho/coding/company-brain/AI-Sessions/wiki/design/questionnaire-family-contract.md`. Classify the interaction as step, matrix, screening, or dedicated tool; run `npm run audit:questionnaire`; release only one approved engine cohort at a time.

## Verification

Use the narrowest relevant checks first:

```bash
npm run audit:questionnaire
npm run audit:mystic-seo
npm run build
npm run audit:content-depth-baseline
npm run test -- --run
```

`audit:content-depth-baseline` (run after build) fails if either count exceeds `config/content-depth-baseline.json`'s ceiling: (1) bare pages — no `<h2>`, <300 char body, no FAQ JSON-LD; (2) Korean-leak pages — a non-ko route whose rendered text is mostly Hangul (a locale-blind component ignoring the locale prop). Neither check fails on the existing baseline count — this exists to catch regrowth, not to force an immediate bulk fix (2026-06-21 reproduced the 06-14 bare-page inventory within a week because nothing checked for it). Lower a ceiling when a batch reduces that count; never raise one just to make a new violation pass.

For route/topic changes, from `/Users/seuncho/coding`:

```bash
python3 company-brain/scripts/oiyo-ecosystem/audit-route-ownership.py
```

## Definition Of Done

A page is not done until it has:

- clear title and meta description
- visible explanatory prose
- FAQ when search intent benefits
- JSON-LD matching visible content
- related oiyo tools
- related blog/wiki links when available
- disclaimer for YMYL or symbolic interpretation
- no broken locale/canonical assumptions
