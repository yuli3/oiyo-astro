"use client";

import { m } from "framer-motion";
import {
  ArrowLeft,
  Compass,
  Download,
  Link2,
  Share2,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React from "react";

import { AIStreamingOracle } from "@/components/ui/AIStreamingOracle";
import { Button } from "@/components/ui/button";
import { generateArtifactPDF } from "@/lib/ontology/primal-origin/export-engine";

import type { TotalResonance } from "../types";
import { ResonanceArtifactTemplate } from "./ResonanceArtifactTemplate";
import { ResonanceDetails, ResonanceMap } from "./ResonanceMap";

interface ResonanceResultDisplayProps {
  onReset: () => void;
  result: TotalResonance;
}

export function ResonanceResultDisplay({
  onReset,
  result,
}: ResonanceResultDisplayProps) {
  const locale = useLocale();
  const t = useTranslations("resonance");
  const ts = useTranslations("synergy");

  const commonT = useTranslations("common");

  const getLoc = (obj: any) => obj?.[locale] || obj?.en || "";

  const handleDownloadPDF = async () => {
    try {
      console.log("Generating artifact PDF...");
      await generateArtifactPDF(
        "resonance-artifact-target",
        `OIYO_Resonance_${result.totalScore}`,
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="fixed inset-0 z-[50] bg-[#f0f9f1] overflow-y-auto snap-y snap-mandatory no-scrollbar scroll-smooth">
      {/* 1. Global Score & Radar */}
      <section className="min-h-screen snap-start flex items-center justify-center p-6 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full max-w-6xl">
          <div className="space-y-12 text-center lg:text-left">
            <m.div
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-green-100 border border-green-200 text-green-700 text-sm font-black tracking-widest uppercase font-sans"
              initial={{ opacity: 0, y: 20 }}
            >
              <Sparkles className="w-4 h-4" />
              {commonT("celestial.oracle")}
            </m.div>

            <div className="space-y-6">
              <h2 className="text-6xl md:text-9xl font-black text-[#064e3b] leading-none tracking-tighter font-serif italic">
                {result.totalScore}%{" "}
                <span className="text-green-500">Union</span>
              </h2>
              <p className="text-2xl md:text-3xl text-green-800 font-sans font-light leading-relaxed max-w-xl">
                {getLoc(result.synthesis.description)}
              </p>
            </div>

            <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
              <Button
                className="h-14 rounded-full border-green-200 text-green-900 hover:bg-surface-subtle gap-2 px-8 font-sans"
                onClick={onReset}
                variant="outline"
              >
                <ArrowLeft className="w-4 h-4" /> {t("backButton")}
              </Button>
              <Button
                className="h-14 rounded-full bg-[#064e3b] text-white hover:bg-green-800 gap-2 font-black px-12 text-lg font-sans"
                onClick={handleCopyLink}
              >
                <Share2 className="w-4 h-4" /> {t("shareButton")}
              </Button>
            </div>
          </div>

          <m.div
            animate={{ opacity: 1, scale: 1 }}
            className="relative scale-110"
            initial={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <ResonanceMap dimensions={result.dimensions} />
          </m.div>
        </div>
      </section>

      {/* Narrative Section (Gemini) */}
      {result.resonanceNarrative && (
        <section className="min-h-screen snap-start flex items-center justify-center p-6 md:p-12">
          <m.div
            className="w-full max-w-4xl"
            initial={{ opacity: 0, scale: 0.9 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, scale: 1 }}
          >
            <AIStreamingOracle
              className="bg-white/60 border-white/60 backdrop-blur-3xl shadow-xl shadow-green-900/5 text-[#064e3b]"
              text={getLoc(result.resonanceNarrative)}
              title={t("oracleTitle")}
            />
          </m.div>
        </section>
      )}

      {/* 2. Dimensional Deep Dive */}
      <section className="min-h-screen snap-start flex items-center justify-center p-6 md:p-12 bg-green-50/50">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 w-full max-w-7xl">
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-4">
              <h3 className="text-sm font-black text-green-600 uppercase tracking-[0.5em] flex items-center gap-3 font-sans">
                <Compass className="w-4 h-4" /> {t("dimensionsTitle")}
              </h3>
              <h2 className="text-4xl font-black text-[#064e3b] font-serif italic pb-2 border-b border-green-200">
                {t("analysis.detailed")}
              </h2>
            </div>
            <div className="max-h-[60vh] overflow-y-auto pr-4 no-scrollbar">
              <ResonanceDetails dimensions={result.dimensions} />
            </div>
          </div>

          <div className="space-y-12">
            <div className="space-y-4">
              <h3 className="text-sm font-black text-amber-600 uppercase tracking-[0.5em] flex items-center gap-3 font-sans">
                <Zap className="w-4 h-4" /> {t("iching.title")}
              </h3>
              <h2 className="text-4xl font-black text-[#064e3b] font-serif italic">
                {t("iching.revelation")}
              </h2>
            </div>
            <div className="p-10 rounded-[3rem] bg-white/60 border border-amber-100 shadow-xl shadow-amber-900/5 relative overflow-hidden group min-h-[400px] flex flex-col justify-center">
              {result.iching && (
                <>
                  <div className="absolute top-0 right-0 p-12 text-amber-500/10 group-hover:text-amber-500/20 transition-colors">
                    <span className="text-[12rem] font-black leading-none">
                      {result.iching.hexagramNumber}
                    </span>
                  </div>

                  <div className="relative z-10 space-y-8 font-sans">
                    <div>
                      <h4 className="text-amber-600 font-black tracking-[0.3em] uppercase text-xs mb-2">
                        Hexagram {result.iching.hexagramNumber}
                      </h4>
                      <h3 className="text-5xl font-black text-[#064e3b] tracking-tighter font-serif italic">
                        {getLoc(result.iching.hexagramName)}
                      </h3>
                    </div>

                    <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-100 text-amber-800 text-lg italic shadow-sm">
                      {getLoc(result.iching.image)}
                    </div>

                    <p className="text-green-800/70 leading-relaxed text-lg font-light">
                      {getLoc(result.iching.judgment)}
                    </p>
                  </div>
                </>
              )}
            </div>

            {result.confidence < 70 && (
              <div className="p-8 rounded-3xl bg-amber-50 border border-amber-100 space-y-6 font-sans">
                <p className="text-amber-800 text-sm font-medium leading-relaxed italic">
                  &quot;{t("partialDataWarning")}&quot;
                </p>
                <Button
                  className="text-amber-700 p-0 h-auto font-black hover:text-amber-800 text-sm tracking-widest uppercase"
                  variant="link"
                >
                  {t("addMoreInfo")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Invitation & Export Ritual */}
      <section className="min-h-screen snap-start flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-4xl flex flex-col items-center text-center space-y-12">
          <div className="space-y-6">
            <h3 className="text-5xl md:text-7xl font-black text-[#064e3b] font-serif italic tracking-tighter">
              {t("cta.title")}
            </h3>
            <p className="text-2xl text-green-800 font-sans font-light max-w-2xl mx-auto leading-relaxed">
              {t("cta.subtitle")}
            </p>
          </div>

          <div className="flex flex-wrap gap-6 justify-center font-sans">
            <Button
              className="h-20 px-12 rounded-full bg-[#064e3b] hover:bg-green-800 text-white gap-4 font-black text-xl shadow-xl shadow-green-900/20"
              onClick={handleCopyLink}
            >
              <Link2 className="w-6 h-6" /> {t("cta.share")}
            </Button>
            <Button
              className="h-20 px-12 rounded-full border-green-200 text-green-900 hover:bg-surface-subtle gap-4 font-black text-xl"
              onClick={handleDownloadPDF}
              variant="outline"
            >
              <Download className="w-6 h-6" /> {t("cta.download")}
            </Button>
          </div>

          <div className="flex items-center gap-3 text-green-900/20 text-sm font-black uppercase tracking-[0.4em] font-sans">
            <Wand2 className="w-4 h-4" />
            Resonant Artifact Engine
          </div>
        </div>
      </section>

      {/* Hidden Print Target */}
      <div style={{ left: -9999, position: "absolute", top: -9999 }}>
        <div id="resonance-artifact-target">
          <ResonanceArtifactTemplate locale={locale as any} result={result} />
        </div>
      </div>
    </div>
  );
}
