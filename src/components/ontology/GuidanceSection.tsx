"use client";

import { Briefcase, Heart, Sparkles, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React, { useMemo } from "react";

import { useNamespacedFallback } from "@/lib/i18n/use-namespaced-fallback";
import { RecommendationAggregationService } from "@/lib/ontology/bridge/recommendation-engine";
import { OntologyProfile } from "@/lib/ontology/types";
import { cn } from "@/lib/system/utils";

interface GuidanceSectionProps {
  profile: OntologyProfile;
}

export function GuidanceSection({ profile }: GuidanceSectionProps) {
  const t = useNamespacedFallback("ontology.dashboard", "dashboard");
  const tHobby = useTranslations("ontology.lifestyle.hobby");
  const locale = useLocale();

  // 1. Calculate Aggregated RIASEC Score (The "Star Hub")
  const vocationalVector = useMemo(() => {
    return RecommendationAggregationService.aggregateVocationalProfile(profile);
  }, [profile]);

  const topRiasecCode = useMemo(() => {
    return RecommendationAggregationService.getTopCode(vocationalVector);
  }, [vocationalVector]);

  // 2. Get Recommendations
  const careers = useMemo(() => {
    return RecommendationAggregationService.getRecommendedCareers(
      topRiasecCode,
    );
  }, [topRiasecCode]);

  const hobbies = useMemo(() => {
    return RecommendationAggregationService.getRecommendedHobbies(
      topRiasecCode,
    );
  }, [topRiasecCode]);

  // 3. Get Comfort Message
  const mbtiType = profile.branches.mbti?.type;
  const comfortMessage = useMemo(() => {
    if (!mbtiType) return null;
    return RecommendationAggregationService.getComfortMessage(
      mbtiType,
      locale as "en" | "ko",
    );
  }, [mbtiType, locale]);

  if (!topRiasecCode || topRiasecCode.length < 2) return null;

  return (
    <section className="mt-40 pt-24 border-t border-slate-200/50">
      <div className="text-center mb-16">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-indigo-500/20 rotate-3 transform hover:rotate-6 transition-transform">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="font-serif text-3xl font-black mb-2 text-slate-900">
          {t("guidanceTitle")}
        </h2>
        <p className="text-slate-600 text-sm font-mono tracking-widest uppercase">
          {t("guidanceSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {/* 1. Career Card */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl p-8 hover:shadow-2xl transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
            <Briefcase className="w-32 h-32" />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-cyan-700" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-1">
                {t("recommendedCareers")}
              </h3>
              <p className="text-xs font-bold text-cyan-700 uppercase tracking-widest">
                {t("basedOn", { type: "RIASEC" })}
              </p>
            </div>
            <div className="space-y-3">
              {careers.map((career, idx) => (
                <div
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-cyan-50 transition-colors"
                  key={career.id}
                >
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-black text-cyan-900 shadow-sm border border-cyan-100">
                    {idx + 1}
                  </div>
                  <span className="font-bold text-slate-700 text-sm">
                    {(career.title as Record<string, string | undefined>)[
                      locale
                    ] ||
                      (career.title as Record<string, string>).en ||
                      career.id}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Hobby Card */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl p-8 hover:shadow-2xl transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
            <Star className="w-32 h-32" />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
              <Star className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-1">
                {t("recommendedHobbies")}
              </h3>
              <p className="text-xs font-bold text-green-700 uppercase tracking-widest">
                {t("basedOn", { type: "RIASEC" })}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {hobbies.slice(0, 8).map((hobby) => {
                // Map ID (e.g. "painting") to Key (e.g. "HOBBY_PAINTING")
                const key = `HOBBY_${hobby.toUpperCase().replace(/-/g, "_")}`;
                let translatedName = hobby;
                try {
                  // Access translated name from ontology.lifestyle.hobby.[KEY].name
                  translatedName = tHobby(`${key}.name`);
                } catch {
                  // Fallback to ID
                }

                return (
                  <span
                    className="px-3 py-1.5 bg-green-50 text-green-800 text-xs font-bold rounded-lg border border-green-100 uppercase tracking-wide"
                    key={hobby}
                  >
                    {translatedName}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Soul Comfort Card */}
        <div className="bg-gradient-to-br from-indigo-700 to-purple-700 rounded-[40px] shadow-xl p-8 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Heart className="w-32 h-32" />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white mb-1">
                  {t("soulGuidance")}
                </h3>
                <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest">
                  {t("basedOn", { type: mbtiType || "MBTI" })}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-2xl font-serif font-medium leading-relaxed opacity-90">
                &quot;{comfortMessage || t("common.noGuidance")}&quot;
              </div>
              <div className="h-1 w-20 bg-white/30 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
