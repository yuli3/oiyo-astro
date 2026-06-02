"use client";

/* eslint-disable no-restricted-syntax */
import { m } from "framer-motion";
import { ShieldAlert, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

import { Locale } from "@/i18n";
import { cn } from "@/lib/system/utils";

import { DIMENSION_METADATA, DimensionResult } from "../types";

interface ResonanceMapProps {
  dimensions: DimensionResult[];
}

export function ResonanceDetails({
  dimensions,
}: {
  dimensions: DimensionResult[];
}) {
  const tOntology = useTranslations("ontology");
  const locale = useLocale() as Locale;

  const resolveParam = (val: any): string => {
    if (typeof val === "string" && val.startsWith("ontology.")) {
      return tOntology(val.replace(/^ontology\./, ""));
    }
    return String(val);
  };

  return (
    <div className="grid gap-3">
      {dimensions.map((d, i) => (
        <m.div
          className={cn(
            "group relative p-5 rounded-2xl border transition-all duration-500 overflow-hidden",
            d.isSimulated
              ? "bg-slate-50 border-green-50 border-dashed"
              : "bg-white border-green-100 hover:border-amber-500/30 hover:bg-green-50 shadow-sm",
          )}
          initial={{ opacity: 0, y: 10 }}
          key={d.id}
          transition={{ delay: i * 0.05 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          {/* Glassmorphism Shine */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <div className="relative z-10">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-black tracking-tighter text-green-800/40 uppercase">
                {DIMENSION_METADATA[d.id]?.category}
              </span>
              <div
                className={cn(
                  "text-base font-black tabular-nums tracking-tighter",
                  d.isSimulated ? "text-green-600/60" : "text-amber-500",
                )}
              >
                {d.isSimulated ? "???" : `${d.score}%`}
              </div>
            </div>

            <h4 className="font-bold text-[#064e3b] text-sm mb-2 flex items-center gap-2">
              {DIMENSION_METADATA[d.id]?.label[locale] ||
                DIMENSION_METADATA[d.id]?.label.en}
              {d.isSimulated && (
                <span className="flex items-center gap-1 text-[8px] font-black bg-green-50/50 text-green-600 px-2 py-0.5 rounded-full border border-green-50">
                  <ShieldAlert className="w-2 h-2" /> VEILED
                </span>
              )}
            </h4>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-2">
              {(d.tags?.[locale] || d.tags?.en || []).map((tag, idx) => (
                <span
                  className="text-[10px] text-green-700 bg-green-100 px-1.5 py-0.5 rounded-md border border-green-200"
                  key={idx}
                >
                  #{tag}
                </span>
              ))}
            </div>

            <p
              className={cn(
                "text-xs leading-relaxed transition-all duration-700",
                d.isSimulated
                  ? "text-green-600 italic select-none blur-[0.5px]"
                  : "text-green-800",
              )}
            >
              {d.insightKey
                ? tOntology(
                    d.insightKey.replace(/^ontology\./, ""),
                    Object.fromEntries(
                      Object.entries(d.details || {}).map(([k, v]) => [
                        k,
                        resolveParam(v),
                      ]),
                    ),
                  )
                : d.insight[locale] || d.insight.en}
            </p>
          </div>
        </m.div>
      ))}
    </div>
  );
}

export function ResonanceMap({ dimensions }: ResonanceMapProps) {
  const locale = useLocale() as Locale;

  const data = dimensions.map((d) => ({
    A: d.score,
    fullMark: 100,
    id: d.id,
    isSimulated: d.isSimulated,
    strength: d.strength,
    subject: DIMENSION_METADATA[d.id]?.label[locale] || d.id,
  }));

  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      {/* Dynamic Mist Background */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40">
        <div className="w-full h-full bg-gradient-to-tr from-green-300/30 via-white to-amber-200/30 rounded-full blur-[100px] animate-pulse" />
      </div>

      <ResponsiveContainer height="100%" width="100%">
        <RadarChart cx="50%" cy="50%" data={data} outerRadius="75%">
          <defs>
            <linearGradient id="resonanceGradient" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#064e3b" />
            </linearGradient>

            {/* Mist Filter for low-strength data */}
            <filter id="mistFilter">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
              <feComponentTransfer>
                <feFuncA slope="0.6" type="linear" />
              </feComponentTransfer>
            </filter>
          </defs>

          <PolarGrid stroke="#dcfce7" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#064e3b", fontSize: 10, fontWeight: "medium" }}
          />
          <PolarRadiusAxis
            angle={30}
            axisLine={false}
            domain={[0, 100]}
            tick={false}
          />

          {/* Main Radar */}
          <Radar
            animationDuration={2000}
            dataKey="A"
            fill="url(#resonanceGradient)"
            fillOpacity={0.6}
            name="Resonance"
            stroke="#059669"
          />

          {/* Mist Overlay Radar - Only shows simulated/low-strength points with blur */}
          <Radar
            dataKey={(d) => (d.isSimulated ? d.A : null)}
            fill="#d1fae5"
            fillOpacity={0.4}
            filter="url(#mistFilter)"
            name="Mist"
            stroke="transparent"
          />

          {/* Resonant Peaks - Pulse effect for high scores */}
          <Radar
            className="animate-pulse"
            dataKey={(d) => (!d.isSimulated && d.A > 85 ? d.A : null)}
            fill="#f59e0b"
            fillOpacity={0.4}
            name="Peaks"
            stroke="#fbbf24"
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Info Overlay for Simulated Data */}
      <div className="absolute inset-x-0 bottom-4 flex justify-center gap-4">
        {dimensions.some((d) => d.isSimulated) && (
          <m.div
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-green-200 backdrop-blur-xl text-[10px] text-green-800 font-bold uppercase tracking-widest shadow-lg shadow-green-900/5"
            initial={{ opacity: 0, scale: 0.9 }}
          >
            <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
            Spiritual Channels Opening
            <div className="w-1 h-1 rounded-full bg-green-500 animate-ping" />
          </m.div>
        )}
      </div>
    </div>
  );
}
