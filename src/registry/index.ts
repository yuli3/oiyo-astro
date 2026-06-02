import { dailyManifest } from "@/app/[locale]/daily/manifest";
import { ontologyManifest } from "@/app/[locale]/ontology/manifest";
import { FeatureManifest } from "@/types/manifest";

export const FEATURE_REGISTRY: FeatureManifest[] = [
  ontologyManifest,
  dailyManifest,
];

// Helper to get features easily
export const getFeaturesByDomain = (domain: string) =>
  FEATURE_REGISTRY.filter((f) => f.domain === domain);
export const getFeatureById = (id: string) =>
  FEATURE_REGISTRY.find((f) => f.id === id);

// Backwards compatibility for now, but deprecated. Use FEATURE_REGISTRY.
export const features: Record<string, FeatureManifest> =
  FEATURE_REGISTRY.reduce(
    (acc, f) => {
      acc[f.id] = f;
      return acc;
    },
    {} as Record<string, FeatureManifest>,
  );
