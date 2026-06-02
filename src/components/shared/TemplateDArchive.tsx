/* eslint-disable no-restricted-syntax */
"use client";

import { m } from "framer-motion";
import { ArrowDown, Book, ExternalLink, Quote } from "lucide-react";
import React from "react";

import { withErrorBoundary } from "@/components/shared/ErrorBoundary";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Locale } from "@/i18n";
import { ResonanceMandalaLazy } from "@/lib/system/lazy/dynamic-imports";

interface ArchiveItem {
  application?: { [key in Locale]?: string };
  auraColor?: string;
  explanation?: { [key in Locale]?: string };
  id: string;
  source?: { [key in Locale]?: string };
  tags?: string[];
  text: { [key in Locale]?: string };
  title?: { [key in Locale]?: string };
}

interface TemplateDArchiveProps {
  children?: React.ReactNode;
  headerSubtitle: string;
  headerTitle: string;
  items: ArchiveItem[];
  locale: Locale;
  themeColor?: string;
}

export const TemplateDArchive = withErrorBoundary(
  function TemplateDArchive({
    children,
    headerSubtitle,
    headerTitle,
    items,
    locale,
    themeColor = "#4F46E5",
  }: TemplateDArchiveProps) {
    return (
      <main
        aria-label={`Archive of ${headerTitle}`}
        className="h-dvh overflow-y-scroll snap-y snap-mandatory bg-[#f0f9f1] text-[#064e3b] no-scrollbar selection:bg-green-100"
      >
        {/* Header Section */}
        <section
          aria-label="Archive Entry Point"
          className="h-dvh snap-start flex flex-col items-center justify-center p-8 pb-safe relative overflow-hidden"
        >
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
            <ResonanceMandalaLazy
              styles={
                {
                  "--resonance-blur": "150px",
                  "--resonance-color": themeColor,
                } as any
              }
            />
          </div>
          <div className="relative z-10 text-center space-y-10">
            <Badge
              className="px-8 py-2 uppercase tracking-widest font-black bg-white/50 backdrop-blur-sm shadow-sm"
              style={{ borderColor: `${themeColor}44`, color: themeColor }}
              variant="outline"
            >
              The Imperial Archive
            </Badge>
            <div className="space-y-4">
              <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase leading-none drop-shadow-sm text-[#064e3b]">
                {headerTitle}
              </h1>
              <p className="max-w-xl mx-auto text-xl md:text-2xl text-green-800 font-sans font-light leading-relaxed">
                {headerSubtitle}
              </p>
            </div>
            <m.div
              animate={{ y: [0, 10, 0] }}
              className="pt-12 text-green-900/20"
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ArrowDown className="w-8 h-8" />
            </m.div>
          </div>
        </section>

        {/* Content Sections */}
        {items.map((item, idx) => (
          <section
            aria-label={`Archive Fragment ${idx + 1}`}
            className="h-dvh snap-start flex items-center justify-center p-6 md:p-12 pb-safe relative overflow-hidden"
            id={item.id}
            key={item.id}
          >
            {/* Background Subtle Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-green-50/50 pointer-events-none" />

            <div className="absolute top-12 left-12 text-green-900/5 text-9xl font-black select-none pointer-events-none">
              {(idx + 1).toString().padStart(2, "0")}
            </div>

            <article className="max-w-4xl w-full bg-white/60 border border-white/60 p-10 md:p-20 rounded-[3rem] backdrop-blur-3xl shadow-xl shadow-green-900/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Quote className="w-32 h-32 text-green-900" />
              </div>

              <div className="space-y-12 relative z-10">
                <div className="space-y-6">
                  <div className="flex gap-2">
                    {item.tags?.slice(0, 3).map((tag) => (
                      <Badge
                        className="bg-green-100 text-green-700 text-[10px] uppercase font-black tracking-widest border-green-200"
                        key={tag}
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  {item.title && (
                    <h3 className="text-sm font-black uppercase tracking-[0.4em] text-green-600 mb-2 font-sans">
                      {item.title[locale] || item.title["en"]}
                    </h3>
                  )}

                  <h2 className="text-3xl md:text-5xl font-black leading-tight font-serif text-[#064e3b]">
                    {item.text[locale] || item.text["en"]}
                  </h2>

                  {item.source && (
                    <div className="flex items-center gap-3 text-green-800/40 font-bold tracking-tighter font-sans text-lg">
                      <Book className="w-5 h-5" />—{" "}
                      {item.source?.[locale] || item.source?.["en"]}
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-12 pt-10 border-t border-green-200">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#064e3b]/30 flex items-center gap-2 font-sans">
                      <ExternalLink className="w-3 h-3" /> The Context
                    </h4>
                    <p className="text-green-900/80 font-medium leading-relaxed font-sans text-lg">
                      {item.explanation?.[locale] || item.explanation?.["en"]}
                    </p>
                  </div>
                  {item.application && (
                    <div className="space-y-4 p-8 bg-green-50/50 rounded-3xl border border-green-100/50">
                      <h4 className="text-xs font-black uppercase tracking-widest text-green-600 font-sans">
                        Implementation
                      </h4>
                      <div className="text-green-800 font-serif leading-relaxed text-lg">
                        {item.application[locale] || item.application["en"]}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </article>
          </section>
        ))}
        <section className="snap-start min-h-dvh flex flex-col items-center justify-center p-6 md:p-12 relative">
          {children}
        </section>
      </main>
    );
  },
  {
    message:
      "The imperial archives are currently sealed. Please request access again.",
    title: "Archive Unavailable",
  },
);
