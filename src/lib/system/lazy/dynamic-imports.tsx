/**
 * Dynamic import configurations for code splitting
 *
 * This file centralizes all dynamic imports for better organization
 * and makes it easy to enable/disable lazy loading
 */

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

/**
 * Lazy load Recharts components
 * Heavy charting library - only load on result pages
 */
export const RechartsRadarChartLazy = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.RadarChart })),
  {
    loading: () => (
      <Skeleton
        aria-label="Loading chart"
        className="h-64 w-full bg-green-50"
        role="status"
      />
    ),
    ssr: false,
  },
);

export const RechartsBarChartLazy = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.BarChart })),
  { ssr: false },
);

export const RechartsPieChartLazy = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.PieChart })),
  { ssr: false },
);

/**
 * Lazy load Framer Motion components
 * Animation library - load only when animations are needed
 */
export const MotionDivLazy = dynamic(
  () => import("framer-motion").then((mod) => ({ default: mod.m.div })),
  {
    loading: () => <div />,
    ssr: false,
  },
);

// html2canvas disabled in static build
export const loadHtml2Canvas = async () => {
  throw new Error('Screenshot not available in static build');
};

/**
 * Lazy load confetti for celebration effects
 * Entertainment feature - load on demand
 * Note: Requires canvas-confetti package to be installed
 */
// export const loadConfetti = async () => {
//   const confetti = await import('canvas-confetti');
//   return confetti.default;
// };

/**
 * Example usage in components:
 *
 * // Instead of:
 * import { PersonalizedRecommendations } from '@/components/recommendations/PersonalizedRecommendations';
 *
 * // Use:
 * import { PersonalizedRecommendationsLazy } from '@/lib/system/lazy/dynamic-imports';
 * <PersonalizedRecommendationsLazy userId={userId} locale="ko" />
 *
 * // For programmatic loading:
 * const handleShare = async () => {
 *   const html2canvas = await loadHtml2Canvas();
 *   const canvas = await html2canvas(element);
 *   // ... use canvas
 * };
 */
