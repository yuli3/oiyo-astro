"use client";

import React, { useMemo } from "react";

import {
  CosmicAtmosphere,
  CosmicTheme,
} from "@/components/landing/CosmicAtmosphere";

interface CosmicRandomizerProps {
  opacity?: number;
  seed: string; // The "pageId" or context identifier
}

const THEMES: CosmicTheme[] = [
  "MATRIX_RAIN",
  "MATRIX_RAIN",
  "MATRIX_RAIN",
  "MATRIX_RAIN",
  "MATRIX_RAIN",
  "MATRIX_RAIN",
  "MATRIX_RAIN",
  "MATRIX_RAIN",
  "MATRIX_RAIN",
  "MATRIX_RAIN",
];

export function CosmicRandomizer({
  opacity = 0.5,
  seed,
}: CosmicRandomizerProps) {
  const selectedTheme = useMemo(() => {
    const hash = stringToHash(seed);
    const index = hash % THEMES.length;

    // Optional: Filter heavy animations for certain pages?
    // For now, we trust the engine optimization.

    return THEMES[index];
  }, [seed]);

  return <CosmicAtmosphere opacity={opacity} theme={selectedTheme} />;
}

// Simple hash function for consistent random selection per page
function stringToHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}
