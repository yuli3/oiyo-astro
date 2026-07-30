"use client";

import { AnimatePresence, m } from "framer-motion";
import {
  Calendar,
  Clock,
  Droplets,
  Flame,
  Gem,
  Info,
  Leaf,
  Mountain,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/system/utils";

import { earthlyBranches, heavenlyStems } from "../data";
import { EarthlyBranch, FiveElement, HeavenlyStem, type SajuResult } from "../types";

type PillarType = "day" | "hour" | "month" | "year";

interface SajuPillarsDisplayProps {
  className?: string;
  interactive?: boolean;
  locale: string;
  pillars: SajuResult;
  showDetails?: boolean;
}

export function SajuPillarsDisplay({
  className = "",
  interactive = true,
  locale = "ko",
  pillars,
  showDetails = true,
}: SajuPillarsDisplayProps) {
  const [selectedPillar, setSelectedPillar] = useState<null | PillarType>(null);
  const [viewMode, setViewMode] = useState<"modern" | "traditional">(
    "traditional",
  );
  const t = useTranslations("saju");

  // Helper to safely get localized text
  const getStemName = (stem: HeavenlyStem) =>
    t(heavenlyStems[stem].key.replace("saju.", ""));
  const getBranchName = (branch: EarthlyBranch) =>
    t(earthlyBranches[branch].key.replace("saju.", ""));

  // Extract just the character if possible (e.g. '갑목' -> '갑')
  // This is a heuristic for Korean. For English, we might show full name.
  // Extract just the character if possible (e.g. '갑목' -> '갑')
  // For CJK locales, extract single character. For Others, use name.
  const isCJK = ["ja", "ko", "zh"].includes(locale);
  const getStemChar = (stem: HeavenlyStem) => {
    const name = t(heavenlyStems[stem].key.replace("saju.", ""));
    return isCJK ? name.charAt(0) : name;
  };
  const getBranchChar = (branch: EarthlyBranch) => {
    const name = t(earthlyBranches[branch].key.replace("saju.", ""));
    return isCJK ? name.charAt(0) : name;
  };

  const getElementIcon = (element: FiveElement) => {
    switch (element) {
      case FiveElement.EARTH:
        return <Mountain className="w-4 h-4 text-amber-400" />;
      case FiveElement.FIRE:
        return <Flame className="w-4 h-4 text-orange-400" />;
      case FiveElement.METAL:
        return <Gem className="w-4 h-4 text-green-800/50" />;
      case FiveElement.WATER:
        return <Droplets className="w-4 h-4 text-cyan-400" />;
      case FiveElement.WOOD:
        return <Leaf className="w-4 h-4 text-green-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-green-400" />;
    }
  };

  const getElementColor = (element: FiveElement) => {
    switch (element) {
      case FiveElement.EARTH:
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case FiveElement.FIRE:
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case FiveElement.METAL:
        return "bg-green-600/10 text-green-800/50 border-green-600/20";
      case FiveElement.WATER:
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case FiveElement.WOOD:
        return "bg-green-500/10 text-green-400 border-green-500/20";
      default:
        return "bg-green-500/10 text-green-400 border-green-500/20";
    }
  };

  const getPillarIcon = (pillarType: PillarType) => {
    switch (pillarType) {
      case "day":
        return <User className="w-5 h-5 text-amber-400" />;
      case "hour":
        return <Clock className="w-5 h-5 text-green-400" />;
      case "month":
        return <Users className="w-5 h-5 text-green-400" />;
      case "year":
        return <Calendar className="w-5 h-5 text-green-400" />;
      default:
        return <Info className="w-5 h-5 text-green-600/60" />;
    }
  };

  const pillarConfig: Array<{
    branch: EarthlyBranch;
    nameKey: string;
    stem: HeavenlyStem;
    type: PillarType;
  }> = [
    {
      branch: pillars.year.earthlyBranch,
      nameKey: "year",
      stem: pillars.year.heavenlyStem,
      type: "year",
    },
    {
      branch: pillars.month.earthlyBranch,
      nameKey: "month",
      stem: pillars.month.heavenlyStem,
      type: "month",
    },
    {
      branch: pillars.day.earthlyBranch,
      nameKey: "day",
      stem: pillars.day.heavenlyStem,
      type: "day",
    },
    {
      branch: pillars.hour.earthlyBranch,
      nameKey: "hour",
      stem: pillars.hour.heavenlyStem,
      type: "hour",
    },
  ];

  return (
    <article className={cn("space-y-8 font-sans", className)} lang={locale}>
      {/* View Mode Toggle */}
      {interactive && (
        <div className="flex justify-center gap-4">
          <Button
            className={cn(
              "rounded-2xl border-white/10 px-8 transition-all font-black uppercase tracking-widest text-[10px]",
              viewMode === "traditional"
                ? "bg-green-500 text-[#064e3b] border-green-400 shadow-lg shadow-green-500/20"
                : "bg-white/5 text-green-600/60",
            )}
            onClick={() => setViewMode("traditional")}
            size="lg"
            variant="outline"
          >
            {t("pillars.viewModes.traditional")}
          </Button>
          <Button
            className={cn(
              "rounded-2xl border-white/10 px-8 transition-all font-black uppercase tracking-widest text-[10px]",
              viewMode === "modern"
                ? "bg-green-500 text-[#064e3b] border-green-400 shadow-lg shadow-green-500/20"
                : "bg-white/5 text-green-600/60",
            )}
            onClick={() => setViewMode("modern")}
            size="lg"
            variant="outline"
          >
            {t("pillars.viewModes.modern")}
          </Button>
        </div>
      )}

      {/* Traditional View */}
      <AnimatePresence mode="wait">
        {viewMode === "traditional" ? (
          <m.div
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
            exit={{ opacity: 0, y: -20 }}
            initial={{ opacity: 0, y: 20 }}
            key="traditional"
          >
            <Card className="p-8 md:p-12 bg-white/5 border-white/10 rounded-[3rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />

              <div className="text-center mb-12 relative z-10 space-y-2">
                <h3 className="text-3xl md:text-4xl font-serif font-black italic text-white tracking-tighter">
                  {t("result.pillars.title")}
                </h3>
                <p className="text-green-600/60 uppercase tracking-[0.3em] text-[10px] font-black">
                  {t("pillars.traditionalDescription")}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                {pillarConfig.map((item) => {
                  const stemData = heavenlyStems[item.stem];
                  const isSelected = selectedPillar === item.type;

                  return (
                    <m.div
                      className={cn(
                        "text-center p-8 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group",
                        isSelected
                          ? "bg-green-500/10 border-green-500/40 shadow-xl shadow-green-500/10"
                          : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20",
                      )}
                      key={item.type}
                      layoutId={`pillar-${item.type}`}
                      onClick={() =>
                        setSelectedPillar(isSelected ? null : item.type)
                      }
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex justify-center mb-6">
                        {getPillarIcon(item.type)}
                      </div>
                      <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-green-600 group-hover:text-green-400 transition-colors mb-4">
                        {t(`pillars.${item.nameKey}` as any)}
                      </h4>

                      {/* Stem/Branch Duo */}
                      <div className="space-y-2 mb-6">
                        <div className="text-5xl font-serif font-black italic text-white">
                          {getStemChar(item.stem)}
                        </div>
                        <div className="text-5xl font-serif font-black italic text-white/40 group-hover:text-white/60 transition-colors">
                          {getBranchChar(item.branch)}
                        </div>
                      </div>

                      {/* Element Badge */}
                      <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/5 mt-4">
                        {getElementIcon(stemData.element)}
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                          {t(`elements.${stemData.element}.short`)}
                        </span>
                      </div>
                    </m.div>
                  );
                })}
              </div>
            </Card>

            {/* Details Section */}
            <AnimatePresence>
              {selectedPillar && (
                <m.div
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="p-10 bg-green-500/5 border border-green-500/10 rounded-[2.5rem] backdrop-blur-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                      {getPillarIcon(selectedPillar)}
                    </div>
                    {(() => {
                      const pillar = pillarConfig.find(
                        (p) => p.type === selectedPillar,
                      )!;
                      const stemData = heavenlyStems[pillar.stem];
                      const branchData = earthlyBranches[pillar.branch];

                      return (
                        <div className="relative z-10 space-y-10">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-400 border border-green-500/30">
                              {getPillarIcon(pillar.type)}
                            </div>
                            <h3 className="text-3xl font-serif font-black italic text-white">
                              {t(`pillars.${pillar.nameKey}` as any)}{" "}
                              Interpretation
                            </h3>
                          </div>

                          <div className="grid md:grid-cols-2 gap-12">
                            <section className="space-y-6">
                              <div className="space-y-2">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-green-500/60">
                                  {t("pillars.meaning")}
                                </h4>
                                <p className="text-green-50 text-lg leading-relaxed font-sans">
                                  {t(`pillars.${pillar.nameKey}Meaning` as any)}
                                </p>
                              </div>
                              <div className="space-y-2 text-green-600/60">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-green-500/60">
                                  {t("pillars.represents")}
                                </h4>
                                <p className="text-sm border-l-2 border-green-500/30 pl-4">
                                  {t(
                                    `pillars.${pillar.nameKey}Represents` as any,
                                  )}
                                </p>
                              </div>
                            </section>

                            <section className="space-y-8">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-green-500/60">
                                {t("pillars.composition")}
                              </h4>
                              <div className="grid gap-4">
                                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                                  <div className="space-y-1">
                                    <p className="text-2xl font-serif font-black italic text-white">
                                      {getStemName(pillar.stem)}
                                    </p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-green-600">
                                      {t("pillars.heavenlyStem")}
                                    </p>
                                  </div>
                                </div>

                                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                                  <div className="space-y-1">
                                    <p className="text-2xl font-serif font-black italic text-white">
                                      {getBranchName(pillar.branch)}
                                    </p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-green-600">
                                      {t("pillars.earthlyBranch")}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </section>
                          </div>
                        </div>
                      );
                    })()}
                  </Card>
                </m.div>
              )}
            </AnimatePresence>
          </m.div>
        ) : (
          <m.div
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-8"
            exit={{ opacity: 0, y: -20 }}
            initial={{ opacity: 0, y: 20 }}
            key="modern"
          >
            {pillarConfig.map((item) => {
              const stemData = heavenlyStems[item.stem];
              return (
                <Card
                  className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-3xl space-y-6 relative overflow-hidden group"
                  key={item.type}
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                    {getPillarIcon(item.type)}
                  </div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20">
                      {getPillarIcon(item.type)}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-2xl font-serif font-black italic text-white">
                        {t(`pillars.${item.nameKey}`)}
                      </h4>
                      <Badge
                        className={cn(
                          "text-[8px] font-black tracking-widest border-none",
                          getElementColor(stemData.element),
                        )}
                      >
                        {t(`elements.${stemData.element}.name` as any)}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-6 bg-green-500/5 border border-green-500/10 rounded-2xl relative z-10">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-green-500/60 mb-3">
                      {t("pillars.modernMeaning")}
                    </h5>
                    <p className="text-green-800/50 leading-relaxed font-sans italic">
                      {t(`pillars.modern.${item.type}.description` as any)}
                    </p>
                  </div>
                </Card>
              );
            })}
          </m.div>
        )}
      </AnimatePresence>
    </article>
  );
}
