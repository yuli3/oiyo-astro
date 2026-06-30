// Hybrid bridge map: oiyo test -> REAL blog magazine article (MDX content, not a
// redirect stub). Per-locale `locales` = the locales where the article actually
// exists (verified against blog/src/content/blog/<locale>/<slug>.mdx on
// 2026-06-30). Render a link only for those locales to avoid 404s.
// Articles render at https://blog.oiyo.net/<locale>/<slug>/.
export interface BlogArticleBridge {
  slug: string;
  locales: string[];
}

export const BLOG_ARTICLE_BRIDGES: Record<string, BlogArticleBridge> = {
  "imposter-syndrome-test": { slug: "imposter-syndrome-doubt", locales: ["en", "es", "fr", "ja", "ko", "zh"] },
  "career-values-test": { slug: "psychology-career-values-test", locales: ["en", "es", "fr", "ko", "zh"] },
  "decision-making-test": { slug: "magazine-decision-making-psychology", locales: ["en", "es", "fr", "ko", "zh"] },
  "emotion-regulation-test": { slug: "magazine-emotion-regulation-psychology", locales: ["en", "es", "fr", "ko", "zh"] },
  "mbti-love-test": { slug: "magazine-mbti-love-psychology", locales: ["en", "es", "fr", "ko", "zh"] },
  "spending-habits-test": { slug: "latte-factor-spending-habits", locales: ["en", "es", "fr", "ko", "zh"] },
  "cognitive-bias-test": { slug: "cognitive-bias-complete-guide", locales: ["es", "fr", "ko", "zh"] },
  "critical-thinking-test": { slug: "critical-thinking-logic-guide", locales: ["es", "fr", "ko", "zh"] },
  "emotional-expressiveness-test": { slug: "magazine-emotional-expressiveness-psychology", locales: ["es", "fr", "ko", "zh"] },
  "emotional-labor-test": { slug: "magazine-emotional-labor-psychology", locales: ["es", "fr", "ko", "zh"] },
  "locus-of-control-test": { slug: "magazine-locus-of-control-psychology", locales: ["es", "fr", "ko", "zh"] },
  "money-anxiety-test": { slug: "magazine-money-anxiety-psychology", locales: ["es", "fr", "ko", "zh"] },
  "relationship-boredom-test": { slug: "magazine-relationship-boredom-psychology", locales: ["es", "fr", "ko", "zh"] },
  "self-concept-clarity-test": { slug: "magazine-self-concept-clarity-psychology", locales: ["es", "fr", "ko", "zh"] },
  "social-comparison-test": { slug: "magazine-social-comparison-psychology", locales: ["es", "fr", "ko", "zh"] },
  "happiness-meter-test": { slug: "flow-state-happiness-psychology", locales: ["en", "es", "fr", "ja", "ko", "zh"] },
  "hormones-test": { slug: "hormones-and-metabolic-regulators", locales: ["en", "es", "fr", "ja", "ko", "zh"] },
  "disc-personality-test": { slug: "disc-personality-workplace-guide", locales: ["en", "ko"] },
  "introvert-extrovert-test": { slug: "introvert-extrovert-science", locales: ["en", "ko"] },
  "life-values-test": { slug: "life-values-and-happiness", locales: ["en", "ko"] },
  "love-profile-test": { slug: "psychology-love-profile-test", locales: ["en", "ko"] },
  "riasec-career-test": { slug: "magazine-riasec-career-test", locales: ["en", "ko"] },
};
