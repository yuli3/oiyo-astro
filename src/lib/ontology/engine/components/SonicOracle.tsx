/* eslint-disable no-restricted-syntax */
"use client";

import { m } from "framer-motion";
import { AudioWaveform, Equal, Waves } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React from "react";

import type { NameAnalysisResult } from "@/lib/ontology/onomancy/analysis";

interface SonicOracleProps {
  missingElements: string[];
  onomancy: NameAnalysisResult;
}

export function SonicOracle({ missingElements, onomancy }: SonicOracleProps) {
  const locale = useLocale();
  const t = useTranslations("origin.onomancy");
  const getLoc = (obj: any) => obj?.[locale] || obj?.en || "";

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-[#0c0f16] border border-white/5 p-8 md:p-12">
      {/* Animated Wave Background */}
      <div className="absolute inset-x-0 bottom-0 h-48 opacity-20 pointer-events-none">
        <WaveformAnimation color="#A69345" speed={1} />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs text-green-300 font-medium tracking-wider uppercase">
            <AudioWaveform className="w-3.5 h-3.5" />
            {t("title")}
          </div>

          <h2 className="text-3xl font-bold text-white leading-tight">
            {getLoc(onomancy.narrative)}
          </h2>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4 text-sm text-green-600/60">
              <span className="w-24">{t("missingForce")}</span>
              <div className="flex gap-2">
                {missingElements.length > 0 ? (
                  missingElements.map((e) => (
                    <span
                      className="px-2 py-0.5 rounded bg-white/5 text-green-800/50 capitalize"
                      key={e}
                    >
                      {e}
                    </span>
                  ))
                ) : (
                  <span className="text-green-600">{t("none")}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-green-600/60">
              <span className="w-24">{t("vibrationFill")}</span>
              <div className="w-full max-w-[200px] h-2 bg-white/10 rounded-full overflow-hidden">
                <m.div
                  className="h-full bg-gradient-to-r from-green-600 to-green-500"
                  initial={{ width: 0 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  whileInView={{ width: `${onomancy.balanceScore}%` }}
                />
              </div>
              <span className="text-green-400 font-medium">
                {onomancy.balanceScore}%
              </span>
            </div>
          </div>
        </div>

        <div className="w-full md:w-auto flex justify-center">
          <VisualizerCircle score={onomancy.balanceScore} t={t} />
        </div>
      </div>
    </div>
  );
}

function VisualizerCircle({ score, t }: { score: number; t: any }) {
  // A visual representation of sound focusing
  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      <m.div
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
        className="absolute inset-0 rounded-full border border-green-500/30"
        transition={{ duration: 3, repeat: Infinity }}
      />
      <m.div
        animate={{ opacity: [0.2, 0.5, 0.2], scale: [1.1, 1, 1.1] }}
        className="absolute inset-4 rounded-full border border-green-500/20"
        transition={{ delay: 0.5, duration: 4, repeat: Infinity }}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <Waves className="w-16 h-16 text-green-400 animate-pulse" />
      </div>

      {/* Circular Text */}
      <svg
        className="absolute inset-0 w-full h-full animate-[spin_60s_linear_infinite]"
        viewBox="0 0 100 100"
      >
        <path
          d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
          fill="transparent"
          id="circlePath"
        />
        <text className="text-[6px] fill-white/20 uppercase tracking-[2px] font-bold">
          <textPath href="#circlePath" startOffset="0%">
            {t("circularText")}{" "}
          </textPath>
        </text>
      </svg>
    </div>
  );
}

function WaveformAnimation({ color, speed }: { color: string; speed: number }) {
  return (
    <svg
      className="w-full h-full"
      preserveAspectRatio="none"
      viewBox="0 0 1200 120"
    >
      <m.path
        animate={{
          d: [
            "M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z",
            "M321.39,29.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,99,985.66,119.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,29.44Z",
            "M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z",
          ],
        }}
        d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
        fill={color}
        initial={{
          d: "M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z",
        }}
        transition={{
          duration: 10 / speed,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />
    </svg>
  );
}
