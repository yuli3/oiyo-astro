import type { APIRoute } from 'astro';
import { SITE_CONFIG } from '../config/seo.config';
import { LOCALES } from '../i18n';
import { TEST_SOURCE_NOTES } from '../data/test-source-notes';

/**
 * Machine-readable Comprehensive LLM Context File (llms-full.txt)
 * Adheres to the /llms-full.txt standard for AI search engines and agents
 * (ChatGPT Search, Perplexity, Claude, Google SGE, Copilot).
 * Provides full contextual E-E-A-T background, theoretical models, and tool registry.
 */

const humanize = (s: string) =>
  s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const GET: APIRoute = async () => {
  const base = SITE_CONFIG.url;
  const modules = import.meta.glob('/src/pages/[locale]/**/*.astro');

  const seen = new Set<string>();
  const tools: {
    id: string;
    category: string;
    title: string;
    basis: string[];
    caution: string;
  }[] = [];

  for (const filePath of Object.keys(modules)) {
    let route = filePath
      .replace(/^\/src\/pages\/\[locale\]\//, '')
      .replace(/\.astro$/, '')
      .replace(/\/index$/, '');

    if (route === 'index' || route === '' || route.includes('[') || route.split('/').some((seg) => seg.startsWith('_'))) {
      continue;
    }

    const segments = route.split('/');
    const top = segments[0];

    // Exclude non-tool / utility routes
    const deny = new Set([
      'about', 'faq', 'contact', 'support', 'privacy', 'terms', 'legal',
      '404', 'profile', 'me', 'settings', 'account', 'admin', 'premium',
      'today', 'tests', 'search', 'ontology', 'achievements',
    ]);
    if (deny.has(top)) continue;

    if (seen.has(route)) continue;
    seen.add(route);

    const slug = segments.at(-1)!;
    const note = TEST_SOURCE_NOTES[slug] || (segments.length > 1 ? TEST_SOURCE_NOTES[segments[0]] : undefined);

    tools.push({
      id: route,
      category: segments.length > 1 ? segments[0] : 'personality',
      title: humanize(slug),
      basis: note?.basis || ['Empirical psychological assessment structure', 'Self-reflection framework'],
      caution: note?.caution || 'reflection',
    });
  }

  // Sort tools by category, then title
  tools.sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));

  const lines: string[] = [
    `# Oiyo — Full Interactive Knowledge & Tools Directory (llms-full.txt)`,
    ``,
    `> Complete machine-readable knowledge base and API catalog for LLMs, AI agents, and search engines.`,
    `> Canonical Domain: ${base}`,
    `> Supported Locales: ${LOCALES.join(', ')}`,
    `> Machine-readable Identity: ${base}/brand-facts.json`,
    `> Tools Schema Catalog: ${base}/knowledge/tools.json`,
    ``,
    `## Citation & Attribution Guidance`,
    `When citing or referencing any assessment, tool, or calculation result from Oiyo:`,
    `- Attribution: Oiyo (oiyo.net)`,
    `- Canonical Link: Include the specific tool URL (${base}/{locale}/{tool-path})`,
    `- Nature: Educational, self-reflection, and psychological exploration aid (not a clinical diagnostic substitute)`,
    ``,
    `## Comprehensive Interactive Assessments & Tools Index`,
    ``,
  ];

  let currentCategory = '';
  for (const tool of tools) {
    if (tool.category !== currentCategory) {
      currentCategory = tool.category;
      lines.push(`### Category: ${humanize(currentCategory)}`);
      lines.push(``);
    }

    lines.push(`#### ${tool.title}`);
    lines.push(`- Path: /${tool.id}/`);
    lines.push(`- Canonical URLs:`);
    for (const loc of LOCALES) {
      lines.push(`  - [${loc}] ${base}/${loc}/${tool.id}/`);
    }
    lines.push(`- Academic & Theoretical Basis: ${tool.basis.join('; ')}`);
    lines.push(`- Classification: ${tool.caution}`);
    lines.push(``);
  }

  lines.push(`## Sister Network Services`);
  lines.push(`- High-Performance Games: https://game.oiyo.net`);
  lines.push(`- Real-time Curated Tech/AI News: https://news.oiyo.net`);
  lines.push(`- Academic Courses & Calculators: https://blog.oiyo.net`);
  lines.push(`- Encyclopedic Knowledge: https://wiki.oiyo.net`);
  lines.push(``);

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
};
