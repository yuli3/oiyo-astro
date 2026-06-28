/* eslint-disable no-restricted-syntax */
"use client";

import {
  Activity,
  ArrowRight,
  BookOpen,
  Brain,
  Briefcase,
  Compass,
  Database,
  Fingerprint,
  Flower2,
  Gem,
  Globe,
  Hash,
  Heart,
  Hexagon,
  Landmark,
  Map,
  Moon,
  Quote,
  Scale,
  Shield,
  Sparkles,
  Star,
  Sun,
  Target,
  Tent,
  Users,
  Waves,
  Zap,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

import { DailyOracleCard } from "@/components/almanac/DailyOracleCard";
import { MoodCalendarGrid } from "@/components/mood-calendar/mood-calendar-grid";
import { AkashicRecord } from "@/components/ontology/AkashicRecord";
import { GrandOracleSynthesis } from "@/components/ontology/GrandOracleSynthesis";

interface LuckData {
  color?: string;
  colors?: string[];
  direction?: string;
  directions?: string[];
  flower?: string;
  flowers?: string[];
  gemstone?: string;
  gemstones?: string[];
  number?: number;
  numbers?: number[];
}

interface MythosData {
  birthflower?: { name?: Partial<Record<string, string>> };
  birthstone?: { name?: Partial<Record<string, string>> };
  symbols?: { star?: { name?: Partial<Record<string, string>> } };
}

const FactionCard = dynamic(
  () =>
    import("@/components/ontology/FactionCard").then((mod) => mod.FactionCard),
  {
    loading: () => (
      <div className="md:col-span-2 lg:col-span-2 md:row-span-3 border border-green-100 bg-green-50/10 rounded-3xl min-h-[300px] animate-pulse" />
    ),
    ssr: false, // Force client-side split to shed bundle weight
  },
);

const GenericFactionCard = dynamic(
  () =>
    import("@/components/ontology/GenericFactionCard").then(
      (mod) => mod.GenericFactionCard,
    ),
  {
    loading: () => (
      <div className="md:col-span-2 lg:col-span-2 md:row-span-3 border border-slate-100 bg-slate-50/10 rounded-3xl min-h-[300px] animate-pulse" />
    ),
    ssr: false,
  },
);
import { GuidanceSection } from "@/components/ontology/GuidanceSection";
import { OntologyCard } from "@/components/ontology/OntologyCard";
import { SajuInputForm } from "@/components/ontology/SajuInputForm";
import { TestSelection } from "@/components/ontology/TestSelection";
import { BiorhythmChart } from "@/components/ontology/widgets/BiorhythmChart";
// import { WisdomReading } from "@/components/ontology/WisdomReading";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ROUTES } from "@/config/routes";
import { useOntologySelectors } from "@/hooks/useOntologySelectors";
import { useOntologySynthesis } from "@/hooks/useOntologySynthesis";
import { useUserHistory } from "@/hooks/useUserHistory";
import { Locale } from "@/i18n";
import { DailyInsightProvider } from "@/lib/almanac/DailyInsightProvider";
import { calculateBiorhythmRange } from "@/lib/engines/biorhythm-engine";
import { InterpretationService } from "@/lib/engines/interpretation/InterpretationService";
// import { WisdomReading } from "@/components/ontology/WisdomReading";
import {
  BUREAU_NARRATIVES,
  MAIN_STAR_NARRATIVES,
  PALACE_NARRATIVES,
} from "@/lib/engines/interpretation/shards/ziwei-shards";
import { useNamespacedFallback } from "@/lib/i18n/use-namespaced-fallback";
import { extractAkashicData } from "@/lib/ontology/akashic/logic";
import {
  analyzeChosunFaction,
  FactionAnalysis,
} from "@/lib/ontology/chosun-faction/logic";
import { aggregateOntology } from "@/lib/ontology/engine";
import { calculateUniversalCorrelation } from "@/lib/ontology/engine/logic";
import { UniversalProfile } from "@/lib/ontology/engine/types";
import { analyzeSaju, calculateSaju } from "@/lib/ontology/saju/logic";
import { LuckyAttributes } from "@/lib/ontology/saju/types";
import { OntologyProfile } from "@/lib/ontology/types";
import { MAIN_STARS } from "@/lib/ontology/ziwei/data";
import { ResonanceMandalaLazy } from "@/lib/system/lazy/dynamic-imports";
import { cn } from "@/lib/system/utils";
import { useUserProfile } from "@/lib/user/context/UserContext";
import { FEATURE_REGISTRY } from "@/registry";

export function OntologyClient() {
  const { clearProfile, isInitialized, profile } = useUserProfile();
  const { history, loading } = useUserHistory();
  const t = useNamespacedFallback("ontology.dashboard", "dashboard");
  const tc = useTranslations("catalog");
  const tSaju = useTranslations("saju");
  const tEgyptian = useTranslations("egyptian");
  const tUi = useTranslations("ui");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [isStable, setIsStable] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, [setIsMounted]);

  const [aggregatedProfile, setAggregatedProfile] =
    useState<null | OntologyProfile>(null);

  useEffect(() => {
    if (loading || !history) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAggregatedProfile((prev) => (prev ? null : prev));
      return;
    }
    aggregateOntology(history)
      .then((profile) => setAggregatedProfile(profile))
      .catch((err) => {
        console.error("Ontology Aggregation Error", err);
        setIsStable(false);
      });
  }, [history, loading, setAggregatedProfile]);

  const sajuAnalysis = useMemo(() => {
    if (!profile.birthDate) return null;
    const birthDate = new Date(profile.birthDate);
    const gender = profile.gender || "female";
    const result = calculateSaju(birthDate, false, gender);
    return analyzeSaju(result);
  }, [profile.birthDate, profile.gender]);

  const universalProfile: null | UniversalProfile = useMemo(() => {
    if (!profile.birthDate) return null;
    try {
      return calculateUniversalCorrelation({
        birthDate: new Date(profile.birthDate),
        birthTime: profile.birthTime
          ? {
              hour: parseInt(profile.birthTime.split(":")[0]),
              minute: parseInt(profile.birthTime.split(":")[1]),
            }
          : undefined,
        bloodType: profile.bloodType as "A" | "AB" | "B" | "O" | undefined,
        fullName: profile.name || undefined,
        gender: profile.gender || "female",
      });
    } catch (e) {
      return null;
    }
  }, [profile]);

  // Derived Biorhythm Data: Yesterday (-1) to Today + 30
  const biorhythmData = useMemo(() => {
    if (!profile.birthDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 30);

    return calculateBiorhythmRange(
      new Date(profile.birthDate),
      yesterday,
      nextMonth,
    );
  }, [profile.birthDate]);

  // Derived Akashic Data
  const akashicData = useMemo(
    () => extractAkashicData(universalProfile, locale),
    [universalProfile, locale],
  );

  // Derived Lucky Days (Biorhythm Peaks > 80%)
  const luckyDays = useMemo(() => {
    if (!biorhythmData) return [];
    return biorhythmData
      .filter((d) => (d.physical + d.emotional + d.intellectual) / 3 > 80)
      .slice(0, 3)
      .map((d) => ({
        date: d.date,
        score: Math.round((d.physical + d.emotional + d.intellectual) / 3),
      }));
  }, [biorhythmData]);

  // --- DATA ACCESS & SAFETY ---
  const { mbti, saju, status } = useOntologySelectors(aggregatedProfile);

  const sajuData = saju.data;
  const dayMasterEnum = saju.dayMaster;

  const dayMaster = dayMasterEnum
    ? tSaju(`stems.${dayMasterEnum.toLowerCase()}.name`)
    : t("labels.undiscovered");

  const mbtiType =
    aggregatedProfile?.branches.mbti?.type || t("labels.undiscovered");

  // Chosun Faction Analysis
  const chosunAnalysis = useMemo(() => {
    if (!universalProfile) return null;
    return analyzeChosunFaction(universalProfile, mbtiType);
  }, [universalProfile, mbtiType]);

  // Generic Factions (Economic & Political)
  const userMonth = profile.birthDate
    ? new Date(profile.birthDate).getMonth() + 1
    : 1;
  const userElement =
    universalProfile?.sajuAnalysis?.dominantElement || "earth";
  const { economicSchool, politicalTendency } = useOntologySynthesis(
    userMonth,
    userElement.toUpperCase(),
    mbtiType !== t("labels.undiscovered") ? mbtiType : undefined,
  );
  // 사용자가 출생정보(사주/월·오행의 근거)를 넣지 않으면 month=1·element=earth 같은
  // 가짜 기본값으로 고전학파·보수주의가 강제로 산출된다. 실제 입력이 있을 때만 노출한다.
  const hasOntologyInput = !!profile.birthDate;

  // --- REGISTRY-DRIVEN TESTS ---
  // Using the centralized FEATURE_REGISTRY to populate the test catalog
  const availableTests = useMemo(() => {
    // Map IDs to specific icons (Lucide components)
    const testIcons: Record<string, any> = {
      abundance: Gem,
      big5: Activity,
      "cognitive-bias": Brain,
      consumption: Waves,
      country: Globe,
      "decision-making": Target,
      enneagram: Compass,
      hexaco: Shield,
      hsp: Waves,
      "learning-style": BookOpen,
      mbti: Brain,
      perfectionism: Target,
      resilience: Activity,
      riasec: Briefcase,
      saju: Star,
      tci: Zap,
      "value-harmonizer": Heart,
      vitality: Zap,
    };

    return FEATURE_REGISTRY.filter((f) => {
      // Exclude the ontology root itself to avoid recursion
      if (f.id === "ontology") return false;

      // Include if explicitly mapped to ontology, or generally relevant personality tests
      const isReleventDomain = f.domain === "ontology" || f.domain === "wisdom";
      const isTestLike =
        !f.path.includes("/dashboard") && !f.path.endsWith("/result"); // Basic heuristics

      return isReleventDomain && isTestLike;
    }).map((f) => {
      const IconComponent = testIcons[f.id] || Sparkles;
      return {
        color: f.color || "bg-slate-50 border-slate-200 text-slate-800", // Fallback color
        description: tc(`tests.${f.id}.description`),
        icon: (
          <IconComponent
            className={cn(
              "w-5 h-5",
              f.color ? `text-${f.color}-600` : "text-slate-600",
            )}
          />
        ),
        id: f.id,
        link: f.path,
        subtitle: tc(`tests.${f.id}.subtitle`),
        title: tc(`tests.${f.id}.title`),
      };
    });
  }, [tc]);

  const enneagramType =
    aggregatedProfile?.branches.enneagram?.primaryType || "";
  const enneagramWing = aggregatedProfile?.branches.enneagram?.wing || "";
  const riasecCode = aggregatedProfile?.branches.riasec?.hexagonCode || "";
  const riasecTitle = aggregatedProfile?.branches.riasec?.title?.[locale] || "";
  const humanDesignTypeKey = akashicData?.humanDesign?.type || "Projector";
  const humanDesignType = t(`humanDesign.types.${humanDesignTypeKey}`);
  const lifePathNumber = universalProfile?.numerology?.lifePath;
  const westernZodiac =
    universalProfile?.westernZodiac?.name?.[locale] || t("labels.undiscovered");
  const easternZodiac =
    universalProfile?.animalZodiac?.name?.[locale] || t("labels.undiscovered");

  // Readings removed in Phase 4

  if (!isMounted) return null;

  if (!isStable) {
    return (
      <div className="min-h-screen bg-[#f0f9f1] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <ResonanceMandalaLazy />
        </div>

        <div className="max-w-xl w-full text-center space-y-8 relative z-10">
          <div className="w-24 h-24 bg-green-900 text-white rounded-[2.5rem] flex items-center justify-center font-serif text-4xl font-bold mx-auto shadow-2xl animate-pulse">
            O
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-serif font-black text-[#064e3b] tracking-tighter uppercase leading-tight">
              Temporal Resonance <br />
              <span className="text-green-700/60 font-medium">Unstable</span>
            </h1>
            <p className="text-lg text-green-900/70 font-serif leading-relaxed">
              We are currently recalibrating the Akashic nodes to ensure perfect
              alignment with your destiny. The Ontology section is undergoing
              mystical refinement.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button
              className="w-full sm:w-auto bg-green-900 text-white hover:bg-green-800 h-14 px-10 rounded-2xl font-bold text-lg shadow-xl shadow-green-900/20 active:scale-95 transition-all"
              onClick={() => router.push(`/${locale}`)}
            >
              {t("returnToHome")}
            </Button>
            <Link
              className="text-green-700 font-bold hover:underline underline-offset-4"
              href={`/${locale}/contact`}
            >
              {t("contactSupport")}
            </Link>
          </div>

          <div className="pt-12 flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-bounce" />
            <span className="text-[10px] font-black text-green-900 uppercase tracking-[0.2em] ml-2">
              {t("syncingData")}
            </span>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 border-l border-t border-green-900/10 rounded-tl-[3rem]" />
        <div className="absolute bottom-10 right-10 w-32 h-32 border-r border-b border-green-900/10 rounded-br-[3rem]" />
      </div>
    );
  }

  const elements = (universalProfile?.sajuAnalysis?.elementalDistribution || {
    earth: 0,
    fire: 0,
    metal: 0,
    water: 0,
    wood: 0,
  }) as unknown as Record<string, number>;
  const luck = (universalProfile?.luckyAttributes || {}) as LuckyAttributes;

  // Safe access fallbacks for UI
  const luckyColors = [luck?.color || "white"];
  const luckyNumbers = [luck?.number || 0];
  const luckyFlowers = [luck?.flower || "—"];
  const luckyGemstones = [luck?.gemstone || "—"];
  const luckyDirections = [luck?.direction || "—"];
  const onomancy = universalProfile?.onomancy;
  const social = universalProfile?.social;
  const ziWei = universalProfile?.ziWei;
  const vedic = universalProfile?.vedic;
  const kabbalah = universalProfile?.kabbalah;
  const mythos = universalProfile?.mythos;
  const hellenistic = universalProfile?.hellenistic;

  return (
    <DailyInsightProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 relative selection:bg-green-500/20">
        <div className="max-w-4xl mx-auto px-4 pt-24 pb-12 relative">
          <header className="text-center mb-12 relative z-10">
            <div className="w-16 h-16 bg-white rounded-full mx-auto mb-6 flex items-center justify-center font-black text-2xl font-serif shadow-xl border border-slate-100">
              <Fingerprint className="w-8 h-8 text-green-900" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tight text-slate-900 mb-2">
              {t("title")}
            </h1>
            <p className="text-slate-600 font-mono text-xs uppercase tracking-widest">
              ID: {profile.name || t("guest")} •{" "}
              {profile.birthDate || t("labels.undiscovered")}
            </p>
          </header>

          {/* --- TOP SECTION: CALIBRATION (Mobile First Drawer) --- */}
          <div className="mb-16 relative z-30 flex justify-center">
            {!isInitialized ? (
              <SajuInputForm />
            ) : (
              <Drawer onOpenChange={setShowInput} open={showInput}>
                <DrawerTrigger asChild>
                  <button className="w-full max-w-xs mx-auto py-3 px-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between text-sm font-bold text-slate-600 hover:text-green-700 transition-all mb-4">
                    <div className="flex items-center gap-3">
                      <Fingerprint className="w-4 h-4" />
                      <span>{t("calibration")}</span>
                    </div>
                    <span className="text-[10px] tracking-widest uppercase opacity-80">
                      {t("changeOrigin")}
                    </span>
                  </button>
                </DrawerTrigger>
                <DrawerContent className="rounded-t-[40px] border-slate-200/60 shadow-2xl">
                  <DrawerHeader className="text-left hidden">
                    <DrawerTitle>Calibration</DrawerTitle>
                    <DrawerDescription>
                      Update your origin data.
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="p-8 sm:p-12 pb-24 max-h-[85vh] overflow-y-auto w-full max-w-xl mx-auto hide-scrollbar">
                    <SajuInputForm
                      onSaved={() => setShowInput(false)}
                      variant="drawer"
                    />
                  </div>
                </DrawerContent>
              </Drawer>
            )}
          </div>

          <div className="max-w-4xl mx-auto mb-16 relative z-30">
            <DailyOracleCard />
          </div>

          <div className="absolute left-1/2 top-[500px] bottom-0 w-px bg-slate-200 -translate-x-1/2 hidden md:block opacity-50" />

          {/* --- BENTO GRID SECTIONS --- */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 auto-rows-[minmax(180px,auto)] gap-4 relative z-10 px-0 md:px-0">
            {/* 1. Chosun Dynasty Faction [New Feature] — 출생정보 입력 시에만 */}
            {hasOntologyInput && chosunAnalysis && (
              <FactionCard
                analysis={chosunAnalysis}
                className="md:col-span-2 lg:col-span-2 md:row-span-3 border-green-100 bg-green-50/10 shadow-green-900/5 group"
              />
            )}

            {/* 1.5 Generic Factions — 가짜 기본값 방지: 입력 있을 때만 */}
            {hasOntologyInput && economicSchool && (
              <GenericFactionCard
                analysis={economicSchool}
                className="md:col-span-2 lg:col-span-2 md:row-span-3 border-indigo-100 bg-indigo-50/10 shadow-indigo-900/5 group"
                icon={Briefcase}
                subtitle={tUi("ontology.economicSchoolSubtitle")}
                title={tUi("ontology.economicSchool")}
                type="economic"
              />
            )}

            {hasOntologyInput && politicalTendency && (
              <GenericFactionCard
                analysis={politicalTendency}
                className="md:col-span-2 lg:col-span-2 md:row-span-3 border-rose-100 bg-rose-50/10 shadow-rose-900/5 group"
                icon={Scale}
                subtitle={tUi("ontology.realpolitik")}
                title={tUi("ontology.politicalMatrix")}
                type="political"
              />
            )}

            {/* 입력 전 — 해금 안내 (가짜 기본값 대신) */}
            {!hasOntologyInput && (
              <div className="md:col-span-4 lg:col-span-6 rounded-[28px] border border-dashed border-slate-300 bg-slate-50/60 p-8 text-center">
                <p className="text-sm font-bold text-slate-700">🔒 {t("labels.undiscovered")}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {locale === "ko"
                    ? "출생 정보·성격 테스트를 입력하면 경제관·정치성향·역사 붕당 분석이 해금됩니다. (입력 전에는 기본값을 보여주지 않습니다)"
                    : "Enter your birth info and personality tests to unlock economic, political, and faction analysis. No placeholder defaults are shown."}
                </p>
              </div>
            )}

            {/* 2. Today's Insight (Moved into Bento) */}
            <div className="md:col-span-2 lg:col-span-2 md:row-span-3 flex flex-col items-center h-full relative z-10 w-full group">
              <div className="w-full h-full bg-gradient-to-br from-green-50 to-blue-50 rounded-[40px] p-8 border border-white shadow-xl relative overflow-hidden flex flex-col justify-center">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                  <Quote className="w-48 h-48" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-green-900/50">
                        {t("todayInsight.title")}
                      </h3>
                      <p className="text-lg font-serif font-black text-slate-900">
                        {t("todayInsight.soulOracle")}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter leading-tight">
                      {universalProfile?.oracleInsight?.[locale]?.title ||
                        t("todayInsight.innerResonance")}
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      {universalProfile?.oracleInsight?.[locale]?.content ||
                        t("todayInsight.manifestMore")}
                    </p>
                  </div>

                  {/* Migrated to blog.oiyo.net
                  <Link
                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-700 hover:text-green-800 transition-colors"
                    href={ROUTES.WISDOM}
                  >
                    <span>{t("readingsLink")}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                  */}
                </div>
              </div>
            </div>

            {/* 3. Biorhythm (Vitality Graph) */}
            {biorhythmData && (
              <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl p-8 hover:shadow-2xl transition-all md:col-span-4 lg:col-span-4 md:row-span-2 flex flex-col justify-between group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center">
                    <Activity className="w-5 h-5 text-rose-500" />
                  </div>
                  <h3 className="font-serif text-xl font-black">
                    {t("cards.vitality.title")}
                  </h3>
                </div>
                <div className="flex-1 min-h-[140px]">
                  <BiorhythmChart data={biorhythmData} />
                </div>
              </div>
            )}

            {/* 4. Harmonic Tuning */}
            <OntologyCard
              className="bg-white border-slate-100 shadow-lg md:col-span-2 lg:col-span-2 md:row-span-2"
              colorTheme="rose"
              deepInsightSlug="stoicism-memento-mori-life-wisdom"
              description={t("cards.resonance.description")}
              dialogContent={
                <TuningDialogContent
                  luck={luck}
                  luckyDays={luckyDays}
                  mythos={universalProfile?.mythos}
                />
              }
              icon={Sparkles}
              subtitle={t("resonanceTitle")}
              title={t("cards.resonance.subtitle")}
            >
              <div className="flex gap-3">
                <div
                  className="w-10 h-10 rounded-2xl border shadow-inner"
                  style={{
                    backgroundColor: luckyColors[0]?.toLowerCase() || "#FCD34D",
                  }}
                />
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black">
                  {luckyNumbers[0]}
                </div>
              </div>
            </OntologyCard>

            {/* 5. Innate Nature (Day Master) */}
            <OntologyCard
              className="bg-white border-slate-100 shadow-lg md:col-span-3 lg:col-span-3 md:row-span-1"
              colorTheme="green"
              description={t("cards.foundation.description")}
              dialogContent={
                <SajuDialogContent
                  data={sajuData || { dayMaster: dayMasterEnum }}
                />
              }
              icon={Star}
              subtitle={t("cards.foundation.subtitle")}
              title={dayMaster}
            >
              <div className="text-4xl font-black font-serif text-green-900">
                {dayMaster}
              </div>
            </OntologyCard>

            {/* 6. Elemental Balance */}
            <OntologyCard
              className="bg-white border-slate-100 shadow-lg md:col-span-3 lg:col-span-3 md:row-span-1"
              colorTheme="amber"
              description={t("cards.elemental.description")}
              dialogContent={<ElementsDialogContent elements={elements} />}
              icon={Zap}
              subtitle={t("cards.elemental.subtitle")}
              title={t("cards.elemental.title")}
            >
              <div className="flex justify-start gap-2 h-16 items-end w-full">
                {Object.entries(elements).map(([el, val]: [string, any]) => {
                  const colors: Record<string, string> = {
                    earth: "bg-amber-500",
                    fire: "bg-rose-500",
                    metal: "bg-slate-400",
                    water: "bg-indigo-600",
                    wood: "bg-green-500",
                  };
                  return (
                    <div
                      className="flex-1 max-w-[24px] bg-slate-100 rounded-t-lg relative group/bar overflow-hidden"
                      key={el}
                      style={{ height: `100%` }}
                    >
                      <div
                        className={cn(
                          "absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-1000",
                          colors[el.toLowerCase()] || "bg-amber-500",
                        )}
                        style={{ height: `${val}%` }}
                      />
                    </div>
                  );
                })}
              </div>
            </OntologyCard>

            {/* 7. Onomancy */}
            <OntologyCard
              className="bg-white border-slate-100 shadow-lg md:col-span-2 lg:col-span-2 md:row-span-1"
              colorTheme="blue"
              deepInsightSlug="hermeticism-seven-universal-laws"
              description={t("cards.onomancy.description")}
              dialogContent={
                <SimpleDataDialog
                  items={[
                    {
                      label: t("labels.meaning"),
                      value: String(
                        onomancy?.narrative?.[locale] ||
                          t("labels.undiscovered"),
                      ),
                    },
                    {
                      label: t("labels.element"),
                      value: onomancy?.elementsFound?.[0]
                        ? t(`elements.${onomancy.elementsFound[0]}`)
                        : t("labels.undiscovered"),
                    },
                  ]}
                  subtitle={t("labels.nameVibration")}
                  title={t("cards.onomancy.subtitle")}
                />
              }
              icon={Waves}
              subtitle={t("cards.onomancy.subtitle")}
              title={t("cards.onomancy.subtitle")}
            >
              <div className="text-3xl font-black text-blue-900 uppercase">
                {onomancy?.elementsFound?.[0]
                  ? t(`elements.${onomancy.elementsFound[0]}`)
                  : "—"}
              </div>
            </OntologyCard>

            {/* 8. MBTI (Cognition) */}
            <OntologyCard
              className="bg-white border-slate-100 shadow-lg md:col-span-2 lg:col-span-2 md:row-span-1"
              colorTheme="green"
              deepInsightSlug="flow-state-optimal-experience-psychology"
              description={t("cards.cognition.description")}
              dialogContent={<MBTIDialogContent type={mbtiType} />}
              icon={Brain}
              subtitle={t("cards.cognition.subtitle")}
              title={mbtiType}
            >
              <div className="text-4xl font-black text-blue-900">
                {mbtiType}
              </div>
            </OntologyCard>

            {/* 9. RIASEC */}
            <OntologyCard
              className="bg-white border-slate-100 shadow-lg md:col-span-2 lg:col-span-2 md:row-span-1"
              colorTheme="cyan"
              description={t("cards.vocation.description")}
              dialogContent={
                <RiasecDialogContent code={riasecCode} title={riasecTitle} />
              }
              icon={Briefcase}
              subtitle={t("cards.vocation.subtitle")}
              title={riasecCode || t("labels.undiscovered")}
            >
              <div className="text-4xl font-black text-cyan-900 tracking-[0.1em]">
                {riasecCode}
              </div>
            </OntologyCard>

            {/* 10. Numerology */}
            <OntologyCard
              className="bg-white border-slate-100 shadow-lg md:col-span-2 md:row-span-1"
              colorTheme="green"
              description={t("cards.destiny.description")}
              dialogContent={
                <NumerologyDialogContent number={String(lifePathNumber)} />
              }
              icon={Map}
              subtitle={t("cards.destiny.subtitle")}
              title={t("cards.destiny.subtitle")}
            >
              <div className="text-4xl font-black text-green-900/80">
                {lifePathNumber}
              </div>
            </OntologyCard>

            {/* 11. Western Zodiac */}
            <OntologyCard
              className="bg-white border-slate-100 shadow-lg md:col-span-2 md:row-span-1"
              colorTheme="indigo"
              description={t("labels.westernZodiac")}
              dialogContent={
                <SimpleDataDialog
                  items={[]}
                  subtitle={westernZodiac}
                  title={t("labels.sign")}
                />
              }
              icon={Star}
              subtitle={t("labels.observation")}
              title={westernZodiac}
            >
              <div className="text-2xl font-black text-indigo-900">
                {westernZodiac}
              </div>
            </OntologyCard>

            {/* 12. Eastern Zodiac (Animal) */}
            <OntologyCard
              className="bg-white border-slate-100 shadow-lg md:col-span-2 md:row-span-1"
              colorTheme="amber"
              description={t("labels.easternZodiac")}
              dialogContent={
                <SimpleDataDialog
                  items={[]}
                  subtitle={easternZodiac}
                  title={t("labels.animal")}
                />
              }
              icon={Activity}
              subtitle={t("labels.dominion")}
              title={easternZodiac}
            >
              <div className="text-2xl font-black text-orange-900">
                {easternZodiac}
              </div>
            </OntologyCard>
          </div>

          {/* --- SECTION 6: TEST ARCHITECTURE (기능별 목록) --- */}
          <section className="mt-40 pt-20 border-t border-slate-200/50">
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl font-black mb-2">
                {t("sections.testArchitecture.title")}
              </h2>
              <p className="text-slate-600 text-xs font-mono uppercase tracking-widest">
                {t("sections.testArchitecture.description")}
              </p>
            </div>
            <TestSelection
              availableTests={availableTests}
              results={aggregatedProfile}
            />
          </section>

          {/* --- SECTION 7: EMOTIONAL RESONANCE (감정의 공명) --- */}
          <section className="mt-40 pt-20 border-t border-slate-200/50">
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl font-black mb-2">
                {t("sections.emotionalResonance.title")}
              </h2>
              <p className="text-slate-600 text-xs font-mono uppercase tracking-widest">
                {t("sections.emotionalResonance.description")}
              </p>
            </div>
            <MoodCalendarGrid locale={locale} />
          </section>

          {/* Guidance / Pathfinder Section (New) */}
          {aggregatedProfile && <GuidanceSection profile={aggregatedProfile} />}

          {/* Akashic Record Final Section */}
          <section className="mt-40 pt-20 border-t border-slate-200/50">
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl font-black mb-2">
                {t("sections.grandArchives.title")}
              </h2>
              <p className="text-slate-600 text-xs font-mono uppercase tracking-widest">
                {t("sections.grandArchives.description")}
              </p>
            </div>
            <AkashicRecord locale={locale} profile={universalProfile} />
          </section>
        </div>
      </div>
    </DailyInsightProvider>
  );
}

// --- Dialog Content Components (Enhanced Aesthetics) ---

function ElementsDialogContent({
  elements,
}: {
  elements: Record<string, number>;
}) {
  const t = useNamespacedFallback("ontology.dashboard", "dashboard");

  const elementColors: Record<string, string> = {
    earth: "bg-amber-500",
    fire: "bg-rose-500",
    metal: "bg-slate-400",
    water: "bg-indigo-600",
    wood: "bg-green-500",
  };

  const elementBgHover: Record<string, string> = {
    earth: "hover:bg-amber-50",
    fire: "hover:bg-rose-50",
    metal: "hover:bg-slate-50",
    water: "hover:bg-indigo-50",
    wood: "hover:bg-green-50",
  };

  return (
    <div className="space-y-8 text-slate-900 pb-12">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
          <Zap className="w-6 h-6 text-amber-600" />
        </div>
        <h3 className="text-2xl font-black">{t("dialogs.elements.title")}</h3>
      </div>
      <div className="space-y-6">
        {Object.entries(elements).map(([el, val]) => (
          <div
            className={cn(
              "space-y-2 p-3 rounded-2xl transition-colors",
              elementBgHover[el.toLowerCase()] || "hover:bg-slate-50",
            )}
            key={el}
          >
            <div className="flex justify-between text-xs font-black uppercase tracking-widest">
              <span>{el}</span>
              <span className="font-mono">{val}%</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  elementColors[el.toLowerCase()] || "bg-slate-500",
                )}
                style={{ width: `${val}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EnneagramDialogContent({
  type,
  wing,
}: {
  type: number | string;
  wing: number | string;
}) {
  const t = useNamespacedFallback("ontology.dashboard", "dashboard");
  return (
    <div className="space-y-8 text-slate-900 pb-12">
      <h3 className="text-6xl font-black tracking-tighter">
        {t("labels.typeLabel", { type })}{" "}
        <span className="text-3xl text-slate-300">
          {t("labels.wingLabel", { wing })}
        </span>
      </h3>
      <div className="p-8 bg-purple-50 rounded-[40px] border border-purple-100 text-purple-900/80 leading-relaxed text-lg">
        {t("dialogs.enneagram.quote", { type })}
      </div>
    </div>
  );
}

function HDDialogContent({ type }: { type: string }) {
  const t = useNamespacedFallback("ontology.dashboard", "dashboard");
  return (
    <div className="space-y-8 text-slate-900 pb-12">
      <div className="w-16 h-16 bg-green-50 rounded-[20px] flex items-center justify-center mb-4">
        <Fingerprint className="w-8 h-8 text-green-700" />
      </div>
      <h3 className="text-4xl font-black tracking-tight">{type}</h3>
      <p className="text-xl leading-relaxed opacity-80">
        {t("dialogs.humanDesign.description", { type })}
      </p>
    </div>
  );
}

function MBTIDialogContent({ type }: { type: string }) {
  const t = useNamespacedFallback("ontology.dashboard", "dashboard");
  return (
    <div className="space-y-8 text-slate-900 pb-12">
      <h3 className="text-6xl font-black tracking-tighter">{type}</h3>
      <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 leading-relaxed opacity-80 text-lg">
        {t("dialogs.mbti.description", { type })}
      </div>
    </div>
  );
}

function NumerologyDialogContent({ number }: { number: string }) {
  const t = useNamespacedFallback("ontology.dashboard", "dashboard");
  return (
    <div className="space-y-8 text-slate-900 pb-12">
      <h3 className="text-6xl font-black text-green-900/10 absolute top-4 right-8 select-none">
        #{number}
      </h3>
      <h3 className="text-4xl font-black tracking-tight">
        {t("cards.destiny.subtitle")} {number}
      </h3>
      <p className="text-lg leading-relaxed opacity-70">
        {t("dialogs.numerology.description", { number })}
      </p>
    </div>
  );
}

function RiasecDialogContent({ code, title }: { code: string; title: string }) {
  const t = useNamespacedFallback("ontology.dashboard", "dashboard");
  return (
    <div className="space-y-8 text-slate-900 pb-12">
      <h3 className="text-4xl font-black tracking-widest">{code}</h3>
      <div className="text-sm font-black uppercase tracking-widest text-green-700 mb-6">
        {title}
      </div>
      <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 leading-relaxed opacity-80">
        {t("dialogs.riasec.description")}
      </div>
    </div>
  );
}

function SajuDialogContent({
  data,
}: {
  data: null | undefined | { dayMaster?: string };
}) {
  const t = useNamespacedFallback("ontology.dashboard", "dashboard");
  const tSaju = useTranslations("saju");

  const dayMasterEnum = data?.dayMaster;
  const stemKey = dayMasterEnum?.toLowerCase();

  // Mapping for polarity and element based on enum
  // In a real system, these would come from metadata, but here we derive for immediate UX fix
  const stem = dayMasterEnum
    ? tSaju(`stems.${stemKey}.name`)
    : t("labels.undiscovered");
  const meaning = dayMasterEnum ? tSaju(`stems.${stemKey}.meaning`) : "";
  const symbol = dayMasterEnum ? tSaju(`stems.${stemKey}.symbol`) : "";

  return (
    <div className="space-y-8 text-slate-900 pb-12">
      <div className="flex items-center gap-4 border-b border-slate-100 pb-8">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center shadow-inner">
          <Star className="w-8 h-8 text-green-700" />
        </div>
        <div>
          <h3 className="text-3xl font-serif font-black">{stem}</h3>
          <div className="text-xs font-bold text-green-700 uppercase tracking-widest">
            {t("dialogs.saju.label")}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-lg font-serif text-green-800">
          &quot;{symbol}&quot;
        </p>
        <p className="text-sm leading-relaxed opacity-80">
          {meaning}. {t("dialogs.saju.description")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
          <div className="text-[10px] uppercase font-black tracking-widest text-slate-600 mb-2">
            {t("dialogs.saju.polarity")}
          </div>
          <div className="text-xl font-black">
            {meaning.split(" ")[0] || t("labels.undiscovered")}
          </div>
        </div>
        <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
          <div className="text-[10px] uppercase font-black tracking-widest text-slate-600 mb-2">
            {t("dialogs.saju.element")}
          </div>
          <div className="text-xl font-black font-serif">
            {meaning.split(" ")[1] || t("labels.undiscovered")}
          </div>
        </div>
      </div>
    </div>
  );
}

function SimpleDataDialog({
  items,
  subtitle,
  title,
}: {
  items: { label: string; value: string }[];
  subtitle: string;
  title: string;
}) {
  const t = useNamespacedFallback("ontology.dashboard", "dashboard");
  return (
    <div className="space-y-8 text-slate-900 pb-12">
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2 font-mono">
          {t("dialogs.archiveEntry")}
        </div>
        <h3 className="text-4xl font-black tracking-tight mb-1">{title}</h3>
        <div className="text-green-700 font-bold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          {subtitle}
        </div>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100"
            key={item.label}
          >
            <span className="text-xs font-black uppercase text-slate-600 tracking-widest font-mono">
              {item.label}
            </span>
            <span className="font-black text-sm">{item.value}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest justify-center pt-8 border-t border-slate-100">
        <Shield className="w-3 h-3" />
        <span>{t("dialogs.recordVerified")}</span>
      </div>
    </div>
  );
}

function TuningDialogContent({
  luck,
  luckyDays,
  mythos,
}: {
  luck: LuckData | null | undefined;
  luckyDays?: Array<{ date: Date; score: number }>;
  mythos: MythosData | null | undefined;
}) {
  const locale = useLocale();
  const t = useNamespacedFallback("ontology.dashboard", "dashboard");
  const luckyColor = luck?.color || luck?.colors?.[0] || "white";
  const luckyNumber = luck?.number || luck?.numbers?.[0] || 0;
  const luckyFlower = luck?.flower || luck?.flowers?.[0] || "sunflower";
  const luckyGemstone = luck?.gemstone || luck?.gemstones?.[0] || "topaz";
  const luckyDirection = luck?.direction || luck?.directions?.[0] || "center";

  const items = [
    {
      icon: (
        <div
          className="w-5 h-5 rounded-full border shadow-sm"
          style={{ backgroundColor: String(luckyColor).toLowerCase() }}
        />
      ),
      label: t("dialogs.tuning.color"),
      value: t(`lucky.color.${luckyColor}`),
    },
    {
      icon: <Hash className="w-5 h-5" />,
      label: t("dialogs.tuning.number"),
      value: String(luckyNumber),
    },
    {
      icon: <Compass className="w-5 h-5" />,
      label: t("dialogs.tuning.direction"),
      value: t(`lucky.direction.${luckyDirection}`),
    },
    {
      icon: <Flower2 className="w-5 h-5" />,
      label: t("dialogs.tuning.flower"),
      value:
        mythos?.birthflower?.name?.[locale] || t(`lucky.flower.${luckyFlower}`),
    },
    {
      icon: <Gem className="w-5 h-5" />,
      label: t("dialogs.tuning.gemstone"),
      value:
        mythos?.birthstone?.name?.[locale] ||
        t(`lucky.gemstone.${luckyGemstone}`),
    },
    {
      icon: <Star className="w-5 h-5 text-amber-400" />,
      label: t("dialogs.tuning.luckyStar"),
      value: mythos?.symbols?.star?.name?.[locale] || "—",
    },
  ];

  return (
    <div className="space-y-8 text-slate-900 pb-12">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-rose-600" />
        </div>
        <h3 className="text-2xl font-black">{t("dialogs.tuning.title")}</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 hover:border-rose-200 transition-colors"
            key={item.label}
          >
            <div className="flex items-center gap-2 mb-3 text-slate-600">
              {item.icon}
              <span className="text-[10px] font-black uppercase tracking-widest">
                {item.label}
              </span>
            </div>
            <div className="text-xl font-black">{item.value}</div>
          </div>
        ))}
      </div>

      {luckyDays && luckyDays.length > 0 && (
        <div className="mt-8 p-8 bg-green-50 rounded-[40px] border border-green-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Zap className="w-12 h-12 text-green-900" />
          </div>
          <div className="flex items-center gap-2 mb-4 text-green-900">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest">
              {t("dialogs.tuning.favorableDays")}
            </span>
          </div>
          <div className="space-y-3">
            {luckyDays.map((d) => {
              const dateObj = new Date(d.date);
              const formattedDate = dateObj.toLocaleDateString(locale, {
                day: "numeric",
                month: "short",
                weekday: "short",
              });
              return (
                <div
                  className="flex justify-between items-center text-green-900/80"
                  key={
                    d.date instanceof Date
                      ? d.date.toISOString()
                      : String(d.date)
                  }
                >
                  <span className="font-bold">{formattedDate}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 bg-green-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600"
                        style={{ width: `${d.score}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-black bg-white px-2 py-1 rounded-lg border border-green-100">
                      {d.score}% {t("dialogs.tuning.synergy")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ZiWeiDialogContent({
  data,
}: {
  data:
    | null
    | undefined
    | {
        bureau?: { id?: string };
        palaces?: Array<{
          id: string;
          stars: Array<{ id: string; quality?: string }>;
        }>;
      };
}) {
  const locale = useLocale();
  const t = useNamespacedFallback("ontology.dashboard", "dashboard");

  if (!data || !data.palaces) {
    return (
      <div className="p-8 text-center text-slate-600 italic">
        {t("labels.undiscovered")}
      </div>
    );
  }

  const lifePalace = data.palaces.find((p) => p.id === "life");
  const bureau = data.bureau;

  return (
    <div className="space-y-8 text-slate-900 pb-12">
      <div className="flex items-center gap-4 border-b border-slate-100 pb-8">
        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center shadow-inner">
          <Database className="w-8 h-8 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-3xl font-serif font-black">
            {t("systems.ziwei")}
          </h3>
          <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
            {t("dialogs.archiveEntry")}
          </div>
        </div>
      </div>

      {/* Bureau Info */}
      <div className="p-8 bg-indigo-50 rounded-[40px] border border-indigo-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Star className="w-24 h-24 text-indigo-900" />
        </div>
        <div className="relative z-10">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-800/60 mb-3">
            {t("labels.bureau")}
          </h4>
          <p className="text-lg text-indigo-900/80 leading-relaxed font-medium">
            {(
              BUREAU_NARRATIVES[bureau?.id?.toLowerCase() ?? ""] as
                | Record<string, string>
                | undefined
            )?.[locale] ||
              BUREAU_NARRATIVES[bureau?.id?.toLowerCase() ?? ""]?.en ||
              t("labels.undiscovered")}
          </p>
        </div>
      </div>

      {/* Life Palace Stars */}
      <div className="space-y-6">
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-600">
          {(PALACE_NARRATIVES.life as Record<string, string>)?.[locale] ||
            PALACE_NARRATIVES.life.en}
        </h4>

        <div className="grid grid-cols-1 gap-4">
          {lifePalace?.stars.map((star) => {
            const narrative =
              (
                MAIN_STAR_NARRATIVES[star.id] as
                  | Record<string, string>
                  | undefined
              )?.[locale] || MAIN_STAR_NARRATIVES[star.id]?.en;

            if (!narrative) return null;

            return (
              <div
                className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex flex-col gap-2"
                key={star.id}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-indigo-900">
                    {star.id
                      .split("_")
                      .map(
                        (s: string) => s.charAt(0).toUpperCase() + s.slice(1),
                      )
                      .join(" ")}
                  </span>
                  <span className="text-[10px] font-black uppercase bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                    {star.quality || "Star"}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {narrative}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest justify-center pt-8 border-t border-slate-100">
        <Shield className="w-3 h-3" />
        <span>{t("dialogs.recordVerified")}</span>
      </div>
    </div>
  );
}
