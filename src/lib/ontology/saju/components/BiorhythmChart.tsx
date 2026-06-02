/* eslint-disable no-restricted-syntax */
"use client";

import { m } from "framer-motion";
import { useLocale } from "next-intl";
import React, { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { BiorhythmValue } from "@/lib/ontology/saju-core/biorhythm";

interface BiorhythmChartProps {
  data: BiorhythmValue[];
}

export function BiorhythmChart({ data }: BiorhythmChartProps) {
  const [mounted, setMounted] = useState(false);
  const locale = useLocale();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const labels = {
    cn: { emotional: "情感", intellectual: "智力", physical: "身体" },
    en: {
      emotional: "Emotional",
      intellectual: "Intellectual",
      physical: "Physical",
    },
    es: {
      emotional: "Emocional",
      intellectual: "Intelectual",
      physical: "Físico",
    },
    fr: {
      emotional: "Émotionnel",
      intellectual: "Intellectuel",
      physical: "Physique",
    },
    ja: { emotional: "感情", intellectual: "知性", physical: "身体" },
    ko: { emotional: "감정", intellectual: "지성", physical: "신체" },
  };

  const currentLabels = labels[locale as keyof typeof labels] || labels.en;

  return (
    <div className="w-full h-[400px] bg-green-950/40 backdrop-blur-3xl rounded-[3rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
      {/* Dynamic Background Aurora */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-rose-500/20 via-transparent to-teal-500/20 blur-[120px] animate-pulse" />
      </div>

      <div className="relative z-10 w-full h-full min-h-[300px]">
        {mounted && (
          <ResponsiveContainer
            height="100%"
            minHeight={300}
            minWidth={0}
            width="100%"
          >
            <AreaChart
              data={data}
              margin={{ bottom: 0, left: 0, right: 30, top: 20 }}
            >
              <defs>
                <linearGradient id="colorPhysical" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#E63946" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#E63946" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEmotional" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#457B9D" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#457B9D" stopOpacity={0} />
                </linearGradient>
                <linearGradient
                  id="colorIntellectual"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#FFB703" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#FFB703" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="#ffffff10"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis dataKey="date" hide />
              <YAxis domain={[-100, 100]} hide />
              <Tooltip
                contentStyle={{
                  backdropFilter: "blur(10px)",
                  backgroundColor: "rgba(2, 6, 23, 0.8)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "1.5rem",
                  color: "#fff",
                }}
                itemStyle={{
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              />

              <ReferenceLine stroke="#ffffff20" y={0} />

              <Area
                animationDuration={2500}
                dataKey="physical"
                fill="url(#colorPhysical)"
                fillOpacity={1}
                name={currentLabels.physical}
                stroke="#E63946"
                strokeWidth={3}
                type="monotone"
              />
              <Area
                animationDuration={3000}
                dataKey="emotional"
                fill="url(#colorEmotional)"
                fillOpacity={1}
                name={currentLabels.emotional}
                stroke="#457B9D"
                strokeWidth={3}
                type="monotone"
              />
              <Area
                animationDuration={3500}
                dataKey="intellectual"
                fill="url(#colorIntellectual)"
                fillOpacity={1}
                name={currentLabels.intellectual}
                stroke="#FFB703"
                strokeWidth={3}
                type="monotone"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-8 left-8 flex gap-6 z-20">
        {[
          { color: "bg-[#E63946]", label: currentLabels.physical },
          { color: "bg-[#457B9D]", label: currentLabels.emotional },
          { color: "bg-[#FFB703]", label: currentLabels.intellectual },
        ].map((item, idx) => (
          <div className="flex items-center gap-2" key={idx}>
            <div
              className={`w-3 h-3 rounded-full ${item.color} shadow-lg shadow-white/10`}
            />
            <span className="text-[10px] uppercase tracking-widest font-black text-white/60">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
