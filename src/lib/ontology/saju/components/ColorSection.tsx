/* eslint-disable no-restricted-syntax */
"use client";

import { m } from "framer-motion";
import { Palette, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ColorPersonalityResult } from "@/lib/ontology/color-personality/types";
import { cn } from "@/lib/system/utils";

interface ColorSectionProps {
  className?: string;
  result: ColorPersonalityResult;
}

export function ColorSection({ className, result }: ColorSectionProps) {
  const t = useTranslations("colorPersonality");
  const pColor = result.primaryColor;
  const baseKey = `results.${pColor}`;

  const colorMap: Record<string, string> = {
    black: "#000000",
    blue: "#3B82F6",
    brown: "#92400E",
    gray: "#94A3B8",
    green: "#10B981",
    red: "#EF4444",
    violet: "#8B5CF6",
    yellow: "#F59E0B",
  };

  return (
    <div
      className={cn(
        "w-full max-w-5xl mx-auto space-y-12 py-20 px-6",
        className,
      )}
    >
      <m.div
        className="text-center space-y-6"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
      >
        <Badge className="bg-white/10 text-[#064e3b] border-[#064e3b]/10 px-6 py-2 rounded-full text-[10px] font-black tracking-widest uppercase">
          {t("badge") || "Chromatic Profile"}
        </Badge>
        <h2 className="text-5xl md:text-8xl font-black italic tracking-tighter text-[#064e3b] uppercase">
          {t(`${baseKey}.title`)}
        </h2>
        <div className="flex justify-center gap-4">
          <div
            className="w-12 h-4 rounded-full"
            style={{ background: colorMap[result.primaryColor] }}
          />
          <div
            className="w-12 h-4 rounded-full"
            style={{ background: colorMap[result.secondaryColor] }}
          />
        </div>
      </m.div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="bg-white/60 border-white/60 p-10 rounded-[3rem] backdrop-blur-3xl space-y-8 shadow-xl">
          <h3 className="text-xl font-black flex items-center gap-2 text-[#064e3b]">
            <Sparkles className="w-5 h-5 text-amber-500" />
            {t("traits")}
          </h3>
          <ul className="space-y-6">
            <li className="text-xl text-green-900/70 leading-relaxed font-medium flex items-start gap-4">
              <span className="mt-2 w-2 h-2 rounded-full bg-green-500 shrink-0" />
              <span>{t(`${baseKey}.traits.0`)}</span>
            </li>
            <li className="text-xl text-green-900/70 leading-relaxed font-medium flex items-start gap-4">
              <span className="mt-2 w-2 h-2 rounded-full bg-green-500 shrink-0" />
              <span>{t(`${baseKey}.traits.1`)}</span>
            </li>
          </ul>
        </Card>

        <Card className="bg-white/60 border-white/60 p-10 rounded-[3rem] backdrop-blur-3xl space-y-8 shadow-xl">
          <h3 className="text-xl font-black flex items-center gap-2 text-[#064e3b]">
            <Palette className="w-5 h-5 text-cyan-500" />
            {t("advice")}
          </h3>
          <p className="text-2xl text-green-900/70 leading-relaxed font-serif italic">
            &quot;{t(`${baseKey}.advice`)}&quot;
          </p>

          <div className="pt-8 border-t border-green-900/5">
            <h4 className="text-[10px] font-black text-green-900/30 uppercase tracking-[0.4em] mb-6">
              {t("harmony")}
            </h4>
            <div className="flex items-center gap-6">
              <div
                className="w-16 h-16 rounded-full border-4 border-white shadow-lg shadow-green-900/10"
                style={{ background: colorMap[result.primaryColor] }}
              />
              <div className="space-y-1">
                <div className="font-black text-lg text-[#064e3b] capitalize">
                  {result.primaryColor} Energy
                </div>
                <div className="text-xs font-medium text-green-800/40">
                  {t(`${baseKey}.harmony.reason`)}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
