"use client";

import { m } from "framer-motion";
import { Compass, Sparkles, Star, Trophy } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React from "react";

import type { Locale } from "@/i18n";

import { Badge } from "@/components/ui/badge";
import type { RecommendationResult } from "@/lib/engines/lifestyle-engine";
import careersJson from "@/lib/ontology/lifestyle/careers.json";
import hobbiesJson from "@/lib/ontology/lifestyle/hobbies.json";
import { cn } from "@/lib/system/utils";

interface LifePathSectionProps {
  locale: string;
  recommendations: RecommendationResult[];
}

export function LifePathSection({
  locale,
  recommendations,
}: LifePathSectionProps) {
  const t = useTranslations("saju");
  const hobbies = recommendations.filter((r) => r.type === "hobby");
  const career = recommendations.find((r) => r.type === "career");

  return (
    <div className="w-full max-w-6xl mx-auto space-y-16">
      {/* Recommended Hobbies */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {hobbies.map((hobby, i) => {
          const detail = (hobbiesJson as any)[hobby.id];
          return (
            <m.article
              aria-labelledby={`hobby-title-${hobby.id}`}
              className="group relative p-8 rounded-[40px] bg-white/60 border border-white/60 shadow-xl backdrop-blur-3xl overflow-hidden hover:bg-amber-50/40 transition-colors"
              initial={{ opacity: 0, scale: 0.9 }}
              key={hobby.id}
              transition={{ delay: i * 0.1 }}
              whileInView={{ opacity: 1, scale: 1 }}
            >
              {/* Amber/Gold Accent glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400/10 blur-[40px] rounded-full group-hover:bg-amber-400/20 transition-all" />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-100/50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <Badge
                    className="text-[10px] uppercase font-black border-amber-200 text-amber-700"
                    variant="outline"
                  >
                    {hobby.metadata.category}
                  </Badge>
                </div>

                <h3
                  className="text-2xl font-black text-[#064e3b]"
                  id={`hobby-title-${hobby.id}`}
                >
                  {detail?.name[locale as Locale] || hobby.id}
                </h3>

                <p className="text-green-900/40 text-xs font-black italic tracking-widest leading-relaxed">
                  {hobby.rationale[locale as Locale]}
                </p>

                <p className="text-green-800/70 text-sm leading-relaxed">
                  {detail?.description[locale as Locale]}
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {hobby.metadata.benefitTags.map((tag) => (
                    <span
                      className="text-[10px] font-bold text-amber-800/40 uppercase tracking-tighter"
                      key={tag}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </m.article>
          );
        })}
      </div>

      {/* Soul's Calling (Career) */}
      {career && (
        <m.article
          aria-labelledby="career-title"
          className="relative p-12 rounded-[50px] bg-gradient-to-br from-[#064e3b] to-[#042f24] text-white shadow-2xl overflow-hidden group"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          {/* Golden Aura */}
          <div className="absolute right-0 top-0 w-[500px] h-full bg-gradient-to-l from-amber-500/10 to-transparent skew-x-12 opacity-50 group-hover:opacity-100 transition-opacity" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-shrink-0 p-8 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 shadow-inner">
              <Trophy className="w-16 h-16 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
            </div>

            <div className="flex-grow space-y-4">
              <div className="flex items-center gap-3">
                <Badge className="bg-amber-400 text-[#064e3b] font-black border-none">
                  THE SOUL&apos;S CALLING
                </Badge>
                <span className="text-amber-400/50 flex items-center gap-1 text-xs font-black italic">
                  <Compass className="w-3 h-3" /> PRECISION ALIGNMENT
                </span>
              </div>

              <h3
                className="text-4xl md:text-5xl font-black italic tracking-tighter"
                id="career-title"
              >
                {(careersJson as any)[career.id]?.title[locale as Locale] ||
                  career.id}
              </h3>

              <p className="text-amber-100/60 font-medium italic max-w-2xl">
                &quot;{career.rationale[locale as Locale]}&quot;
              </p>

              <div className="pt-4 flex items-center gap-4">
                <div className="h-px flex-grow bg-white/10" />
                <div className="flex gap-2">
                  {career.metadata.benefitTags.map((tag) => (
                    <Badge
                      className="border-white/20 text-white/40 text-[10px]"
                      key={tag}
                      variant="outline"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </m.article>
      )}
    </div>
  );
}
