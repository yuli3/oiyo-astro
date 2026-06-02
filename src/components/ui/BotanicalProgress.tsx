"use client";

import { m } from "framer-motion";
import React from "react";

interface BotanicalProgressProps {
  className?: string;
  current: number;
  themeColor?: string;
  total: number;
}

export function BotanicalProgress({
  className = "",
  current,
  themeColor = "green",
  total,
}: BotanicalProgressProps) {
  const progress = Math.min(Math.max(current / total, 0), 1);

  // Imperial Color Palette for the plant
  const colors: Record<string, string> = {
    amber: "#D97706",
    green: "#059669",
    rose: "#E11D48",
    teal: "#0D9488",
  };

  const activeColor = colors[themeColor] || colors.green;

  // A simple procedural vine/leaf SVG
  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* The Main Stem */}
          <m.path
            animate={{ pathLength: progress }}
            className="stroke-green-900/10"
            d="M 50,90 Q 50,50 50,10"
            fill="none"
            initial={{ pathLength: 0 }}
            strokeLinecap="round"
            strokeWidth="2"
          />
          <m.path
            animate={{ pathLength: progress }}
            d="M 50,90 Q 50,50 50,10"
            fill="none"
            initial={{ pathLength: 0 }}
            stroke={activeColor}
            strokeLinecap="round"
            strokeWidth="2"
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          {/* Left Leaf (Sprouts at 30%) */}
          {progress > 0.3 && (
            <m.path
              animate={{ opacity: 1, scale: 1 }}
              d="M 50,60 Q 30,55 25,45 Q 30,40 50,60"
              fill={activeColor}
              initial={{ opacity: 0, scale: 0 }}
              stroke="none"
              transition={{ duration: 0.5 }}
            />
          )}

          {/* Right Leaf (Sprouts at 60%) */}
          {progress > 0.6 && (
            <m.path
              animate={{ opacity: 1, scale: 1 }}
              d="M 50,40 Q 70,35 75,25 Q 70,20 50,40"
              fill={activeColor}
              initial={{ opacity: 0, scale: 0 }}
              stroke="none"
              transition={{ duration: 0.5 }}
            />
          )}

          {/* Top Bloom (Sprouts at 90%) */}
          {progress > 0.9 && (
            <m.circle
              animate={{ opacity: 1, scale: 1 }}
              cx="50"
              cy="10"
              fill={activeColor}
              initial={{ opacity: 0, scale: 0 }}
              r="4"
              transition={{ duration: 0.5, type: "spring" }}
            />
          )}
        </svg>

        {/* Micro-percentage indicator in the center of growth */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[10px] font-black uppercase tracking-widest text-green-900/30">
            {Math.round(progress * 100)}%
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-green-900/40">
          Seed of Wisdom
        </span>
        <span className="text-xs font-bold text-green-800">
          {current} of {total} Insights
        </span>
      </div>
    </div>
  );
}
