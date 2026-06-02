export interface PricingFeature {
  free: boolean;
  id: string; // The translation key
  premium: boolean;
}

export const PRICING_FEATURES: PricingFeature[] = [
  {
    free: true,
    id: "features.basicTests",
    premium: true,
  },
  {
    free: true,
    id: "features.saveResults",
    premium: true,
  },
  {
    free: true,
    id: "features.basicSharing",
    premium: true,
  },
  {
    free: false,
    id: "features.deepAnalysis",
    premium: true,
  },
  {
    free: false,
    id: "features.pdfDownload",
    premium: true,
  },
  {
    free: false,
    id: "features.compatibility",
    premium: true,
  },
  {
    free: false,
    id: "features.personalInsights",
    premium: true,
  },
  {
    free: false,
    id: "features.prioritySupport",
    premium: true,
  },
  {
    free: false,
    id: "features.dataExport",
    premium: true,
  },
];
