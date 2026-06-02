"use client";

import { m } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useMemo } from "react";

import { LoveSynergySection } from "@/components/results/LoveSynergySection";
import { MetaphysicalGauge } from "@/components/results/MetaphysicalGauge";
import { withErrorBoundary } from "@/components/shared/ErrorBoundary";
import { RiasecCard } from "@/components/ucl/cards/RiasecCard";
import { SajuCard } from "@/components/ucl/cards/SajuCard";
import { TciCard } from "@/components/ucl/cards/TciCard";
// Phase 4 Components
import { AncientCoordinateCard } from "@/components/ucl/displays/AncientCoordinateCard";
import { BirthTotemSection } from "@/components/ucl/displays/BirthTotemSection"; // Phase 10
// import { BreathingSacredGeometry } from '@/components/ucl/displays/BreathingSacredGeometry';
import { InfoSection } from "@/components/ucl/displays/InfoSection";
import { OraclePanel } from "@/components/ucl/displays/OraclePanel";
import { ResonanceDashboard } from "@/components/ucl/displays/ResonanceDashboard";
import { TheArchiveLog } from "@/components/ucl/displays/TheArchiveLog";
import { ZiWeiExplorer } from "@/components/ucl/displays/ZiWeiExplorer";
import { DynamicNarrativeBlock } from "@/components/ucl/text/DynamicNarrativeBlock";
import { getManifesto } from "@/lib/content/manifesto"; // Static Manifesto Content
import { calculateMetaphysics } from "@/lib/metaphysics/frequency";
import { UniversalProfile } from "@/lib/ontology/engine/types";
import { FiveElement, HeavenlyStem } from "@/lib/ontology/saju/types";

// --- Type Definitions ---

interface TemplateEMirrorProps {
  locale: "en" | "ko";
  partnerName: string;
  profile: UniversalProfile; // Use the new standardized profile
  selfName: string;
}

// --- Helper Functions ---

function getStemElement(stem: HeavenlyStem): FiveElement {
  switch (stem) {
    case HeavenlyStem.BYEONG:
    case HeavenlyStem.JEONG:
      return FiveElement.FIRE;
    case HeavenlyStem.EUL:
    case HeavenlyStem.GAP:
      return FiveElement.WOOD;
    case HeavenlyStem.GI:
    case HeavenlyStem.MU:
      return FiveElement.EARTH;
    case HeavenlyStem.GYE:
    case HeavenlyStem.IM:
      return FiveElement.WATER;
    case HeavenlyStem.GYEONG:
    case HeavenlyStem.SIN:
      return FiveElement.METAL;
    default:
      return FiveElement.EARTH;
  }
}

// --- Component Definition ---

function TemplateEMirrorContent({
  locale,
  partnerName,
  profile,
  selfName,
}: TemplateEMirrorProps) {
  // 1. Chronos Integration (Now native in profile)
  const chronosData = profile.cosmic;
  const tU = useTranslations("universal");

  // 2. Adapter: Compute Resonance Dashboard Data (Legacy support mapping)
  // 2. Adapter: Compute Resonance Dashboard Data (Legacy support mapping)
  const dashboardData = useMemo(() => {
    const p = profile as any;
    return {
      archetype: "Cosmic Traveler",
      cognitiveRisks: [],
      cosmicSynthesis: p.synergy?.description?.[locale]
        ? tU(p.synergy.description.ko as any)
        : "",
      frictions: [],
      overallResonance: p.synergy?.score || 80,
      resilienceActions: [],
      star: undefined,
      suggestedHobbies: [],
      synergies: (p.synergy?.synergies || []).map((s: any) => ({
        description: s.description[locale] || s.description["en"],
        pair: s.pair,
        score: s.score,
      })),
      tags:
        p.luckyAttributes?.luckyColors?.map((c: any) =>
          typeof c === "string" ? c : c[locale],
        ) || [],
    };
  }, [profile, locale, tU]);

  // Manifesto Content
  const manifesto = useMemo(() => getManifesto(locale), [locale]);

  return (
    <div className="w-full min-h-full bg-transparent font-sans text-green-900 relative overflow-hidden flex flex-col items-center pb-safe">
      {/* 1. Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-[10%] left-[10%] mix-blend-multiply blur-3xl rounded-full w-96 h-96 bg-green-300/40 animate-pulse" />
        <div
          className="absolute bottom-[10%] right-[10%] mix-blend-multiply blur-3xl rounded-full w-96 h-96 bg-teal-300/40 animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl px-4 py-8 md:p-12 space-y-24">
        {/* 1.5 Metaphysical Gauge */}
        {profile.saju && (
          <m.div
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center -mb-12 relative z-20"
            initial={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.5 }}
          >
            {(() => {
              const metaData = calculateMetaphysics({
                biorhythm: profile.biorhythms || {
                  emotional: 50,
                  intellectual: 50,
                  physical: 50,
                },
                saju: {
                  dayMasterStrength: 5,
                  element: getStemElement(profile.saju.dayMaster),
                },
                tci: {
                  autonomy: 50,
                  noveltySeeking: 50,
                },
              });

              return (
                <MetaphysicalGauge
                  color={metaData.color}
                  density={metaData.density}
                  description={
                    locale === "ko"
                      ? `현재 당신의 영혼은 ${metaData.frequency}Hz의 ${metaData.waveform} 파동으로 진동하고 있습니다.`
                      : metaData.description
                  }
                  frequency={metaData.frequency}
                  waveform={metaData.waveform}
                />
              );
            })()}
          </m.div>
        )}

        {/* 1.6 Love & Synergy */}
        {profile.saju && (
          <LoveSynergySection locale={locale} saju={profile.saju} />
        )}

        {/* 2. UCL Resonance Dashboard (Layer 1) */}
        <section className="pt-12">
          <div className="text-center mb-12 space-y-2">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-green-800/40">
              Protocol: The Mirror
            </div>
            <h2 className="text-2xl font-black text-green-900">
              {selfName} & {partnerName}
            </h2>
          </div>

          <ResonanceDashboard
            className="bg-white/40 backdrop-blur-3xl rounded-[3rem] p-6 md:p-12 shadow-2xl border border-white/50"
            report={dashboardData}
          />
        </section>

        {/* 3. The Grand Archive (Phase 4 Extension) */}
        {chronosData && (
          <section className="space-y-8 animate-fade-in-up">
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-black text-green-900">
                The Grand Archive
              </h3>
              <p className="text-sm opacity-60 max-w-md mx-auto">
                Your universal coordinates across Mayan, Celtic, Egyptian, and
                Vedic time.
              </p>
            </div>
            <AncientCoordinateCard coords={chronosData} />
            <BirthTotemSection coords={chronosData} />
          </section>
        )}

        {/* 4. The Council of Seven (The Oracle Panel - Narrative Layer) */}
        <section className="w-full max-w-4xl mx-auto px-4">
          <OraclePanel
            context={profile}
            isPremiumUser={false}
            locale={locale}
            onPremiumAction={() =>
              alert(
                locale === "ko"
                  ? "운명의 파동을 증폭하는 중..."
                  : "Amplifying destiny waves...",
              )
            }
          />
        </section>

        {/* 5. Narrative Scroll */}
        <section className="space-y-12 max-w-3xl mx-auto px-4">
          <DynamicNarrativeBlock
            i18nKey="narrative.meeting"
            values={{
              text: profile.synergy?.advice?.[locale]
                ? tU(profile.synergy.advice.ko as any)
                : "",
            }}
          />
          <div className="space-y-8">
            <DynamicNarrativeBlock
              i18nKey={profile.synergy?.description?.[locale] || ""}
              variant="highlight"
            />
          </div>
        </section>

        {/* 6. Breathing Removed */}

        {/* 7. Atomic Identity Cards (Identity Layer) */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h3 className="text-3xl font-black text-green-900">
              The Architects of Fate
            </h3>
            <p className="text-sm opacity-60 max-w-md mx-auto">
              The ancient archetypes (Mythos) and modern traits (Logos) that
              define your resonance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Slot 1: Saju */}
            {profile.saju ? (
              <SajuCard data={profile.saju} userName={selfName} />
            ) : (
              <div className="min-h-[300px] flex items-center justify-center bg-white/30 rounded-[2rem] border border-dashed border-green-200">
                <span className="text-xs font-black uppercase tracking-widest opacity-30">
                  Saju Data Meaning Missing
                </span>
              </div>
            )}

            {/* Slot 2: Numerology */}
            {profile.numerology ? (
              <div className="min-h-[300px] bg-white/60 p-8 rounded-[2rem] border border-white/60 shadow-xl">
                <h4 className="text-sm font-black uppercase tracking-widest mb-4">
                  Numerology
                </h4>
                <div className="text-5xl font-black">
                  {profile.numerology.lifePath}
                </div>
                <p className="mt-4 text-xs opacity-60">
                  {
                    (profile.numerology.overallAnalysis?.lifeTheme as any)?.[
                      locale
                    ]
                  }
                </p>
              </div>
            ) : (
              <div className="min-h-[300px] flex items-center justify-center bg-white/30 rounded-[2rem] border border-dashed border-green-200">
                <span className="text-xs font-black uppercase tracking-widest opacity-30">
                  Numerology Missing
                </span>
              </div>
            )}

            {/* Slot 3: Animal Zodiac */}
            <div className="min-h-[300px] bg-white/60 p-8 rounded-[2rem] border border-white/60 shadow-xl">
              <h4 className="text-sm font-black uppercase tracking-widest mb-4">
                Animal Zodiac
              </h4>
              <div className="text-4xl font-black">
                {profile.animalZodiac.name[locale] ||
                  profile.animalZodiac.name.en}
              </div>
            </div>
          </div>
        </section>

        {/* 8. Archive Log / Manifesto (Phase 4 Extension) */}
        <section className="w-full max-w-5xl px-4 py-24 border-t border-green-900/5 mt-24">
          <TheArchiveLog mdxSource={manifesto} />
          <InfoSection className="mt-12 opacity-60 hover:opacity-100 transition-opacity" />
        </section>
      </div>
    </div>
  );
}

// Export the Safe Component
export const TemplateEMirror = withErrorBoundary(TemplateEMirrorContent, {
  message:
    "We encountered a cosmic anomaly. Please try reloading the star map.",
  title: "Cosmic Resonance Interrupted",
});
