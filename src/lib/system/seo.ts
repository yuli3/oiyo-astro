import type { Metadata } from "next";

import { sanitizeJsonLdObject } from "./security/xss-helper";

interface SEOConfig {
  author?: string;
  description: string;
  image?: {
    alt: string;
    height: number;
    url: string;
    width: number;
  };
  keywords?: string;
  locale: string;
  modifiedTime?: string;
  path: string;
  publishedTime?: string;
  title: string;
  type?: "article" | "website";
}

const SUPPORTED_LOCALES = ["en", "ko", "ja", "zh", "fr", "es"] as const;

const ensureLeadingSlash = (value: string) =>
  value.startsWith("/") ? value : `/${value}`;

const stripLocaleFromPath = (normalizedPath: string) => {
  const segments = normalizedPath.split("/").filter(Boolean);

  if (segments.length === 0) {
    return [];
  }

  if (
    SUPPORTED_LOCALES.includes(
      segments[0] as (typeof SUPPORTED_LOCALES)[number],
    )
  ) {
    return segments.slice(1);
  }

  return segments;
};

const buildLocalizedPath = (segments: string[], locale: string) => {
  if (segments.length === 0) {
    return `/${locale}`;
  }

  return `/${locale}/${segments.join("/")}`;
};

export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
) {
  return sanitizeJsonLdObject({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      item: item.url,
      name: item.name,
      position: index + 1,
    })),
  });
}

export function generateFAQJsonLd(
  faqs: Array<{ answer: string; question: string }>,
) {
  return sanitizeJsonLdObject({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
      name: faq.question,
    })),
  });
}

export function generateHowToJsonLd(config: {
  description: string;
  estimatedCost?: string;
  name: string;
  steps: Array<{ name: string; text: string; url?: string }>;
  supply?: string[];
  tool?: string[];
  totalTime?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    description: config.description,
    estimatedCost: config.estimatedCost,
    name: config.name,
    step: config.steps.map((step, index) => ({
      "@type": "HowToStep",
      name: step.name,
      position: index + 1,
      text: step.text,
      url: step.url,
    })),
    supply: config.supply,
    tool: config.tool,
    totalTime: config.totalTime,
  };
}

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    author,
    description,
    image,
    locale,
    modifiedTime,
    path,
    publishedTime,
    title,
    type = "website",
  } = config;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://oiyo.net";
  const normalizedPath = ensureLeadingSlash(path || "/");
  const localeAgnosticSegments = stripLocaleFromPath(normalizedPath);
  const canonicalPath = buildLocalizedPath(localeAgnosticSegments, locale);
  const fullUrl = `${baseUrl}${canonicalPath}`;

  // Build language alternates for all locales
  // Map internal locale codes to valid ISO 639-1 hreflang codes
  const hreflangMap: Record<string, string> = { cn: "zh-CN" };
  const languageAlternates: Record<string, string> = {};

  SUPPORTED_LOCALES.forEach((targetLocale) => {
    const localizedPath = buildLocalizedPath(
      localeAgnosticSegments,
      targetLocale,
    );
    const hreflangCode = hreflangMap[targetLocale] || targetLocale;
    languageAlternates[hreflangCode] = `${baseUrl}${localizedPath}`;
  });

  // Add x-default for international targeting (defaults to English)
  const defaultLocalePath = buildLocalizedPath(localeAgnosticSegments, "en");
  languageAlternates["x-default"] = `${baseUrl}${defaultLocalePath}`;

  const defaultImage = {
    alt: "Oiyo.net - Free Personality Tests and Tools",
    height: 630,
    url: `${baseUrl}/images/og-default.png`,
    width: 1200,
  };

  const ogImage = image || defaultImage;

  return {
    alternates: {
      canonical: fullUrl,
      languages: languageAlternates,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "Oiyo.net",
    },
    authors: author ? [{ name: author }] : undefined,
    creator: "Oiyo.net",
    description,
    formatDetection: {
      telephone: false,
    },
    icons: {
      apple: [
        { url: "/apple-touch-icon.png" },
        { sizes: "152x152", url: "/apple-touch-icon-152x152.png" },
        { sizes: "144x144", url: "/apple-touch-icon-144x144.png" },
        { sizes: "128x128", url: "/apple-touch-icon-128x128.png" },
      ],
      icon: [
        { url: "/favicon.ico" },
        { sizes: "32x32", type: "image/png", url: "/favicon-32x32.png" },
        { sizes: "16x16", type: "image/png", url: "/favicon-16x16.png" },
        { sizes: "192x192", type: "image/png", url: "/favicon-192x192.png" },
      ],
    },
    manifest: "/manifest.json",
    openGraph: {
      description,
      images: [
        {
          alt: ogImage.alt,
          height: ogImage.height,
          url: ogImage.url,
          width: ogImage.width,
        },
      ],
      locale,
      modifiedTime,
      publishedTime,
      siteName: "Oiyo.net",
      title,
      type,
      url: fullUrl,
    },
    publisher: "Oiyo.net",
    robots: {
      follow: true,
      googleBot: {
        follow: true,
        index: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
      index: true,
    },
    title,
    twitter: {
      card: "summary_large_image",
      creator: "@oiyo_net",
      description,
      images: [ogImage.url],
      site: "@oiyo_net",
      title,
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  };
}

export function generateQuizJsonLd(config: {
  author: string;
  dateModified: string;
  datePublished: string;
  description: string;
  interactionStatistic?: {
    interactionType: string;
    userInteractionCount: number;
  };
  name: string;
  url: string;
}) {
  return sanitizeJsonLdObject({
    "@context": "https://schema.org",
    "@type": "Quiz",
    accessibilityAPI: "ARIA",
    accessibilityFeature: ["structuredNavigation", "readingOrder"],
    accessibilityHazard: "none",
    accessMode: ["textual", "visual"],
    accessModeSufficient: ["textual"],
    author: {
      "@type": "Person",
      name: config.author,
    },
    dateModified: config.dateModified,
    datePublished: config.datePublished,
    description: config.description,
    educationalLevel: "beginner",
    interactionStatistic: config.interactionStatistic
      ? {
          "@type": "InteractionCounter",
          interactionType: config.interactionStatistic.interactionType,
          userInteractionCount:
            config.interactionStatistic.userInteractionCount,
        }
      : undefined,
    name: config.name,
    typicalAgeRange: "16-99",
    url: config.url,
  });
}

export function generateViewport(): any {
  return {
    initialScale: 1,
    maximumScale: 5,
    themeColor: "rgb(5, 150, 105)",
    userScalable: true,
    width: "device-width",
  };
}

export function generateWebsiteJsonLd(config: {
  description: string;
  locale: string;
  name: string;
  url: string;
}) {
  return sanitizeJsonLdObject({
    "@context": "https://schema.org",
    "@type": "WebSite",
    description: config.description,
    inLanguage: config.locale,
    name: config.name,
    potentialAction: {
      "@type": "SearchAction",
      "query-input": "required name=search_term_string",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${config.url}/search?q={search_term_string}`,
      },
    },
    publisher: {
      "@type": "Organization",
      logo: {
        "@type": "ImageObject",
        url: `${config.url}/images/logo.png`,
      },
      name: "Oiyo.net",
      url: config.url,
    },
    url: config.url,
  });
}
