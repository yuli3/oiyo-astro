import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// 2026-10-11: guard the registry without mocking Astro's build-time content store.
const source = readFileSync(new URL('./test-cta-targets.ts', import.meta.url), 'utf8');
const declaration = source.split('export const OIYO_TEST_ROUTES = new Set<string>([')[1]?.split(']);')[0];
const routes = [...(declaration || '').matchAll(/'([^']+)'/g)].map(match => match[1]);
const pageRoot = new URL('../pages/[locale]/', import.meta.url);

describe('article CTA route registry', () => {
  it('contains real routes rather than a vacuously empty declaration', () => {
    expect(routes.length).toBeGreaterThan(85);
    expect(new Set(routes).size).toBe(routes.length);
  });
  it('every registered destination has a page in the same worktree', () => {
    const root = fileURLToPath(pageRoot);
    const missing = routes.filter(route => !existsSync(`${root}${route}.astro`) && !existsSync(`${root}${route}/index.astro`));
    expect(missing).toEqual([]);
  });
  it('keeps the previously invisible article-card destinations', () => {
    for (const route of ['workaholic-test', 'self-concept-clarity-test', 'relationship-boredom-test', 'jealousy-type-test', 'locus-of-control-test']) expect(routes).toContain(route);
  });
});
