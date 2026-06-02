import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Locale } from "@/i18n";
import { FeatureManifest } from "@/types/manifest";

export async function generateFeatureMetadata(
  manifest: FeatureManifest,
  locale: Locale,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "ontology.manifest" });

  const seo = manifest.seo;
  // Resolve Title: SEO Key -> SEO Object -> Name Key -> Name Object -> Fallback
  let title = "OIYO";
  if (seo?.titleKey) title = t(seo.titleKey);
  else if (seo?.title?.[locale]) title = seo.title[locale]!;
  else if (manifest.nameKey) title = t(manifest.nameKey);
  else if (manifest.name?.[locale]) title = manifest.name[locale]!;

  // Resolve Description matches similar logic
  let description = "Discover your destiny";
  if (seo?.descriptionKey) description = t(seo.descriptionKey);
  else if (seo?.description?.[locale]) description = seo.description[locale]!;
  else if (manifest.descriptionKey) description = t(manifest.descriptionKey);
  else if (manifest.description?.[locale])
    description = manifest.description[locale]!;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://oiyo.net";
  const path = manifest.path.startsWith("/")
    ? manifest.path
    : `/${manifest.path}`;

  return {
    alternates: {
      canonical: `${baseUrl}/${locale}${path}`,
      languages: {
        "en-US": `${baseUrl}/en${path}`,
        "es-ES": `${baseUrl}/es${path}`,
        "fr-FR": `${baseUrl}/fr${path}`,
        "ja-JP": `${baseUrl}/ja${path}`,
        "ko-KR": `${baseUrl}/ko${path}`,
        "zh-CN": `${baseUrl}/cn${path}`,
      },
    },
    description,
    openGraph: {
      description,
      images: [
        {
          alt: title,
          height: 630,
          url: `/api/og?id=${manifest.id}&locale=${locale}`,
          width: 1200,
        },
      ],
      locale: locale,
      siteName: "OIYO",
      title,
      type: "website",
      url: `${baseUrl}/${locale}${path}`,
    },
    robots:
      manifest.status !== "production"
        ? {
            follow: false,
            index: false,
          }
        : {
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
      description,
      images: [`/api/og?id=${manifest.id}&locale=${locale}`],
      title,
    },
  };
}
