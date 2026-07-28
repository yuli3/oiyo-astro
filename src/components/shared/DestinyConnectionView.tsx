"use client";
import { m } from "framer-motion";
import {
  ArrowRight,
  Droplets,
  Flame,
  LockKeyhole,
  Mountain,
  Sparkles,
  Sprout,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React, { useMemo } from "react";

import type { Locale } from "@/i18n";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CorrelationEngine,
  CorrelationInsight,
} from "@/lib/engines/correlation-engine";
import { heavenlyStems } from "@/lib/ontology/saju/data";
import { calculateSaju } from "@/lib/ontology/saju/logic";
import { useUserProfile } from "@/lib/user/context/UserContext";
import { resolveBirthInstant, resolveBirthRecord } from "@/lib/user/birth-record";
import { ROUTES } from "@/registry/routes";

interface DestinyConnectionViewProps {
  currentConsumption?: string;
  currentMbti?: string;
  locale: string;
}

export function DestinyConnectionView({
  currentConsumption,
  currentMbti,
  locale,
}: DestinyConnectionViewProps) {
  const t = useTranslations("correlation"); // Assuming this namespace exists, or fallback
  const tc = useTranslations("common");
  const { profile } = useUserProfile();

  const sajuElement = useMemo(() => {
    const record = resolveBirthRecord(profile);
    if (record) {
      try {
        const resolution = resolveBirthInstant(record);
        if (resolution.status === "resolved") {
          const result = calculateSaju(
            resolution.instant,
            false,
            undefined,
            resolution.longitude,
          );
          const stem = heavenlyStems[result.dayMaster];
          return stem?.element; // wood, fire, earth, metal, water
        }
      } catch (e) {
        console.error("Saju Calc Error", e);
      }
    }
    return null;
  }, [profile]);

  // Use props or profile for MBTI
  const mbti = currentMbti || profile.mbtiType;

  const insights = useMemo(() => {
    // Construct a pseudo-profile for the engine
    const tempProfile = {
      branches: { mbti: { type: mbti } },
      id: "local",
      roots: { primal: { saju: { element: sajuElement } } },
    };

    // Construct consumption object if available
    const consumObj = currentConsumption
      ? { primaryStyle: currentConsumption }
      : null;

    return CorrelationEngine.analyze(
      tempProfile as any,
      consumObj as any,
      null,
      locale as "en" | "ko",
    );
  }, [sajuElement, mbti, currentConsumption, locale]);

  const primaryInsight = insights.find(
    (i) => i.domainB === "MBTI" || i.domainB === "Consumption",
  );

  const getElementIcon = (el: string) => {
    switch (el) {
      case "earth":
        return <Mountain className="w-5 h-5 text-amber-600" />;
      case "fire":
        return <Flame className="w-5 h-5 text-rose-500" />;
      case "metal":
        return <Zap className="w-5 h-5 text-slate-400" />;
      case "water":
        return <Droplets className="w-5 h-5 text-green-500" />;
      case "wood":
        return <Sprout className="w-5 h-5 text-green-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-500" />;
    }
  };

  if (!primaryInsight) {
    if (mbti && !sajuElement) {
      // Teaser State
      return (
        <m.div
          animate={{ opacity: 1, y: 0 }}
          className="w-full mt-12 mb-20"
          initial={{ opacity: 0, y: 20 }}
        >
          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-amber-50/50 to-orange-50/30 backdrop-blur-md shadow-lg p-8 group">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <LockKeyhole className="w-32 h-32 text-amber-900" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-amber-100/50 flex items-center justify-center border border-amber-200">
                <Sparkles className="w-8 h-8 text-amber-600" />
              </div>

              <div className="flex-1 text-center md:text-left space-y-2">
                <h3 className="text-2xl font-black text-amber-950 font-serif tracking-tight">
                  {t("unlockDestiny", {
                    defaultMessage: "Unlock Your Primal Destiny",
                  })}
                </h3>
                <p className="text-amber-800/80 leading-relaxed font-medium">
                  {t("teaserText", {
                    defaultMessage:
                      "You discovered your Personality (MBTI), but your Primal Energy is still hidden. Connect the dots to see the full picture.",
                  })}
                </p>
              </div>

              <Link href={ROUTES.ONTOLOGY.SAJU.path(locale as Locale)}>
                <Button className="bg-amber-600/90 hover:bg-amber-700 text-white rounded-full px-8 py-6 text-lg font-bold shadow-amber-900/10 shadow-xl transition-all hover:scale-105">
                  {t("discoverPrimal", { defaultMessage: "Discover Elements" })}{" "}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </Card>
        </m.div>
      );
    }
    return null; // Nothing to show if no data at all
  }

  return (
    <m.div
      animate={{ opacity: 1, y: 0 }}
      className="w-full mt-12 mb-20"
      initial={{ opacity: 0, y: 20 }}
    >
      <Card className="relative overflow-hidden border-none bg-[#fffbf0] shadow-xl p-0 ring-1 ring-amber-900/5">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

        <div className="p-8 md:p-10 relative z-10">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 text-amber-700/60 font-medium text-sm tracking-widest uppercase">
              <Sparkles className="w-4 h-4" />
              {t("correlationTitle", {
                defaultMessage: "Destiny Resonance Engine",
              })}
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="flex-1 space-y-4">
                <h3 className="text-3xl md:text-4xl font-serif font-bold text-amber-950 leading-tight">
                  {primaryInsight.insight}
                </h3>
                <p className="text-lg text-amber-800/80 leading-relaxed max-w-2xl">
                  {primaryInsight.advice}
                </p>
              </div>

              <div className="flex-shrink-0 flex flex-col items-center justify-center p-6 bg-white/60 rounded-2xl border border-amber-900/5 min-w-[140px]">
                <div className="text-5xl font-black text-amber-600 mb-1 tabular-nums tracking-tighter">
                  {primaryInsight.resonanceScore}
                  <span className="text-2xl text-amber-400 align-top ml-1">
                    %
                  </span>
                </div>
                <div className="text-xs font-bold text-amber-800/40 uppercase tracking-widest">
                  {t("resonance", { defaultMessage: "Resonance" })}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-amber-900/5 flex flex-wrap gap-4">
              {/* Micro badges for the connected domains */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100/50 border border-amber-200 text-amber-800 text-sm font-bold">
                {getElementIcon(sajuElement?.toLowerCase() || "")}
                <span>{sajuElement?.toUpperCase()}</span>
              </div>
              <div className="text-amber-300">×</div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200 text-slate-700 text-sm font-bold">
                <span>{mbti}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </m.div>
  );
}
