import type { APIRoute } from "astro";
import { SITE_CONFIG } from "../../config/seo.config";
import { LOCALES } from "../../i18n";

/**
 * Deterministic, complete catalog of oiyo interactive tools/tests.
 * Output: /knowledge/tools.json — a schema.org ItemList of WebApplications.
 *
 * Source of truth = the actual page files under src/pages/[locale]/** (enumerated
 * at build via import.meta.glob), so the list is complete and deterministic.
 * Titles are derived from the route (a localized-title SSOT is a future
 * enhancement once the feature registry is consolidated).
 */

// Non-tool / meta routes excluded from the tools catalog.
const DENY_TOP = new Set([
  "about", "faq", "contact", "support", "privacy", "terms", "legal",
  "404", "index", "profile", "me", "settings", "account", "admin",
  "premium", "today", "tests", "search", "ontology",
]);

const humanize = (s: string) =>
  s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const GET: APIRoute = async () => {
  const base = SITE_CONFIG.url;
  const modules = import.meta.glob("/src/pages/[locale]/**/*.astro");

  const seen = new Set<string>();
  const tools: {
    id: string;
    category: string;
    title: string;
    url: string;
    locales: string[];
  }[] = [];

  for (const filePath of Object.keys(modules)) {
    // strip "/src/pages/[locale]/" prefix and ".astro" suffix
    let route = filePath
      .replace(/^\/src\/pages\/\[locale\]\//, "")
      .replace(/\.astro$/, "");
    // directory index -> directory route
    route = route.replace(/\/index$/, "");
    if (route === "index" || route === "") continue;
    // skip dynamic and private segments (cannot enumerate concretely)
    if (route.includes("[") || route.split("/").some((seg) => seg.startsWith("_"))) continue;

    const segments = route.split("/");
    const top = segments[0];
    if (DENY_TOP.has(top)) continue;
    if (seen.has(route)) continue;
    seen.add(route);

    tools.push({
      id: route,
      category: top,
      title: humanize(segments[segments.length - 1] === "test" ? top : segments[segments.length - 1]),
      url: `${base}/en/${route}`,
      locales: [...LOCALES],
    });
  }

  tools.sort((a, b) => a.id.localeCompare(b.id));

  const body = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE_CONFIG.name} — Tools Catalog`,
    url: `${base}/knowledge/tools.json`,
    description:
      "Complete, deterministic catalog of interactive tools and tests (personality, saju, astrology, tarot, numerology, wellness). Each is available in multiple languages.",
    publisher: { "@type": "Organization", name: "Oiyo Tech" },
    dateModified: new Date().toISOString(),
    count: tools.length,
    itemListElement: tools,
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
