// Hybrid bridge map: oiyo test -> REAL blog magazine article (MDX content, not a
// redirect stub). Per-locale `locales` = the locales where the article actually
// exists (verified against blog/src/content/blog/<locale>/<slug>.mdx on
// 2026-06-30). Render a link only for those locales to avoid 404s.
// Articles render at https://blog.oiyo.net/<locale>/<slug>/.
export interface BlogArticleBridge {
  slug: string;
  locales: string[];
  /**
   * 글이 실제로 사는 사이트. 미지정 = 'blog'.
   * 2026-09-08: 22개 브리지 중 19개가 blog 경로로 301 이었다 — 심리 해설이 oiyo 로
   * 이관됐는데 이 표가 따라가지 않았다. 호스트를 슬러그가 아니라 여기서 정한다.
   */
  site?: 'blog' | 'oiyo';
}

export const BLOG_ARTICLE_BRIDGES: Record<string, BlogArticleBridge> = {
  "imposter-syndrome-test": { slug: "imposter-syndrome-doubt", locales: ["ko", "en", "ja", "zh", "fr", "es"], site: "oiyo" },
  "career-values-test": { slug: "psychology-career-values-test", locales: ["ko", "en", "ja", "zh", "fr", "es"], site: "oiyo" },
  "emotion-regulation-test": { slug: "magazine-emotion-regulation-psychology", locales: ["ko", "en", "ja", "zh", "fr", "es"], site: "oiyo" },
  "mbti-love-test": { slug: "magazine-mbti-love-psychology", locales: ["ko", "en", "ja", "zh", "fr", "es"], site: "oiyo" },
  "spending-habits-test": { slug: "latte-factor-spending-habits", locales: ["en", "es", "fr", "ko", "zh"] },
  "cognitive-bias-test": { slug: "cognitive-bias-complete-guide", locales: ["ko", "zh", "fr", "es"], site: "oiyo" },
  "critical-thinking-test": { slug: "critical-thinking-logic-guide", locales: ["es", "fr", "ko", "zh"] },
  "emotional-expressiveness-test": { slug: "magazine-emotional-expressiveness-psychology", locales: ["ko", "zh", "fr", "es"], site: "oiyo" },
  "emotional-labor-test": { slug: "magazine-emotional-labor-psychology", locales: ["ko", "zh", "fr", "es"], site: "oiyo" },
  "locus-of-control-test": { slug: "magazine-locus-of-control-psychology", locales: ["ko", "zh", "fr", "es"], site: "oiyo" },
  "money-anxiety-test": { slug: "magazine-money-anxiety-psychology", locales: ["ko", "zh", "fr", "es"], site: "oiyo" },
  "relationship-boredom-test": { slug: "magazine-relationship-boredom-psychology", locales: ["ko", "zh", "fr", "es"], site: "oiyo" },
  "self-concept-clarity-test": { slug: "magazine-self-concept-clarity-psychology", locales: ["ko", "zh", "fr", "es"], site: "oiyo" },
  "social-comparison-test": { slug: "magazine-social-comparison-psychology", locales: ["ko", "zh", "fr", "es"], site: "oiyo" },
  "happiness-meter-test": { slug: "flow-state-happiness-psychology", locales: ["ko", "en", "ja", "zh", "fr", "es"], site: "oiyo" },
  "disc-personality-test": { slug: "disc-personality-workplace-guide", locales: ["ko", "en"], site: "oiyo" },
  "introvert-extrovert-test": { slug: "introvert-extrovert-science", locales: ["ko", "en"], site: "oiyo" },
  "life-values-test": { slug: "life-values-and-happiness", locales: ["ko", "en"], site: "oiyo" },
  "riasec-career-test": { slug: "magazine-riasec-career-test", locales: ["en", "ko"] },
};
