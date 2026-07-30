"use client";

import { m } from "framer-motion";
import { Orbit } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React from "react";

import type { LocalizedText } from "@/types/manifest";

import type { CelestialCoordinates } from "../../western/calculator";

interface CosmicPrologueProps {
  data: CelestialCoordinates;
}

export function CosmicPrologue({ data }: CosmicPrologueProps) {
  const locale = useLocale();
  const t = useTranslations("origin.scroll.cosmic");
  const getLoc = (obj: any) => obj?.[locale] || obj?.en || "";

  // Visualizing the distance:
  // We can animate a small earth orbiting a sun.
  // The 'distanceFromSun' varies slightly, but visually we might just show the 'Season' position.

  // Calculate orbit position based on season approx for visual
  // Vernon (Spring) -> Right
  // Summer -> Top
  // Autumn -> Left
  // Winter -> Bottom
  // This is a rough estimation for visual flair.
  let rotation = 0;
  if (data.season.includes("Spring")) rotation = 0;
  else if (data.season.includes("Summer")) rotation = 90;
  else if (data.season.includes("Autumn")) rotation = 180;
  else rotation = 270;

  return (
    <div className="relative w-full overflow-hidden rounded-[2.5rem] bg-[#0B0C15] border border-white/5 shadow-2xl">
      {/* Background Starfield */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-green-950/50 via-transparent to-black/80" />

      <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-12">
        {/* Left: Narrative */}
        <div className="flex-1 space-y-8">
          <m.div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-green-300 font-medium tracking-wider uppercase"
            initial={{ opacity: 0, y: 20 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <Orbit className="w-3.5 h-3.5" />
            {t("title")}
          </m.div>

          <m.h2
            className="text-3xl md:text-5xl font-bold text-white leading-tight"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            {getLoc(data.narrative)}
          </m.h2>

          <m.div
            className="grid grid-cols-2 gap-6"
            initial={{ opacity: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1 }}
          >
            <CosmicStat
              label={t("orbitalVelocity")}
              value={`${data.orbitalVelocity} km/s`}
            />
            <CosmicStat
              label={t("galacticVelocity")}
              value={`${data.galacticVelocity} km/s`}
            />
            <CosmicStat label={t("axialTilt")} value={`${data.axialTilt}°`} />
            <CosmicStat
              label={t("distanceFromSun")}
              value={`${(data.distanceFromSun / 1000000).toFixed(1)}M km`}
            />
          </m.div>
        </div>

        {/* Right: Visual Gauge */}
        <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
          {/* Orbit Path */}
          <div className="absolute inset-0 rounded-full border border-white/5 border-dashed animate-[spin_60s_linear_infinite]" />
          <div className="absolute inset-8 rounded-full border border-white/5 animate-[spin_40s_linear_infinite_reverse]" />

          {/* Sun Center */}
          <div className="absolute w-24 h-24 bg-amber-500 rounded-full blur-[40px] opacity-20" />
          <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-600 rounded-full shadow-[0_0_40px_rgba(251,191,36,0.4)] flex items-center justify-center">
            <SunIcon className="w-8 h-8 text-amber-900" />
          </div>

          {/* Earth Orbiting */}
          <m.div
            animate={{ rotate: rotation + 360 }}
            className="absolute w-full h-full"
            initial={{ rotate: rotation }}
            transition={{ duration: 120, ease: "linear", repeat: Infinity }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative group">
                <div className="w-4 h-4 bg-teal-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)]" />
                <div className="absolute inset-[-8px] border border-white/20 rounded-full pointer-events-none" />

                {/* Tooltip on Hover */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-xs text-white px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                  {t("locationTooltip")}
                </div>
              </div>
            </div>
          </m.div>

          {/* Decorative Rings */}
          <div className="absolute inset-0 border border-white/5 rounded-full rotate-45 scale-110" />
          <div className="absolute inset-0 border border-white/5 rounded-full -rotate-45 scale-125" />
        </div>
      </div>
    </div>
  );
}

function CosmicStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-green-600 uppercase tracking-widest">
        {label}
      </span>
      <span className="text-xl font-medium text-green-50">{value}</span>
    </div>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}
