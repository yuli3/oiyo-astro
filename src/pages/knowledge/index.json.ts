import type { APIRoute } from "astro";
import { SITE_CONFIG } from "../../config/seo.config";
import { LOCALES } from "../../i18n";

/**
 * Discovery manifest for OIYO interactive routes + the Oiyo knowledge network.
 * Output: /knowledge/index.json
 *
 * oiyo's interactive tools/tests are statically generated pages (not a content
 * collection), so the canonical, deterministic URL index is the sitemap. A
 * richer localized tools catalog (tools.json) is a planned follow-up once the
 * feature registry is consolidated into a single deterministic source.
 */
export const GET: APIRoute = async () => {
  const base = SITE_CONFIG.url;
  const body = {
    name: `${SITE_CONFIG.name} — Interactive Tools`,
    role: "interactive-tools",
    description:
      "Interactive tools and tests for personality, saju, astrology, tarot, numerology, and wellness.",
    publisher: { name: "Oiyo Tech", url: base },
    locales: LOCALES,
    resources: {
      tools: {
        url: `${base}/knowledge/tools.json`,
        description:
          "ItemList of interactive tools/tests with category, locales and stable URL (route-derived titles; localized titles planned).",
      },
      sitemap: {
        url: `${base}/sitemap-index.xml`,
        description: "Full deterministic URL index across all languages.",
      },
    },
    network: {
      description: "Part of the Oiyo network. Canonical route owners are selected per user intent rather than by content format.",
      conceptGraph: {
        url: "https://wiki.oiyo.net/knowledge/relations.json",
        description: "Canonical cross-site concept graph (hub ownership, relations, cross-locale links).",
      },
      sites: [
        { role: "reference-and-knowledge", name: "Oiyo Wiki", url: "https://wiki.oiyo.net", knowledge: "https://wiki.oiyo.net/knowledge/index.json" },
        { role: "publishing-and-utility", name: "Oiyo Blog", url: "https://blog.oiyo.net", knowledge: "https://blog.oiyo.net/knowledge/index.json" },
        { role: "interactive-tools", name: "Oiyo", url: "https://oiyo.net", knowledge: "https://oiyo.net/knowledge/index.json" },
      ],
    },
    citation: "Cite individual tools by their stable URL. Attribution: Oiyo (oiyo.net).",
    dateModified: new Date().toISOString(),
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
