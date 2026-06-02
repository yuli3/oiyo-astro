"use client";

import { m } from "framer-motion";
import {
  Droplets,
  Flame,
  Hexagon,
  Mountain,
  Sparkles,
  Star,
  Wind,
} from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { NarrativeBlock, Prophecy } from "@/lib/ontology/chronos/resonance";
import { ResonanceMandalaLazy } from "@/lib/system/lazy/dynamic-imports";
import { cn } from "@/lib/system/utils";

interface GrandOracleDisplayProps {
  prophecy: Prophecy;
}

export function GrandOracleDisplay({ prophecy }: GrandOracleDisplayProps) {
  const t = useTranslations(); // Use global or namespaced? 'oracle' namespace

  // Helper to render narrative blocks
  const renderExegesis = (block: NarrativeBlock) => {
    // block.key is like "oracle.narrative.intro"
    // We assume the translation Function can accept dynamic keys if we cast or use nested keys.
    // However, useTranslations('oracle') expects keys relative to 'oracle'.
    // If block.key is fully qualified "oracle.narrative.intro", we should strip prefix?
    // Let's assume passed keys are fully qualified for now and use t.raw() or just t() if we pass the full path.
    // Actually, useTranslations() usually scopes. Let's scope to root or handle appropriately.
    return t(block.key as any, block.params);
  };

  const archetypeTitle = t(
    `oracle.archetypes.${prophecy.coreIdentity.archetype}.title` as any,
  );
  const archetypeKeywords = t(
    `oracle.archetypes.${prophecy.coreIdentity.archetype}.keywords` as any,
  );

  const [streamIndex, setStreamIndex] = useState(0);

  // Simple streaming effect trigger
  useEffect(() => {
    const timer = setInterval(() => {
      setStreamIndex((prev) => prev + 1);
    }, 1500); // Reveal sections every 1.5s
    return () => clearInterval(timer);
  }, []);

  const elementColors: Record<string, string> = {
    Air: "rgb(16, 185, 129)",
    Earth: "rgb(217, 119, 6)",
    Fire: "rgb(239, 68, 68)",
    Metal: "rgb(148, 163, 184)",
    Water: "rgb(59, 130, 246)",
    Wood: "rgb(34, 197, 94)",
  };

  const primaryColor =
    elementColors[prophecy.elementalBalance.dominant] || "rgb(16, 185, 129)";

  return (
    <div className="min-h-screen bg-[#f4f9f4] text-[#064e3b] font-serif overflow-hidden relative selection:bg-green-200">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <ResonanceMandalaLazy
          ariaLabel="Archetype Aura"
          styles={{
            "--resonance-color": primaryColor,
            "--resonance-scale": "1.8",
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-24 relative z-10 flex flex-col items-center text-center space-y-16">
        {/* Header Badge */}
        <m.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8 }}
        >
          <Badge className="bg-green-900/5 text-green-900 border-green-200 text-sm tracking-[0.2em] font-sans uppercase px-4 py-1">
            The Grand Archive
          </Badge>
        </m.div>

        {/* Archetype Title (Massive) */}
        <m.div
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
          initial={{ opacity: 0, scale: 0.9 }}
          transition={{ delay: 0.2, duration: 1 }}
        >
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-green-950 leading-[0.85] mix-blend-multiply">
            {archetypeTitle}
          </h1>
          <p className="mt-6 text-xl text-green-700 font-sans font-medium tracking-widest uppercase opacity-70">
            {archetypeKeywords}
          </p>
        </m.div>

        {/* Narrative Flow */}
        <div className="max-w-2xl w-full space-y-12 text-lg md:text-2xl leading-relaxed">
          {/* INTRO */}
          <m.div
            animate={streamIndex >= 1 ? { opacity: 1, y: 0 } : {}}
            className={cn(
              "transition-all duration-1000",
              streamIndex < 1 && "blur-sm opacity-0",
            )}
            initial={{ opacity: 0, y: 20 }}
          >
            <p>{renderExegesis(prophecy.narrative.intro)}</p>
          </m.div>

          {/* ELEMENTAL MANDALA / VISUAL BREAK */}
          <m.div
            animate={streamIndex >= 2 ? { opacity: 1, scale: 1 } : {}}
            className="flex justify-center py-8"
            initial={{ opacity: 0, scale: 0 }}
          >
            <div
              className="relative w-32 h-32 rounded-full border-4 border-double"
              style={{ borderColor: primaryColor }}
            >
              <div
                className="absolute inset-0 flex items-center justify-center text-3xl font-bold"
                style={{ color: primaryColor }}
              >
                {prophecy.elementalBalance.dominant.charAt(0)}
              </div>
              {/* Rotating ring */}
              <div
                className="absolute inset-0 border-t-4 rounded-full animate-spin duration-[10s]"
                style={{
                  borderBottomColor: "transparent",
                  borderColor: primaryColor,
                  borderLeftColor: "transparent",
                  borderRightColor: "transparent",
                }}
              />
            </div>
          </m.div>

          {/* BODY */}
          <m.div
            animate={streamIndex >= 3 ? { opacity: 1, y: 0 } : {}}
            className={cn(
              "transition-all duration-1000",
              streamIndex < 3 && "blur-sm opacity-0",
            )}
            initial={{ opacity: 0, y: 20 }}
          >
            <p>{renderExegesis(prophecy.narrative.body)}</p>
            <p className="mt-4 text-green-600/80 text-base">
              {renderExegesis(prophecy.crossRef.synergy)}
            </p>
          </m.div>

          {/* CONCLUSION */}
          <m.div
            animate={streamIndex >= 4 ? { opacity: 1, y: 0 } : {}}
            className={cn(
              "p-8 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/60 shadow-xl transition-all duration-1000",
              streamIndex < 4 && "blur-sm opacity-0",
            )}
            initial={{ opacity: 0, y: 20 }}
          >
            <p className="font-medium text-green-900">
              {renderExegesis(prophecy.narrative.conclusion)}
            </p>
            <div className="mt-6 flex justify-center gap-2 text-green-400/50">
              <Star className="w-4 h-4" />
              <Star className="w-4 h-4" />
              <Star className="w-4 h-4" />
            </div>
          </m.div>

          {/* Suggestion / Balance */}
          {streamIndex >= 5 && (
            <m.div
              animate={{ opacity: 1 }}
              className="text-sm text-green-800 font-sans uppercase tracking-widest pt-12"
              initial={{ opacity: 0 }}
            >
              Oracle&apos;s Note:{" "}
              {renderExegesis(prophecy.elementalBalance.suggestion)}
            </m.div>
          )}
        </div>
      </div>
    </div>
  );
}
