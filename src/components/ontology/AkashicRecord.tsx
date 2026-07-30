"use client";

import { AnimatePresence, m } from "framer-motion";
import { Book, Compass, Dna, Fingerprint, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useMemo, useState } from "react";

import { extractAkashicData } from "@/lib/ontology/akashic/logic";
import type { UniversalProfile } from "@/lib/ontology/engine/types";

interface Props {
  locale?: string;
  profile?: null | UniversalProfile;
}

export function AkashicRecord({ locale = "ko", profile }: Props) {
  const t = useTranslations("akashic");
  const tU = useTranslations("universal");
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"biology" | "destiny" | "essence">(
    "essence",
  );

  // Extract data using logic helper
  const data = useMemo(
    () => extractAkashicData(profile, locale),
    [profile, locale],
  );

  return (
    <div className="relative py-20 flex justify-center">
      <AnimatePresence>
        {!isOpen ? (
          <div className="perspective-[1000px] group">
            <m.div
              className="w-64 h-80 bg-green-950 rounded-r-2xl rounded-l-md border-r-8 border-green-900 shadow-2xl cursor-pointer relative overflow-hidden transform-style-3d transition-all duration-500 ease-out group-hover:rotate-y-[-15deg] group-hover:rotate-x-[5deg] group-hover:shadow-[0_20px_50px_rgba(234,179,8,0.3)]"
              layoutId="book-cover"
              onClick={() => setIsOpen(true)}
              whileHover={{ scale: 1.05 }}
            >
              {/* Golden Glow Pulse */}
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/0 via-amber-500/0 to-amber-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Book Spine Effect */}
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-green-900 shadow-[inset_-2px_0_5px_rgba(0,0,0,0.3)] z-10" />

              {/* Cover Design */}
              <div className="absolute inset-4 left-8 border border-amber-500/30 rounded-lg flex flex-col items-center justify-center text-center bg-green-950/50 backdrop-blur-sm">
                <div className="p-4 rounded-full bg-green-500/10 mb-4 group-hover:scale-110 transition-transform relative">
                  <Book className="w-8 h-8 text-green-400" />
                  <div className="absolute inset-0 bg-amber-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-xl font-black text-green-100 font-serif tracking-widest mb-1 drop-shadow-lg">
                  {t("title")}
                </h3>
                <p className="text-[10px] text-amber-500 uppercase tracking-[0.3em] font-bold">
                  {t("subtitle")}
                </p>
              </div>

              {/* Texture Overlay */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-30 mix-blend-overlay pointer-events-none" />
            </m.div>
          </div>
        ) : (
          <m.div
            className="w-full max-w-4xl bg-[#f8f5f2] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] relative z-20"
            layoutId="book-cover"
          >
            {/* Left Panel (Navigation) */}
            <div className="w-full md:w-64 bg-green-950 text-white p-8 flex flex-col justify-between">
              <div>
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <Book className="w-6 h-6 text-green-400" />
                    <h3 className="font-black tracking-widest text-lg">
                      {t("title")}
                    </h3>
                  </div>
                  <p className="text-green-200/60 text-xs leading-relaxed pl-9">
                    {t("description")}
                  </p>
                </div>

                <nav className="space-y-2">
                  <button
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-all ${activeTab === "essence" ? "bg-green-500 text-white" : "text-green-100/60 hover:text-white hover:bg-white/5"}`}
                    onClick={() => setActiveTab("essence")}
                  >
                    <Fingerprint className="w-4 h-4" />
                    {t("tabs.essence")}
                  </button>
                  <button
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-all ${activeTab === "destiny" ? "bg-green-500 text-white" : "text-green-100/60 hover:text-white hover:bg-white/5"}`}
                    onClick={() => setActiveTab("destiny")}
                  >
                    <Compass className="w-4 h-4" />
                    {t("tabs.destiny")}
                  </button>
                  <button
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-all ${activeTab === "biology" ? "bg-green-500 text-white" : "text-green-100/60 hover:text-white hover:bg-white/5"}`}
                    onClick={() => setActiveTab("biology")}
                  >
                    <Dna className="w-4 h-4" />
                    {t("tabs.biology")}
                  </button>
                </nav>
              </div>

              <button
                className="px-4 py-2 border border-white/40 rounded-lg text-xs font-bold hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                {t("close")}
              </button>
            </div>

            {/* Right Panel (Content) */}
            <div className="flex-1 p-8 md:p-12 relative overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
              <AnimatePresence mode="wait">
                {activeTab === "essence" && (
                  <m.div
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                    exit={{ opacity: 0, x: -20 }}
                    initial={{ opacity: 0, x: 20 }}
                    key="essence"
                  >
                    <h2 className="text-4xl font-black text-green-900 font-serif mb-2">
                      {t("essence.title")}
                    </h2>
                    <p className="text-sm text-green-800/60 mb-6 italic">
                      &quot;{t("essence.quote")}&quot;
                    </p>

                    <div className="grid grid-cols-2 gap-8 pt-8">
                      <div>
                        <div className="text-xs font-black text-green-600/60 uppercase tracking-widest mb-1">
                          {t("essence.soulFormula")}
                        </div>
                        <div className="text-3xl font-black text-green-900">
                          {data.mbti || tU("labels.undiscovered")}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-black text-green-600/60 uppercase tracking-widest mb-1">
                          {t("essence.humanDesign")}
                        </div>
                        <div className="text-3xl font-black text-green-900">
                          {data.humanDesign.type || tU("labels.undiscovered")}
                        </div>
                        {data.humanDesign.authority && (
                          <div className="text-sm font-bold text-green-500">
                            {data.humanDesign.authority}{" "}
                            {t("essence.authority")}
                          </div>
                        )}
                      </div>
                    </div>
                  </m.div>
                )}

                {activeTab === "destiny" && (
                  <m.div
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                    exit={{ opacity: 0, x: -20 }}
                    initial={{ opacity: 0, x: 20 }}
                    key="destiny"
                  >
                    <h2 className="text-4xl font-black text-green-900 font-serif mb-2">
                      {t("destiny.title")}
                    </h2>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 bg-white border border-green-50 rounded-xl shadow-sm">
                        <div className="text-xs font-black text-green-600/60 uppercase tracking-widest mb-2">
                          {t("destiny.lifePath")}
                        </div>
                        <div className="text-5xl font-black text-green-950 flex items-start gap-2">
                          {data.numerology.lifePath > 0
                            ? data.numerology.lifePath
                            : "?"}
                          <Star className="w-5 h-5 text-green-400 mt-1" />
                        </div>
                        <p className="text-sm text-green-600 mt-2">
                          {t("destiny.seeker")}
                        </p>
                      </div>
                      <div className="p-6 bg-green-950 text-white rounded-xl shadow-sm">
                        <div className="text-xs font-black text-green-600/60 uppercase tracking-widest mb-2">
                          {t("destiny.animal")}
                        </div>
                        <div className="text-2xl font-black text-white mb-1">
                          {data.saju.animal || tU("labels.undiscovered")}
                        </div>
                      </div>
                    </div>
                  </m.div>
                )}

                {activeTab === "biology" && (
                  <m.div
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                    exit={{ opacity: 0, x: -20 }}
                    initial={{ opacity: 0, x: 20 }}
                    key="biology"
                  >
                    <h2 className="text-4xl font-black text-green-900 font-serif mb-2">
                      {t("biology.title")}
                    </h2>
                    <div className="space-y-8">
                      <div className="p-6 bg-white rounded-2xl border border-green-50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-green-800 text-sm uppercase tracking-widest">
                            {t("biology.chronotype")}
                          </span>
                          <span className="font-black text-2xl text-green-950">
                            {data.bio.chronotype}
                          </span>
                        </div>
                        <p className="text-xs text-green-800/60 leading-relaxed font-medium">
                          {data.bio.chronotype
                            ? tU(
                                `explanation.${data.bio.chronotype.toLowerCase() as any}`,
                              )
                            : t("essence.locked")}
                        </p>
                      </div>

                      <div className="p-6 bg-white rounded-2xl border border-green-50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-green-800 text-sm uppercase tracking-widest">
                            {t("biology.constitution")}
                          </span>
                          <span className="font-black text-2xl text-green-950">
                            {data.bio.constitution || tU("labels.undiscovered")}
                          </span>
                        </div>
                        <p className="text-xs text-green-800/60 leading-relaxed font-medium">
                          {data.bio.constitution
                            ? tU(
                                `explanation.${data.bio.constitution.toLowerCase() as any}`,
                              )
                            : t("essence.locked")}
                        </p>
                      </div>
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
