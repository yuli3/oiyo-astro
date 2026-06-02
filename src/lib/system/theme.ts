/**
 * Centralized theme tokens for colors that need to be used as HEX/RGB strings
 * (e.g., for Recharts, Canvas, or Framer Motion 'animate' prop).
 *
 * These should align with Tailwind CSS tokens wherever possible.
 */

/* eslint-disable no-restricted-syntax */
export const THEME_COLORS = {
  accent: "#F97316", // orange-500
  black: "#000000",
  blackAlpha: {
    10: "rgba(0, 0, 0, 0.1)",
    20: "rgba(0, 0, 0, 0.2)",
    50: "rgba(0, 0, 0, 0.5)",
  },
  cyan: "#06b6d4", // cyan-500
  danger: "#EF4444", // red-500
  gold: "#FFD700", // Gold
  indigo: "#4F46E5", // indigo-600
  info: "#3B82F6", // teal-500 (Note: blue-500 actually)
  // Primary / Brand
  primary: "#8B5CF6", // green-500 (Note: violet-500 actually)
  secondary: "#EC4899", // pink-500
  // Neutrals (Standard Slate)
  slate: {
    50: "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#64748B",
    600: "#475569",
    700: "#334155",
    800: "#1E293B",
    900: "#0F172A",
    950: "#020617",
  },

  // Status
  success: "#10B981", // green-500
  teal: "#0d9488", // teal-600
  warning: "#F59E0B", // amber-500
  // Alpha / Transparents
  white: "#ffffff",
  whiteAlpha: {
    10: "rgba(255, 255, 255, 0.1)",
    20: "rgba(255, 255, 255, 0.2)",
    50: "rgba(255, 255, 255, 0.5)",
  },
} as const;
/* eslint-enable no-restricted-syntax */

export type ThemeColor = keyof typeof THEME_COLORS;
