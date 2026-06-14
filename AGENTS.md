# AGENTS.md — oiyo-astro

This is the project harness for `oiyo.net`, the execution layer of the OIYO ecosystem.

Read `/Users/seuncho/coding/AGENTS.md` first, then this file.

## Role

`oiyo-astro` owns:

- tests
- calculators
- result experiences
- sharing
- return loops
- interactive mystic and psychology tools

It must not become a long-form blog or a wiki.

## Source Of Truth

1. `/Users/seuncho/coding/AGENTS.md`
2. `/Users/seuncho/coding/docs/UNIFIED_ROADMAP_2026-06-14.md`
3. `/Users/seuncho/coding/docs/SEO_BARE_PAGES_INVENTORY_2026-06-14.md`
4. `/Users/seuncho/coding/docs/SEO_ENRICH_MYSTIC_CODEX_SPEC.md`
5. `/Users/seuncho/coding/docs/route-ownership.json`
6. `/Users/seuncho/coding/docs/knowledge/topics.json`
7. `docs/oiyo-three-domain-content-architecture.md`

## Working Rules

- Keep execution pages action-first.
- Add visible prose, FAQ, JSON-LD, and related links to tool/test pages.
- Use `RelatedTools` and cross-domain links to connect wiki/blog/oiyo.
- Preserve locale coverage for active locales: `ko`, `en`, `ja`, `zh`, `fr`, `es`.
- Do not reintroduce `cn`.
- Do not touch dormant `/Users/seuncho/coding/oiyo` Next.js unless the user explicitly asks.
- Do not deploy, commit, or push without user approval.

## Verification

Use the narrowest relevant checks first:

```bash
npm run audit:mystic-seo
npm run build
npm run test -- --run
```

For route/topic changes from repo root:

```bash
python3 docs/audit-route-ownership.py
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

