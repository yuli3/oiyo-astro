/* eslint-disable no-restricted-syntax */
"use client";

import { m } from "framer-motion";
import React, { useEffect, useState } from "react";

interface ResonanceMandalaProps {
  /** ARIA label for screen readers - if not provided, component is treated as decorative */
  ariaLabel?: string;
  className?: string;
  styles?: React.CSSProperties & {
    "--resonance-blur"?: string;
    "--resonance-color"?: string;
    "--resonance-color-secondary"?: string;
    "--resonance-opacity"?: string;
    "--resonance-scale"?: string;
    "--resonance-speed"?: string;
  };
}

const defaultStyles: ResonanceMandalaProps["styles"] = {
  "--resonance-blur": "60px",
  "--resonance-color": "#10b981",
  "--resonance-color-secondary": "#0d9488",
  "--resonance-opacity": "0.15",
  "--resonance-scale": "1",
  "--resonance-speed": "10s",
};

// Hook to detect reduced motion preference
// Hook to detect reduced motion preference using useSyncExternalStore (React 18+)
function useReducedMotion(): boolean {
  return React.useSyncExternalStore(
    (callback) => {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      mediaQuery.addEventListener("change", callback);
      return () => mediaQuery.removeEventListener("change", callback);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false, // Server snapshot
  );
}

export const ResonanceMandala: React.FC<ResonanceMandalaProps> = ({
  ariaLabel,
  className,
  styles: customStyles,
}) => {
  const styles = customStyles || defaultStyles;
  const prefersReducedMotion = useReducedMotion();

  // If no ariaLabel provided, treat as decorative element
  const accessibilityProps = ariaLabel
    ? {
        "aria-label": ariaLabel,
        role: "img" as const,
        title: ariaLabel,
      }
    : { "aria-hidden": true as const };

  return (
    <div
      className={`relative overflow-hidden pointer-events-none ${className}`}
      style={
        {
          aspectRatio: "1 / 1", // CLS: Fixed aspect ratio prevents layout shift
          contain: "paint layout", // Optimization: Isolate rendering scope
          contentVisibility: "auto", // Optimization: Skip rendering if off-screen
          height: "100%",
          minHeight: "200px", // CLS: Minimum height fallback
          width: "100%",
          ...styles,
        } as React.CSSProperties
      }
      {...accessibilityProps}
    >
      {/* Primary Aura Layer */}
      <m.div
        animate={
          prefersReducedMotion
            ? {}
            : {
                opacity: [0.3, 0.5, 0.3],
                scale: [1, 1.1, 1],
                x: [-20, 20, -20],
                y: [-20, 20, -20],
              }
        }
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, var(--resonance-color) 0%, transparent 70%)`,
          bottom: "10%",
          filter: "blur(var(--resonance-blur))",
          left: "10%",
          opacity: "var(--resonance-opacity)",
          right: "10%",
          scale: "var(--resonance-scale)",
          top: "10%",
        }}
        transition={
          prefersReducedMotion
            ? {}
            : {
                duration: parseFloat(styles["--resonance-speed"] || "10s"),
                ease: "easeInOut",
                repeat: Infinity,
              }
        }
      />

      {/* Secondary Pulse Layer */}
      <m.div
        animate={
          prefersReducedMotion
            ? {}
            : {
                rotate: [0, 180, 360],
                scale: [0.8, 1.2, 0.8],
              }
        }
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, var(--resonance-color-secondary) 0%, transparent 60%)`,
          bottom: "20%",
          filter: "blur(calc(var(--resonance-blur) * 1.5))",
          left: "20%",
          opacity: "calc(var(--resonance-opacity) * 0.7)",
          right: "20%",
          scale: "calc(var(--resonance-scale) * 0.8)",
          top: "20%",
        }}
        transition={
          prefersReducedMotion
            ? {}
            : {
                duration:
                  parseFloat(styles["--resonance-speed"] || "10s") * 1.5,
                ease: "linear",
                repeat: Infinity,
              }
        }
      />

      {/* Central Singularity */}
      <m.div
        animate={
          prefersReducedMotion
            ? {}
            : {
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.5, 1],
              }
        }
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full"
        style={{
          background: "white",
          filter: "blur(40px)",
          opacity: 0.2,
        }}
        transition={
          prefersReducedMotion
            ? {}
            : {
                duration: 2,
                ease: "easeInOut",
                repeat: Infinity,
              }
        }
      />

      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          background:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Divine Geometry Overlay (SVG) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        viewBox="0 0 100 100"
      >
        <m.circle
          animate={prefersReducedMotion ? {} : { rotate: 360 }}
          cx="50"
          cy="50"
          fill="none"
          r="45"
          stroke="white"
          strokeDasharray="1 2"
          strokeWidth="0.1"
          transition={
            prefersReducedMotion
              ? {}
              : { duration: 60, ease: "linear", repeat: Infinity }
          }
        />
        <m.path
          animate={prefersReducedMotion ? {} : { rotate: -360 }}
          d="M 50 5 L 95 50 L 50 95 L 5 50 Z"
          fill="none"
          stroke="white"
          strokeWidth="0.05"
          transition={
            prefersReducedMotion
              ? {}
              : { duration: 120, ease: "linear", repeat: Infinity }
          }
        />
      </svg>
    </div>
  );
};

export default ResonanceMandala;
